import base64
import hashlib
import hmac
import logging

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from fastapi.responses import RedirectResponse
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth_dependencies import (
    CurrentOrganization,
    get_current_organization,
    get_current_user,
)
from app.config import settings
from app.database import get_db
from app.models.task import Task
from app.models.task_record import TaskRecord
from app.models.user_record import UserRecord
from app.services.signature_service import (
    DocuSignNotConfigured,
    InvalidOAuthState,
    SignatureTaskError,
    build_authorization_url,
    create_signature_envelope,
    handle_envelope_completed,
    handle_oauth_callback,
)


logger = logging.getLogger(__name__)


router = APIRouter(
    prefix="/intake/signature",
    tags=["Signature Intake"],
)


def _find_org_task_or_404(
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


@router.get(
    "/connect",
    responses={
        503: {
            "description": "DocuSign is not configured",
        },
    },
)
def connect_docusign(
    current_user: UserRecord = Depends(get_current_user),
):
    try:
        authorization_url = build_authorization_url(
            current_user.user_id
        )

    except DocuSignNotConfigured as error:
        raise HTTPException(
            status_code=503,
            detail=(
                "Signature intake is not configured on "
                "this server."
            ),
        ) from error

    return {"authorization_url": authorization_url}


@router.get(
    "/callback",
    include_in_schema=False,
)
def docusign_oauth_callback(
    code: str = Query(...),
    state: str = Query(...),
    database: Session = Depends(get_db),
):
    try:
        handle_oauth_callback(
            code=code,
            state=state,
            database=database,
        )

    except InvalidOAuthState as error:
        logger.warning(
            "DocuSign OAuth callback rejected: %s", error
        )

        return RedirectResponse(
            url=(
                f"{settings.frontend_url}"
                "/settings?docusign=error"
            ),
        )

    except DocuSignNotConfigured as error:
        logger.error(
            "DocuSign OAuth callback failed, not "
            "configured: %s",
            error,
        )

        return RedirectResponse(
            url=(
                f"{settings.frontend_url}"
                "/settings?docusign=error"
            ),
        )

    return RedirectResponse(
        url=(
            f"{settings.frontend_url}"
            "/settings?docusign=connected"
        ),
    )


@router.post(
    "/tasks/{task_id}/send",
    response_model=Task,
    responses={
        400: {
            "description": (
                "Task is not eligible to be sent for signature"
            ),
        },
        503: {
            "description": (
                "DocuSign is not connected for this account"
            ),
        },
    },
)
def send_task_for_signature(
    task_id: str,
    database: Session = Depends(get_db),
    current_user: UserRecord = Depends(get_current_user),
    current_organization: CurrentOrganization = Depends(
        get_current_organization
    ),
):
    """
    Sends an approved, signature-requiring task out for
    signature via DocuSign sandbox. current_user is still
    needed here (not just current_organization) because
    create_signature_envelope uses it for the signer's real
    email address.
    """

    task = _find_org_task_or_404(
        task_id=task_id,
        organization_id=(
            current_organization.organization.organization_id
        ),
        database=database,
    )

    try:
        create_signature_envelope(
            task=task,
            user=current_user,
            database=database,
        )

    except SignatureTaskError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        ) from error

    except DocuSignNotConfigured as error:
        raise HTTPException(
            status_code=503,
            detail=(
                "DocuSign is not connected for this account. "
                "Connect DocuSign in Settings first."
            ),
        ) from error

    return task


def _verify_connect_signature(
    payload: bytes,
    signature_header: str | None,
) -> bool:
    if not settings.docusign_connect_hmac_key:
        return False

    if not signature_header:
        return False

    computed_digest = hmac.new(
        settings.docusign_connect_hmac_key.encode("utf-8"),
        payload,
        hashlib.sha256,
    ).digest()

    computed_signature = base64.b64encode(
        computed_digest
    ).decode("utf-8")

    return hmac.compare_digest(
        computed_signature,
        signature_header,
    )


@router.post(
    "/webhook",
    include_in_schema=False,
)
async def docusign_connect_webhook(
    request: Request,
    database: Session = Depends(get_db),
) -> dict[str, bool]:
    if not settings.docusign_connect_hmac_key:
        raise HTTPException(
            status_code=503,
            detail=(
                "DocuSign Connect webhook is not configured"
            ),
        )

    payload = await request.body()

    signature_header = request.headers.get(
        "X-DocuSign-Signature-1"
    )

    if not _verify_connect_signature(
        payload, signature_header
    ):
        raise HTTPException(
            status_code=400,
            detail="Invalid DocuSign Connect signature",
        )

    body = await request.json()

    envelope_id = (
        body.get("envelopeId")
        or body.get("data", {}).get("envelopeId")
    )

    raw_status = (
        body.get("status")
        or body.get("event")
        or body.get("data", {}).get("envelopeSummary", {})
        .get("status")
        or ""
    )

    normalized_status = raw_status.lower()

    if "complet" in normalized_status:
        envelope_status = "completed"
    elif "declin" in normalized_status:
        envelope_status = "declined"
    elif "void" in normalized_status:
        envelope_status = "voided"
    else:
        envelope_status = normalized_status

    if not envelope_id:
        logger.warning(
            "DocuSign Connect webhook payload missing "
            "envelopeId"
        )
        return {"received": True}

    try:
        handle_envelope_completed(
            database=database,
            envelope_id=envelope_id,
            envelope_status=envelope_status,
        )

    except Exception:
        database.rollback()

        logger.exception(
            "Unable to process DocuSign Connect webhook "
            "for envelope %s",
            envelope_id,
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Unable to process DocuSign Connect webhook"
            ),
        )

    return {"received": True}
