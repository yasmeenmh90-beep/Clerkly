import logging

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import RedirectResponse
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.auth_dependencies import get_current_user
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
    """
    Returns the Google consent screen URL for the current user.
    The frontend should redirect the browser to this URL —
    this endpoint itself does not redirect, since it is called
    via fetch/JSON from the Settings page, not a full page load.
    """

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
    """
    Google redirects the user's browser here after they approve
    (or deny) access. This endpoint is hit directly by the
    browser, not by the frontend's JS — there is no Authorization
    header available, which is why the signed state token is
    what identifies the user instead.
    """

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
):
    """
    Fetches recent emails for the current user and runs each
    one through the same document intake pipeline as manual
    uploads (Document Analyzer -> Planner -> Task), then
    persists the resulting tasks the same way intake_document
    does.
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
            **task.model_dump(),
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
            # Task ID collision on this one email — skip it and
            # keep processing the rest of the sync rather than
            # failing the whole request.
            database.rollback()

            logger.warning(
                "Skipped a task from Gmail sync due to a "
                "duplicate task_id"
            )

    return saved_tasks