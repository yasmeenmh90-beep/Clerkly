import logging

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import RedirectResponse
from sqlalchemy.exc import IntegrityError
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
from app.services.audit_service import record_task_event
from app.services.email_intake_service import (
    GoogleOAuthNotConfigured,
    InvalidOAuthState,
    build_authorization_url,
    handle_oauth_callback,
    sync_gmail_for_user,
)


logger = logging.getLogger(__name__)


router = APIRouter(
    prefix="/intake/email",
    tags=["Email Intake"],
)


@router.get(
    "/connect",
    responses={
        503: {
            "description": "Gmail OAuth is not configured",
        },
    },
)
def connect_gmail(
    current_user: UserRecord = Depends(get_current_user),
):
    try:
        authorization_url = build_authorization_url(
            current_user.user_id
        )

    except GoogleOAuthNotConfigured as error:
        raise HTTPException(
            status_code=503,
            detail=(
                "Email intake is not configured on this server."
            ),
        ) from error

    return {"authorization_url": authorization_url}


@router.get(
    "/callback",
    include_in_schema=False,
)
def gmail_oauth_callback(
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
        logger.warning("Gmail OAuth callback rejected: %s", error)

        return RedirectResponse(
            url=f"{settings.frontend_url}/settings?gmail=error",
        )

    except GoogleOAuthNotConfigured as error:
        logger.error(
            "Gmail OAuth callback failed, not configured: %s",
            error,
        )

        return RedirectResponse(
            url=f"{settings.frontend_url}/settings?gmail=error",
        )

    return RedirectResponse(
        url=f"{settings.frontend_url}/settings?gmail=connected",
    )


@router.post(
    "/sync",
    response_model=list[Task],
    responses={
        503: {
            "description": (
                "Gmail is not connected or the sync service "
                "is unavailable"
            ),
        },
    },
)
def sync_email(
    database: Session = Depends(get_db),
    current_user: UserRecord = Depends(get_current_user),
    current_organization: CurrentOrganization = Depends(
        get_current_organization
    ),
):
    """
    Fetches recent emails for the current user and runs each
    one through the same document intake pipeline as manual
    uploads (Document Analyzer -> Planner -> Task), then
    persists the resulting tasks the same way intake_document
    does — including stamping organization_id, so synced tasks
    are visible to the whole organization, not just the person
    who ran the sync.
    """

    try:
        created_tasks = sync_gmail_for_user(
            user=current_user,
            database=database,
        )

    except GoogleOAuthNotConfigured as error:
        raise HTTPException(
            status_code=503,
            detail=(
                "Gmail is not connected for this account. "
                "Connect Gmail in Settings first."
            ),
        ) from error

    saved_tasks: list[TaskRecord] = []

    for task in created_tasks:
        task_record = TaskRecord(
            owner_id=current_user.user_id,
            organization_id=(
                current_organization.organization
                .organization_id
            ),
            **task.model_dump(
                exclude={
                    "owner_name",
                    "owner_email",
                    "approved_by_name",
                    "approved_by_email",
                }
            ),
        )

        try:
            database.add(task_record)

            record_task_event(
                database=database,
                task_id=task_record.task_id,
                event_type="task_created",
                previous_status=None,
                new_status=task_record.status,
                message="Task created from Gmail sync",
            )

            database.commit()
            database.refresh(task_record)

            saved_tasks.append(task_record)

        except IntegrityError:
            database.rollback()

            logger.warning(
                "Skipped a task from Gmail sync due to a "
                "duplicate task_id"
            )

    return saved_tasks
