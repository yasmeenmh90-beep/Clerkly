from dataclasses import dataclass
from typing import Optional

from fastapi import Depends, Header, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.organization_member_record import (
    OrganizationMemberRecord,
)
from app.models.organization_record import OrganizationRecord
from app.models.user_record import UserRecord
from app.services.auth_service import decode_access_token


oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/auth/token"
)


def get_current_user(
    token: str = Depends(oauth2_scheme),
    database: Session = Depends(get_db),
) -> UserRecord:
    credentials_error = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={
            "WWW-Authenticate": "Bearer",
        },
    )

    try:
        user_id = decode_access_token(token)
    except ValueError as error:
        raise credentials_error from error

    user = database.get(UserRecord, user_id)

    if user is None or not user.is_active:
        raise credentials_error

    return user


@dataclass
class CurrentOrganization:
    """
    Bundles the resolved organization together with the
    current user's role in it — most endpoints need both:
    which org a task belongs to, and whether this user is
    allowed to act on it.
    """

    organization: OrganizationRecord
    role: str


def get_current_organization(
    x_organization_id: Optional[str] = Header(
        default=None,
        alias="X-Organization-ID",
    ),
    current_user: UserRecord = Depends(get_current_user),
    database: Session = Depends(get_db),
) -> CurrentOrganization:
    """
    Resolves which organization the current request is acting
    within. If no X-Organization-ID header is sent, defaults to
    the user's earliest membership — in practice, their
    auto-created personal organization from the Phase 1
    migration — so existing single-user flows keep working
    completely unchanged.

    A user requesting an organization they don't belong to gets
    a 404, same convention used everywhere else in this app for
    cross-user access (never reveal whether the resource exists
    to someone who can't see it).
    """

    if x_organization_id is not None:
        membership = database.scalar(
            select(OrganizationMemberRecord).where(
                OrganizationMemberRecord.organization_id
                == x_organization_id,
                OrganizationMemberRecord.user_id
                == current_user.user_id,
            )
        )

        if membership is None:
            raise HTTPException(
                status_code=404,
                detail="Organization not found",
            )

    else:
        membership = database.scalar(
            select(OrganizationMemberRecord)
            .where(
                OrganizationMemberRecord.user_id
                == current_user.user_id,
            )
            .order_by(
                OrganizationMemberRecord.joined_at.asc()
            )
        )

        if membership is None:
            raise HTTPException(
                status_code=500,
                detail=(
                    "This account has no organization. This "
                    "should never happen for a normally "
                    "registered user."
                ),
            )

    organization = database.get(
        OrganizationRecord, membership.organization_id
    )

    if organization is None:
        raise HTTPException(
            status_code=404,
            detail="Organization not found",
        )

    return CurrentOrganization(
        organization=organization,
        role=membership.role,
    )
