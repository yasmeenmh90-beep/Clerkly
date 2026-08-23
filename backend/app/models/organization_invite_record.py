import secrets
from datetime import datetime, timedelta, timezone
from uuid import uuid4

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


INVITE_EXPIRY_DAYS = 7


def _generate_invite_token() -> str:
    return secrets.token_urlsafe(32)


def _default_invite_expiry() -> datetime:
    return datetime.now(timezone.utc) + timedelta(
        days=INVITE_EXPIRY_DAYS
    )


class OrganizationInviteRecord(Base):
    __tablename__ = "organization_invites"

    invite_id: Mapped[str] = mapped_column(
        String,
        primary_key=True,
        default=lambda: str(uuid4()),
    )

    organization_id: Mapped[str] = mapped_column(
        String,
        ForeignKey(
            "organizations.organization_id",
            name="fk_org_invites_organization_id",
        ),
        nullable=False,
        index=True,
    )

    invited_email: Mapped[str] = mapped_column(
        String,
        nullable=False,
        index=True,
    )

    role: Mapped[str] = mapped_column(
        String(length=20),
        nullable=False,
        default="member",
    )

    invited_by: Mapped[str] = mapped_column(
        String,
        ForeignKey(
            "users.user_id",
            name="fk_org_invites_invited_by_users",
        ),
        nullable=False,
    )

    token: Mapped[str] = mapped_column(
        String,
        unique=True,
        index=True,
        nullable=False,
        default=_generate_invite_token,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    expires_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=_default_invite_expiry,
        nullable=False,
    )

    accepted_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )