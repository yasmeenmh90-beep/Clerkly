from datetime import date
from decimal import Decimal
from typing import Optional

from sqlalchemy import (
    Boolean,
    Date,
    ForeignKey,
    Numeric,
    String,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class TaskRecord(Base):
    __tablename__ = "tasks"

    task_id: Mapped[str] = mapped_column(
        String,
        primary_key=True,
        index=True,
    )

    owner_id: Mapped[str] = mapped_column(
        String,
        ForeignKey(
            "users.user_id",
            name="fk_tasks_owner_id_users",
        ),
        nullable=False,
        index=True,
    )

    title: Mapped[str] = mapped_column(String)

    description: Mapped[Optional[str]] = mapped_column(
        String,
        nullable=True,
    )

    source: Mapped[str] = mapped_column(String)

    status: Mapped[str] = mapped_column(
        String,
        default="pending",
    )

    deadline: Mapped[Optional[date]] = mapped_column(
        Date,
        nullable=True,
    )

    required_action: Mapped[Optional[str]] = mapped_column(
        String,
        nullable=True,
    )

    requires_signature: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
    )

    requires_payment: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
    )

    payment_amount: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(
            precision=12,
            scale=2,
        ),
        nullable=True,
    )

    currency: Mapped[Optional[str]] = mapped_column(
        String(length=3),
        nullable=True,
    )

    approval_required: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
    )

    plan_reasoning: Mapped[Optional[str]] = mapped_column(
        String,
        nullable=True,
    )

    plan_source: Mapped[Optional[str]] = mapped_column(
        String(length=30),
        nullable=True,
    )

    # Stripe payment tracking
    payment_provider: Mapped[Optional[str]] = mapped_column(
        String(length=50),
        nullable=True,
    )

    provider_session_id: Mapped[Optional[str]] = mapped_column(
        String(length=255),
        nullable=True,
        unique=True,
        index=True,
    )

    payment_intent_id: Mapped[Optional[str]] = mapped_column(
        String(length=255),
        nullable=True,
        unique=True,
        index=True,
    )

    payment_status: Mapped[Optional[str]] = mapped_column(
        String(length=50),
        nullable=True,
    )

    # DocuSign (sandbox) signature tracking
    signature_provider: Mapped[Optional[str]] = mapped_column(
        String(length=50),
        nullable=True,
    )

    signature_envelope_id: Mapped[Optional[str]] = mapped_column(
        String(length=255),
        nullable=True,
        unique=True,
        index=True,
    )

    signature_status: Mapped[Optional[str]] = mapped_column(
        String(length=50),
        nullable=True,
    )