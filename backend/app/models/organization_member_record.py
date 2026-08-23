from datetime import datetime, timezone
from uuid import uuid4

from sqlalchemy import (
    DateTime,
    ForeignKey,
    String,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class OrganizationMemberRecord(Base):
    __tablename__ = "organization_members"

    __table_args__ = (
        UniqueConstraint(
            "organization_id",
            "user_id",
            name="uq_org_members_org_user",
        ),
    )

    membership_id: Mapped[str] = mapped_column(
        String,
        primary_key=True,
        default=lambda: str(uuid4()),
    )

    organization_id: Mapped[str] = mapped_column(
        String,
        ForeignKey(
            "organizations.organization_id",
            name="fk_org_members_organization_id",
        ),
        nullable=False,
        index=True,
    )

    user_id: Mapped[str] = mapped_column(
        String,
        ForeignKey(
            "users.user_id",
            name="fk_org_members_user_id",
        ),
        nullable=False,
        index=True,
    )

    # "owner" | "admin" | "member" — kept as a plain string,
    # same convention as plan_source/analysis_source elsewhere
    # in this codebase, validated at the Pydantic layer rather
    # than the database layer.
    role: Mapped[str] = mapped_column(
        String(length=20),
        nullable=False,
        default="member",
    )

    joined_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )