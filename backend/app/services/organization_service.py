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
VALID_ROLES = {"owner", "admin", "member"}


class OrganizationNotFound(Exception):
    """Raised when an organization_id doesn't exist."""


class NotOrganizationMember(Exception):
    """Raised when a user is not a member of the organization
    they're trying to act on."""


class InsufficientPermission(Exception):
    """Raised when a member's role doesn't allow the requested
    action — only owner/admin can invite or remove members."""


class InviteNotFound(Exception):
    """Raised when an invite token or ID doesn't match any
    invite."""


class InviteExpired(Exception):
    """Raised when an invite's expiry has passed."""


class InviteAlreadyAccepted(Exception):
    """Raised when trying to accept, cancel, or resend an
    invite that's already been accepted."""


class InvalidRole(Exception):
    """Raised when a role isn't one of owner/admin/member."""


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


def get_invite_preview(
    database: Session,
    token: str,
) -> tuple[OrganizationInviteRecord, OrganizationRecord]:
    """
    Looks up an invite by its token without requiring the
    lookup to be authenticated as a member of that
    organization — used by the accept-invite page to show
    "you're invited to join X as Y" before the person logs in
    or accepts.
    """

    invite = database.scalar(
        select(OrganizationInviteRecord).where(
            OrganizationInviteRecord.token == token
        )
    )

    if invite is None:
        raise InviteNotFound("This invite link is not valid")

    organization = database.get(
        OrganizationRecord, invite.organization_id
    )

    if organization is None:
        raise OrganizationNotFound(
            "The organization for this invite no longer exists"
        )

    return invite, organization


def list_pending_invites(
    database: Session,
    organization_id: str,
) -> list[OrganizationInviteRecord]:
    """
    Every invite for this org that hasn't been accepted yet —
    includes expired ones, so the UI can show "expired" as a
    status rather than the invite just silently disappearing.
    """

    statement = (
        select(OrganizationInviteRecord)
        .where(
            OrganizationInviteRecord.organization_id
            == organization_id,
            OrganizationInviteRecord.accepted_at.is_(None),
        )
        .order_by(
            OrganizationInviteRecord.created_at.desc()
        )
    )

    return list(database.scalars(statement).all())


def cancel_invite(
    database: Session,
    organization: OrganizationRecord,
    invite_id: str,
    cancelled_by: UserRecord,
) -> None:
    _require_manage_permission(
        database,
        organization.organization_id,
        cancelled_by,
    )

    invite = database.get(
        OrganizationInviteRecord, invite_id
    )

    if (
        invite is None
        or invite.organization_id
        != organization.organization_id
    ):
        raise InviteNotFound(
            "No pending invite found with this ID"
        )

    if invite.accepted_at is not None:
        raise InviteAlreadyAccepted(
            "This invite has already been accepted and can't "
            "be cancelled"
        )

    database.delete(invite)
    database.commit()


def resend_invite(
    database: Session,
    organization: OrganizationRecord,
    invite_id: str,
    resent_by: UserRecord,
) -> OrganizationInviteRecord:
    """
    Refreshes the invite's expiry to another 7 days out and
    re-sends the email. Reuses the same token rather than
    generating a new one, so a link the person already has
    open in their inbox keeps working.
    """

    _require_manage_permission(
        database,
        organization.organization_id,
        resent_by,
    )

    invite = database.get(
        OrganizationInviteRecord, invite_id
    )

    if (
        invite is None
        or invite.organization_id
        != organization.organization_id
    ):
        raise InviteNotFound(
            "No pending invite found with this ID"
        )

    if invite.accepted_at is not None:
        raise InviteAlreadyAccepted(
            "This invite has already been accepted"
        )

    from app.models.organization_invite_record import (
        INVITE_EXPIRY_DAYS,
    )
    from datetime import timedelta

    invite.expires_at = datetime.now(timezone.utc) + timedelta(
        days=INVITE_EXPIRY_DAYS
    )

    database.commit()
    database.refresh(invite)

    try:
        send_organization_invite_email(
            to_email=invite.invited_email,
            organization_name=organization.name,
            invited_by_name=(
                resent_by.full_name or resent_by.email
            ),
            token=invite.token,
        )
    except NotificationNotConfigured as error:
        logger.warning(
            "Could not resend invite email for organization "
            "%s: %s",
            organization.organization_id,
            error,
        )

    return invite


def update_member_role(
    database: Session,
    organization: OrganizationRecord,
    user_id: str,
    new_role: str,
    updated_by: UserRecord,
) -> OrganizationMemberRecord:
    _require_manage_permission(
        database,
        organization.organization_id,
        updated_by,
    )

    if new_role not in VALID_ROLES:
        raise InvalidRole(
            f"'{new_role}' is not a valid role"
        )

    if user_id == organization.owner_id:
        raise InsufficientPermission(
            "The organization owner's role can't be changed"
        )

    membership = get_membership(
        database, organization.organization_id, user_id
    )

    if membership is None:
        raise NotOrganizationMember(
            "This user is not a member of this organization"
        )

    membership.role = new_role

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