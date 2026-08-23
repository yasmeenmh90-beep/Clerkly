import logging
from datetime import datetime, timezone
from uuid import uuid4

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.organization_invite_record import (
    OrganizationInviteRecord,
)
from app.models.organization_member_record import (
    OrganizationMemberRecord,
)
from app.models.organization_record import OrganizationRecord
from app.models.user_record import UserRecord
from app.services.notification_service import (
    NotificationNotConfigured,
    send_organization_invite_email,
)


logger = logging.getLogger(__name__)

MANAGE_ROLES = {"owner", "admin"}


class OrganizationNotFound(Exception):
    """Raised when an organization_id doesn't exist."""


class NotOrganizationMember(Exception):
    """Raised when a user is not a member of the organization
    they're trying to act on."""


class InsufficientPermission(Exception):
    """Raised when a member's role doesn't allow the requested
    action — only owner/admin can invite or remove members."""


class InviteNotFound(Exception):
    """Raised when an invite token doesn't match any invite."""


class InviteExpired(Exception):
    """Raised when an invite's expiry has passed."""


class InviteAlreadyAccepted(Exception):
    """Raised when trying to accept an invite twice."""


def create_organization(
    database: Session,
    user: UserRecord,
    name: str,
) -> OrganizationRecord:
    organization = OrganizationRecord(
        organization_id=str(uuid4()),
        name=name,
        owner_id=user.user_id,
    )

    database.add(organization)
    database.flush()

    membership = OrganizationMemberRecord(
        membership_id=str(uuid4()),
        organization_id=organization.organization_id,
        user_id=user.user_id,
        role="owner",
    )

    database.add(membership)
    database.commit()
    database.refresh(organization)

    return organization


def get_user_organizations(
    database: Session,
    user: UserRecord,
) -> list[OrganizationRecord]:
    statement = (
        select(OrganizationRecord)
        .join(
            OrganizationMemberRecord,
            OrganizationMemberRecord.organization_id
            == OrganizationRecord.organization_id,
        )
        .where(
            OrganizationMemberRecord.user_id == user.user_id
        )
        .order_by(OrganizationMemberRecord.joined_at.asc())
    )

    return list(database.scalars(statement).all())


def get_membership(
    database: Session,
    organization_id: str,
    user_id: str,
) -> OrganizationMemberRecord | None:
    return database.scalar(
        select(OrganizationMemberRecord).where(
            OrganizationMemberRecord.organization_id
            == organization_id,
            OrganizationMemberRecord.user_id == user_id,
        )
    )


def _require_manage_permission(
    database: Session,
    organization_id: str,
    acting_user: UserRecord,
) -> None:
    membership = get_membership(
        database, organization_id, acting_user.user_id
    )

    if membership is None:
        raise NotOrganizationMember(
            "You are not a member of this organization"
        )

    if membership.role not in MANAGE_ROLES:
        raise InsufficientPermission(
            "Only an owner or admin can do this"
        )


def invite_member(
    database: Session,
    organization: OrganizationRecord,
    invited_email: str,
    role: str,
    invited_by: UserRecord,
) -> OrganizationInviteRecord:
    _require_manage_permission(
        database,
        organization.organization_id,
        invited_by,
    )

    invite = OrganizationInviteRecord(
        invite_id=str(uuid4()),
        organization_id=organization.organization_id,
        invited_email=invited_email,
        role=role,
        invited_by=invited_by.user_id,
    )

    database.add(invite)
    database.commit()
    database.refresh(invite)

    try:
        send_organization_invite_email(
            to_email=invited_email,
            organization_name=organization.name,
            invited_by_name=(
                invited_by.full_name or invited_by.email
            ),
            token=invite.token,
        )
    except NotificationNotConfigured as error:
        logger.warning(
            "Could not send invite email for organization "
            "%s: %s",
            organization.organization_id,
            error,
        )

    return invite


def accept_invite(
    database: Session,
    token: str,
    accepting_user: UserRecord,
) -> OrganizationMemberRecord:
    invite = database.scalar(
        select(OrganizationInviteRecord).where(
            OrganizationInviteRecord.token == token
        )
    )

    if invite is None:
        raise InviteNotFound("This invite link is not valid")

    existing_membership = get_membership(
        database,
        invite.organization_id,
        accepting_user.user_id,
    )

    if existing_membership is not None:
        return existing_membership

    if invite.accepted_at is not None:
        raise InviteAlreadyAccepted(
            "This invite has already been used"
        )

    expires_at = invite.expires_at

    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)

    if expires_at <= datetime.now(timezone.utc):
        raise InviteExpired("This invite link has expired")

    membership = OrganizationMemberRecord(
        membership_id=str(uuid4()),
        organization_id=invite.organization_id,
        user_id=accepting_user.user_id,
        role=invite.role,
    )

    invite.accepted_at = datetime.now(timezone.utc)

    database.add(membership)
    database.commit()
    database.refresh(membership)

    return membership


def remove_member(
    database: Session,
    organization: OrganizationRecord,
    user_id_to_remove: str,
    removed_by: UserRecord,
) -> None:
    _require_manage_permission(
        database,
        organization.organization_id,
        removed_by,
    )

    if user_id_to_remove == organization.owner_id:
        raise InsufficientPermission(
            "The organization owner cannot be removed"
        )

    membership = get_membership(
        database,
        organization.organization_id,
        user_id_to_remove,
    )

    if membership is None:
        raise NotOrganizationMember(
            "This user is not a member of this organization"
        )

    database.delete(membership)
    database.commit()
