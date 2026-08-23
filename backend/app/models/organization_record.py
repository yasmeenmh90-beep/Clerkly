from datetime import datetime, timezone
from uuid import uuid4

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class OrganizationRecord(Base):
    __tablename__ = "organizations"

    organization_id: Mapped[str] = mapped_column(
        String,
        primary_key=True,
        default=lambda: str(uuid4()),
    )

    name: Mapped[str] = mapped_column(
        String,
        nullable=False,
    )

    owner_id: Mapped[str] = mapped_column(
        String,
        ForeignKey(
            "users.user_id",
            name="fk_organizations_owner_id_users",
        ),
        nullable=False,
        index=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )