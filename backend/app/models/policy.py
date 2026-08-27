from datetime import datetime

from pydantic import BaseModel


class PolicyStatus(BaseModel):
    current_version: str
    has_accepted_current_version: bool
    accepted_version: str | None = None
    accepted_at: datetime | None = None


class AcceptPolicyRequest(BaseModel):
    policy_version: str


class PolicyAcceptanceResponse(BaseModel):
    policy_version: str
    accepted_at: datetime