from datetime import datetime, timezone
from uuid import uuid4

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class PolicyAcceptanceRecord(Base):
    __tablename__ = "policy_acceptances"

    acceptance_id: Mapped[str] = mapped_column(
        String,
        primary_key=True,
        default=lambda: str(uuid4()),
    )

    user_id: Mapped[str] = mapped_column(
        String,
        ForeignKey(
            "users.user_id",
            name="fk_policy_acceptances_user_id",
        ),
        nullable=False,
        index=True,
    )

    # A plain version string ("1.0", "2024-06-01", etc.) — not
    # a foreign key to anything, since the policy text itself
    # lives as static content, not a database row. Kept
    # deliberately simple: bump this string whenever the Terms
    # or Privacy Policy actually changes.
    policy_version: Mapped[str] = mapped_column(
        String(length=20),
        nullable=False,
    )

    accepted_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )