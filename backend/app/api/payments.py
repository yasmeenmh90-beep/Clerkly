import logging

import stripe
from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Request,
)
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth_dependencies import (
    CurrentOrganization,
    get_current_organization,
)
from app.config import settings
from app.database import get_db
from app.models.payment import CheckoutSessionResponse
from app.models.task_record import TaskRecord
from app.services.audit_service import record_task_event
from app.services.payment_service import (
    InvalidPaymentTask,
    PaymentProviderError,
    PaymentProviderNotConfigured,
    create_checkout_session,
)


logger = logging.getLogger(__name__)


router = APIRouter(
    prefix="/tasks",
    tags=["Payments"],
)


webhook_router = APIRouter(
    prefix="/payments",
    tags=["Payments"],
)


def find_org_task_or_404(
    task_id: str,
    organization_id: str,
    database: Session,
) -> TaskRecord:
    statement = select(TaskRecord).where(
        TaskRecord.task_id == task_id,
        TaskRecord.organization_id == organization_id,
    )

    task = database.scalar(statement)

    if task is None:
        raise HTTPException(
            status_code=404,
            detail="Task not found",
        )

    return task


@router.post(
    "/{task_id}/checkout-session",
    response_model=CheckoutSessionResponse,
)
def create_task_checkout_session(
    task_id: str,
    database: Session = Depends(get_db),
    current_organization: CurrentOrganization = Depends(
        get_current_organization
    ),
) -> CheckoutSessionResponse:
    task = find_org_task_or_404(
        task_id=task_id,
        organization_id=(
            current_organization.organization.organization_id
        ),
        database=database,
    )

    is_new_session = (
        task.provider_session_id is None
    )

    try:
        checkout = create_checkout_session(task)

    except PaymentProviderNotConfigured as error:
        raise HTTPException(
            status_code=503,
            detail=str(error),
        ) from error

    except InvalidPaymentTask as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        ) from error

    except PaymentProviderError as error:
        logger.exception(
            "Stripe Checkout failed for task %s",
            task.task_id,
        )

        raise HTTPException(
            status_code=502,
            detail=str(error),
        ) from error

    task.payment_provider = "stripe"
    task.provider_session_id = (
        checkout.session_id
    )
    task.payment_status = checkout.payment_status

    if is_new_session:
        record_task_event(
            database=database,
            task_id=task.task_id,
            event_type="payment_checkout_created",
            previous_status=task.status,
            new_status=task.status,
            message=(
                "Stripe Sandbox Checkout Session created"
            ),
        )

    try:
        database.commit()
        database.refresh(task)

    except Exception as error:
        database.rollback()

        logger.exception(
            "Unable to save Stripe Checkout information "
            "for task %s",
            task.task_id,
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to save payment session",
        ) from error

    return CheckoutSessionResponse(
        provider="stripe",
        session_id=checkout.session_id,
        checkout_url=checkout.checkout_url,
        payment_status=checkout.payment_status,
    )


def find_task_for_checkout_session(
    database: Session,
    session_id: str,
    task_id: str | None,
) -> TaskRecord | None:
    statement = select(TaskRecord).where(
        TaskRecord.provider_session_id
        == session_id
    )

    task = database.scalar(statement)

    if task is not None:
        return task

    if task_id:
        task = database.get(
            TaskRecord,
            task_id,
        )

        if (
            task is not None
            and task.payment_provider == "stripe"
        ):
            return task

    return None


def get_payment_intent_id(
    checkout_session: object,
) -> str | None:
    payment_intent = getattr(
        checkout_session,
        "payment_intent",
        None,
    )

    if isinstance(payment_intent, str):
        return payment_intent

    payment_intent_id = getattr(
        payment_intent,
        "id",
        None,
    )

    if isinstance(payment_intent_id, str):
        return payment_intent_id

    return None


def handle_successful_checkout(
    database: Session,
    checkout_session: object,
) -> None:
    session_id = getattr(
        checkout_session,
        "id",
        None,
    )

    if not isinstance(session_id, str):
        logger.warning(
            "Stripe webhook session did not contain an ID"
        )
        return

    metadata = getattr(
        checkout_session,
        "metadata",
        None,
    )

    task_id: str | None = None

    if metadata is not None:
        if isinstance(metadata, dict):
            task_id = metadata.get(
                "clerkly_task_id"
            )
        else:
            task_id = getattr(
                metadata,
                "clerkly_task_id",
                None,
            )

    task = find_task_for_checkout_session(
        database=database,
        session_id=session_id,
        task_id=task_id,
    )

    if task is None:
        logger.warning(
            "No Clerkly task found for Stripe "
            "Checkout Session %s",
            session_id,
        )
        return

    payment_status = getattr(
        checkout_session,
        "payment_status",
        None,
    )

    if payment_status != "paid":
        task.payment_status = (
            payment_status or "unpaid"
        )
        database.commit()
        return

    if task.payment_status == "paid":
        logger.info(
            "Stripe payment already processed "
            "for task %s",
            task.task_id,
        )
        return

    previous_task_status = task.status

    task.payment_provider = "stripe"
    task.provider_session_id = session_id
    task.payment_intent_id = (
        get_payment_intent_id(
            checkout_session
        )
    )
    task.payment_status = "paid"

    if task.requires_signature:
        new_task_status = previous_task_status
        message = (
            "Stripe payment confirmed; "
            "signature is still required"
        )
    else:
        task.status = "completed"
        task.approval_required = False

        new_task_status = "completed"
        message = (
            "Stripe payment confirmed and "
            "task completed"
        )

    record_task_event(
        database=database,
        task_id=task.task_id,
        event_type="payment_completed",
        previous_status=previous_task_status,
        new_status=new_task_status,
        message=message,
    )

    database.commit()

    logger.info(
        "Stripe payment confirmed for task %s",
        task.task_id,
    )


def handle_failed_checkout(
    database: Session,
    checkout_session: object,
) -> None:
    session_id = getattr(
        checkout_session,
        "id",
        None,
    )

    if not isinstance(session_id, str):
        return

    metadata = getattr(
        checkout_session,
        "metadata",
        None,
    )

    task_id: str | None = None

    if metadata is not None:
        if isinstance(metadata, dict):
            task_id = metadata.get(
                "clerkly_task_id"
            )
        else:
            task_id = getattr(
                metadata,
                "clerkly_task_id",
                None,
            )

    task = find_task_for_checkout_session(
        database=database,
        session_id=session_id,
        task_id=task_id,
    )

    if task is None:
        logger.warning(
            "No Clerkly task found for failed "
            "Stripe session %s",
            session_id,
        )
        return

    if task.payment_status == "failed":
        return

    task.payment_status = "failed"

    record_task_event(
        database=database,
        task_id=task.task_id,
        event_type="payment_failed",
        previous_status=task.status,
        new_status=task.status,
        message="Stripe payment failed",
    )

    database.commit()

    logger.warning(
        "Stripe payment failed for task %s",
        task.task_id,
    )


@webhook_router.post("/webhook")
async def stripe_webhook(
    request: Request,
    database: Session = Depends(get_db),
) -> dict[str, bool]:
    webhook_secret = (
        settings.stripe_webhook_secret
    )

    if not webhook_secret:
        raise HTTPException(
            status_code=503,
            detail=(
                "Stripe webhook is not configured"
            ),
        )

    payload = await request.body()

    signature = request.headers.get(
        "Stripe-Signature"
    )

    if not signature:
        raise HTTPException(
            status_code=400,
            detail=(
                "Stripe-Signature header is missing"
            ),
        )

    try:
        event = stripe.Webhook.construct_event(
            payload=payload,
            sig_header=signature,
            secret=webhook_secret,
        )

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail="Invalid Stripe webhook payload",
        ) from error

    except stripe.SignatureVerificationError as error:
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid Stripe webhook signature"
            ),
        ) from error

    event_type = event.type
    checkout_session = event.data.object

    try:
        if event_type in {
            "checkout.session.completed",
            "checkout.session.async_payment_succeeded",
        }:
            handle_successful_checkout(
                database=database,
                checkout_session=checkout_session,
            )

        elif (
            event_type
            == "checkout.session.async_payment_failed"
        ):
            handle_failed_checkout(
                database=database,
                checkout_session=checkout_session,
            )

        else:
            logger.info(
                "Ignoring Stripe event %s",
                event_type,
            )

    except Exception:
        database.rollback()

        logger.exception(
            "Unable to process Stripe event %s",
            event_type,
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Unable to process Stripe webhook"
            ),
        )

    return {
        "received": True,
    }
