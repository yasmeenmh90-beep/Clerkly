from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(
        min_length=8,
        max_length=128,
    )
    full_name: str | None = Field(
        default=None,
        max_length=200,
    )


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    user_id: str
    email: EmailStr
    full_name: str | None
    is_active: bool
    created_at: datetime

    # Whether Gmail is connected for email intake. Tokens
    # themselves are never included in any API response.
    gmail_connected: bool = False

    # Whether DocuSign (sandbox) is connected for signature
    # intake. Tokens themselves are never included here either.
    docusign_connected: bool = False


class AccessToken(BaseModel):
    access_token: str
    token_type: str = "bearer"