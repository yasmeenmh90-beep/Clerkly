from datetime import datetime, timezone
from typing import Optional
from uuid import uuid4

from sqlalchemy import Boolean, DateTime, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class UserRecord(Base):
    __tablename__ = "users"

    user_id: Mapped[str] = mapped_column(
        String,
        primary_key=True,
        default=lambda: str(uuid4()),
    )

    email: Mapped[str] = mapped_column(
        String,
        unique=True,
        index=True,
        nullable=False,
    )

    hashed_password: Mapped[str] = mapped_column(
        String,
        nullable=False,
    )

    full_name: Mapped[Optional[str]] = mapped_column(
        String,
        nullable=True,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # --- Gmail OAuth (email intake) ---
    gmail_connected: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    google_access_token: Mapped[Optional[str]] = mapped_column(
        String,
        nullable=True,
    )

    google_refresh_token: Mapped[Optional[str]] = mapped_column(
        String,
        nullable=True,
    )

    google_token_expiry: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    # --- DocuSign OAuth (signature intake) ---
    # Sandbox/demo environment only — see config.py
    # docusign_auth_base_path / docusign_api_base_path.

    docusign_connected: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    docusign_access_token: Mapped[Optional[str]] = mapped_column(
        String,
        nullable=True,
    )

    docusign_refresh_token: Mapped[Optional[str]] = mapped_column(
        String,
        nullable=True,
    )

    docusign_token_expiry: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )