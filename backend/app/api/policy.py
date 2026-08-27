from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth_dependencies import get_current_user
from app.config import settings
from app.database import get_db
from app.models.policy import (
    AcceptPolicyRequest,
    PolicyAcceptanceResponse,
    PolicyStatus,
)
from app.models.user_record import UserRecord
from app.services import policy_service


router = APIRouter(
    prefix="/policy",
    tags=["Policy"],
)


@router.get("/status", response_model=PolicyStatus)
def get_policy_status(
    database: Session = Depends(get_db),
    current_user: UserRecord = Depends(get_current_user),
):
    """
    Tells the frontend whether the logged-in user needs to be
    shown the accept-policy prompt — either because they've
    never accepted anything, or because the current version has
    moved past whatever they last accepted.
    """

    latest = policy_service.get_latest_acceptance(
        database=database,
        user_id=current_user.user_id,
    )

    return PolicyStatus(
        current_version=settings.current_policy_version,
        has_accepted_current_version=(
            policy_service.has_accepted_current_version(
                database=database,
                user_id=current_user.user_id,
            )
        ),
        accepted_version=(
            latest.policy_version if latest else None
        ),
        accepted_at=latest.accepted_at if latest else None,
    )


@router.post(
    "/accept",
    response_model=PolicyAcceptanceResponse,
    status_code=201,
)
def accept_policy(
    body: AcceptPolicyRequest,
    database: Session = Depends(get_db),
    current_user: UserRecord = Depends(get_current_user),
):
    """
    Records that the current user has accepted a specific
    policy version. The frontend should call this right after
    registration, and again any time /policy/status reports
    has_accepted_current_version as False.
    """

    acceptance = policy_service.record_acceptance(
        database=database,
        user_id=current_user.user_id,
        policy_version=body.policy_version,
    )

    return PolicyAcceptanceResponse(
        policy_version=acceptance.policy_version,
        accepted_at=acceptance.accepted_at,
    )