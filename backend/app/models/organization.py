from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr


OrganizationRole = Literal["owner", "admin", "member"]


class Organization(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    organization_id: str
    name: str
    owner_id: str
    created_at: datetime


class OrganizationWithRole(Organization):
    """
    What the frontend actually needs when listing "my
    organizations" — the org itself plus the current user's
    role in it, so the UI can show/hide member-management
    actions without a second request.
    """

    role: OrganizationRole


class CreateOrganizationRequest(BaseModel):
    name: str


class OrganizationMember(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    membership_id: str
    user_id: str
    role: OrganizationRole
    joined_at: datetime

    # Filled in by the router, not stored on the membership
    # record itself — joined from UserRecord for display.
    email: str
    full_name: str | None = None


class InviteMemberRequest(BaseModel):
    email: EmailStr
    role: OrganizationRole = "member"


class OrganizationInvite(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    invite_id: str
    organization_id: str
    invited_email: str
    role: OrganizationRole
    created_at: datetime
    expires_at: datetime
    accepted_at: datetime | None = None