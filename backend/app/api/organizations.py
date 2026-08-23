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
    OrganizationMember,
    OrganizationWithRole,
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
    """
    Lists members of whichever organization the
    X-Organization-ID header (or default) resolves to — same
    pattern every task-related endpoint already uses, so the
    frontend doesn't need a separate "which org" concept here.
    """

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
            user_id=membership.user_id,
            role=membership.role,
            joined_at=membership.joined_at,
            email=user.email,
            full_name=user.full_name,
        )
        for membership, user in rows
    ]


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
        user_id=membership.user_id,
        role=membership.role,
        joined_at=membership.joined_at,
        email=current_user.email,
        full_name=current_user.full_name,
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