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
    role: OrganizationRole


class CreateOrganizationRequest(BaseModel):
    name: str


class OrganizationMember(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    membership_id: str
    organization_id: str
    user_id: str
    role: OrganizationRole
    joined_at: datetime

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


class OrganizationInvitePreview(BaseModel):
    """
    Returned by the unauthenticated invite-preview endpoint —
    just enough for the accept-invite page to show "you're
    invited to join X as Y" before the person logs in.
    """

    organization_name: str
    invited_email: str
    role: OrganizationRole
    is_expired: bool
    is_accepted: bool


class UpdateMemberRoleRequest(BaseModel):
    role: OrganizationRole