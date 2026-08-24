import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth_dependencies import (
    CurrentOrganization,
    get_current_organization,
    get_current_user,
)
from app.database import get_db
from app.models.organization import (
    CreateOrganizationRequest,
    InviteMemberRequest,
    Organization,
    OrganizationInvite,
    OrganizationInvitePreview,
    OrganizationMember,
    OrganizationWithRole,
    UpdateMemberRoleRequest,
)
from app.models.organization_member_record import (
    OrganizationMemberRecord,
)
from app.models.user_record import UserRecord
from app.services import organization_service


logger = logging.getLogger(__name__)


router = APIRouter(
    prefix="/organizations",
    tags=["Organizations"],
)


@router.get("/", response_model=list[OrganizationWithRole])
def list_my_organizations(
    database: Session = Depends(get_db),
    current_user: UserRecord = Depends(get_current_user),
):
    organizations = organization_service.get_user_organizations(
        database=database,
        user=current_user,
    )

    results: list[OrganizationWithRole] = []

    for organization in organizations:
        membership = organization_service.get_membership(
            database=database,
            organization_id=organization.organization_id,
            user_id=current_user.user_id,
        )

        results.append(
            OrganizationWithRole(
                organization_id=organization.organization_id,
                name=organization.name,
                owner_id=organization.owner_id,
                created_at=organization.created_at,
                role=membership.role if membership else "member",
            )
        )

    return results


@router.post("/", response_model=Organization, status_code=201)
def create_new_organization(
    body: CreateOrganizationRequest,
    database: Session = Depends(get_db),
    current_user: UserRecord = Depends(get_current_user),
):
    return organization_service.create_organization(
        database=database,
        user=current_user,
        name=body.name,
    )


@router.get(
    "/members",
    response_model=list[OrganizationMember],
)
def list_current_organization_members(
    database: Session = Depends(get_db),
    current_organization: CurrentOrganization = Depends(
        get_current_organization
    ),
):
    statement = (
        select(OrganizationMemberRecord, UserRecord)
        .join(
            UserRecord,
            UserRecord.user_id
            == OrganizationMemberRecord.user_id,
        )
        .where(
            OrganizationMemberRecord.organization_id
            == current_organization.organization.organization_id
        )
        .order_by(OrganizationMemberRecord.joined_at.asc())
    )

    rows = database.execute(statement).all()

    return [
        OrganizationMember(
            membership_id=membership.membership_id,
            organization_id=membership.organization_id,
            user_id=membership.user_id,
            role=membership.role,
            joined_at=membership.joined_at,
            email=user.email,
            full_name=user.full_name,
        )
        for membership, user in rows
    ]


@router.patch(
    "/members/{user_id}",
    response_model=OrganizationMember,
    responses={
        403: {
            "description": (
                "Only an owner or admin can change roles, and "
                "the owner's role can't be changed"
            ),
        },
        404: {
            "description": (
                "This user is not a member of this organization"
            ),
        },
    },
)
def update_organization_member_role(
    user_id: str,
    body: UpdateMemberRoleRequest,
    database: Session = Depends(get_db),
    current_user: UserRecord = Depends(get_current_user),
    current_organization: CurrentOrganization = Depends(
        get_current_organization
    ),
):
    try:
        membership = organization_service.update_member_role(
            database=database,
            organization=current_organization.organization,
            user_id=user_id,
            new_role=body.role,
            updated_by=current_user,
        )

    except organization_service.InsufficientPermission as error:
        raise HTTPException(
            status_code=403,
            detail=str(error),
        ) from error

    except organization_service.NotOrganizationMember as error:
        raise HTTPException(
            status_code=404,
            detail=str(error),
        ) from error

    user = database.get(UserRecord, membership.user_id)

    return OrganizationMember(
        membership_id=membership.membership_id,
        organization_id=membership.organization_id,
        user_id=membership.user_id,
        role=membership.role,
        joined_at=membership.joined_at,
        email=user.email,
        full_name=user.full_name,
    )


@router.delete(
    "/members/{user_id}",
    status_code=204,
    responses={
        403: {
            "description": (
                "Only an owner or admin can remove members, "
                "and the owner cannot be removed"
            ),
        },
        404: {
            "description": (
                "This user is not a member of this organization"
            ),
        },
    },
)
def remove_organization_member(
    user_id: str,
    database: Session = Depends(get_db),
    current_user: UserRecord = Depends(get_current_user),
    current_organization: CurrentOrganization = Depends(
        get_current_organization
    ),
):
    try:
        organization_service.remove_member(
            database=database,
            organization=current_organization.organization,
            user_id_to_remove=user_id,
            removed_by=current_user,
        )

    except organization_service.InsufficientPermission as error:
        raise HTTPException(
            status_code=403,
            detail=str(error),
        ) from error

    except organization_service.NotOrganizationMember as error:
        raise HTTPException(
            status_code=404,
            detail=str(error),
        ) from error


@router.get(
    "/invites",
    response_model=list[OrganizationInvite],
)
def list_pending_invites(
    database: Session = Depends(get_db),
    current_organization: CurrentOrganization = Depends(
        get_current_organization
    ),
):
    return organization_service.list_pending_invites(
        database=database,
        organization_id=(
            current_organization.organization.organization_id
        ),
    )


@router.post(
    "/members/invite",
    response_model=OrganizationInvite,
    status_code=201,
    responses={
        403: {
            "description": (
                "Only an owner or admin can invite members"
            ),
        },
    },
)
def invite_organization_member(
    body: InviteMemberRequest,
    database: Session = Depends(get_db),
    current_user: UserRecord = Depends(get_current_user),
    current_organization: CurrentOrganization = Depends(
        get_current_organization
    ),
):
    try:
        invite = organization_service.invite_member(
            database=database,
            organization=current_organization.organization,
            invited_email=str(body.email),
            role=body.role,
            invited_by=current_user,
        )

    except organization_service.InsufficientPermission as error:
        raise HTTPException(
            status_code=403,
            detail=str(error),
        ) from error

    return invite


@router.delete(
    "/invites/{invite_id}",
    status_code=204,
    responses={
        403: {
            "description": (
                "Only an owner or admin can cancel invites"
            ),
        },
        404: {
            "description": "No pending invite found with this ID",
        },
        409: {
            "description": (
                "This invite has already been accepted"
            ),
        },
    },
)
def cancel_organization_invite(
    invite_id: str,
    database: Session = Depends(get_db),
    current_user: UserRecord = Depends(get_current_user),
    current_organization: CurrentOrganization = Depends(
        get_current_organization
    ),
):
    try:
        organization_service.cancel_invite(
            database=database,
            organization=current_organization.organization,
            invite_id=invite_id,
            cancelled_by=current_user,
        )

    except organization_service.InsufficientPermission as error:
        raise HTTPException(
            status_code=403,
            detail=str(error),
        ) from error

    except organization_service.InviteNotFound as error:
        raise HTTPException(
            status_code=404,
            detail=str(error),
        ) from error

    except organization_service.InviteAlreadyAccepted as error:
        raise HTTPException(
            status_code=409,
            detail=str(error),
        ) from error


@router.post(
    "/invites/{invite_id}/resend",
    response_model=OrganizationInvite,
    responses={
        403: {
            "description": (
                "Only an owner or admin can resend invites"
            ),
        },
        404: {
            "description": "No pending invite found with this ID",
        },
        409: {
            "description": (
                "This invite has already been accepted"
            ),
        },
    },
)
def resend_organization_invite(
    invite_id: str,
    database: Session = Depends(get_db),
    current_user: UserRecord = Depends(get_current_user),
    current_organization: CurrentOrganization = Depends(
        get_current_organization
    ),
):
    try:
        return organization_service.resend_invite(
            database=database,
            organization=current_organization.organization,
            invite_id=invite_id,
            resent_by=current_user,
        )

    except organization_service.InsufficientPermission as error:
        raise HTTPException(
            status_code=403,
            detail=str(error),
        ) from error

    except organization_service.InviteNotFound as error:
        raise HTTPException(
            status_code=404,
            detail=str(error),
        ) from error

    except organization_service.InviteAlreadyAccepted as error:
        raise HTTPException(
            status_code=409,
            detail=str(error),
        ) from error


@router.get(
    "/invites/{token}/preview",
    response_model=OrganizationInvitePreview,
    responses={
        404: {
            "description": "This invite link is not valid",
        },
    },
)
def preview_invite(
    token: str,
    database: Session = Depends(get_db),
):
    """
    No authentication required — this is what the accept-invite
    page calls before the person has even logged in, to show
    "you're invited to join X as Y".
    """

    try:
        invite, organization = (
            organization_service.get_invite_preview(
                database=database,
                token=token,
            )
        )

    except organization_service.InviteNotFound as error:
        raise HTTPException(
            status_code=404,
            detail=str(error),
        ) from error

    from datetime import datetime, timezone

    expires_at = invite.expires_at

    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)

    return OrganizationInvitePreview(
        organization_name=organization.name,
        invited_email=invite.invited_email,
        role=invite.role,
        is_expired=expires_at <= datetime.now(timezone.utc),
        is_accepted=invite.accepted_at is not None,
    )


@router.post(
    "/invites/{token}/accept",
    response_model=OrganizationMember,
    responses={
        404: {
            "description": "This invite link is not valid",
        },
        410: {
            "description": (
                "This invite has already been used or expired"
            ),
        },
    },
)
def accept_organization_invite(
    token: str,
    database: Session = Depends(get_db),
    current_user: UserRecord = Depends(get_current_user),
):
    try:
        membership = organization_service.accept_invite(
            database=database,
            token=token,
            accepting_user=current_user,
        )

    except organization_service.InviteNotFound as error:
        raise HTTPException(
            status_code=404,
            detail=str(error),
        ) from error

    except (
        organization_service.InviteExpired,
        organization_service.InviteAlreadyAccepted,
    ) as error:
        raise HTTPException(
            status_code=410,
            detail=str(error),
        ) from error

    return OrganizationMember(
        membership_id=membership.membership_id,
        organization_id=membership.organization_id,
        user_id=membership.user_id,
        role=membership.role,
        joined_at=membership.joined_at,
        email=current_user.email,
        full_name=current_user.full_name,
    )