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
from sqlalchemy.orm import Mapped, mapped_column, relationship

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

    organization_id: Mapped[Optional[str]] = mapped_column(
        String,
        ForeignKey(
            "organizations.organization_id",
            name="fk_tasks_organization_id",
        ),
        nullable=True,
        index=True,
    )

    # Who approved this task, if it went through approval.
    # Nullable — auto-completed tasks and rejected tasks never
    # get one.
    approved_by: Mapped[Optional[str]] = mapped_column(
        String,
        ForeignKey(
            "users.user_id",
            name="fk_tasks_approved_by_users",
        ),
        nullable=True,
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

    analysis_source: Mapped[Optional[str]] = mapped_column(
        String(length=30),
        nullable=True,
    )

    original_filename: Mapped[Optional[str]] = mapped_column(
        String(length=255),
        nullable=True,
    )

    original_file_path: Mapped[Optional[str]] = mapped_column(
        String(length=500),
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

    # --------------------------------------------------
    # Attribution — "created by" / "approved by"
    # --------------------------------------------------
    # Relationships only, not stored columns — used purely so
    # the Task Pydantic model can read owner_name/owner_email/
    # approved_by_name/approved_by_email straight off a
    # TaskRecord via from_attributes, without every endpoint
    # having to write its own join query.

    owner = relationship(
        "UserRecord",
        foreign_keys=[owner_id],
        viewonly=True,
    )

    approver = relationship(
        "UserRecord",
        foreign_keys=[approved_by],
        viewonly=True,
    )

    @property
    def owner_name(self) -> Optional[str]:
        return self.owner.full_name if self.owner else None

    @property
    def owner_email(self) -> Optional[str]:
        return self.owner.email if self.owner else None

    @property
    def approved_by_name(self) -> Optional[str]:
        return (
            self.approver.full_name if self.approver else None
        )

    @property
    def approved_by_email(self) -> Optional[str]:
        return self.approver.email if self.approver else None