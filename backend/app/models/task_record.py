from datetime import date
from typing import Optional

from sqlalchemy import Boolean, Date, Float, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


from datetime import date
from typing import Optional

from sqlalchemy import Boolean, Date, Float, ForeignKey, String
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

    payment_amount: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
    )

    currency: Mapped[Optional[str]] = mapped_column(
        String,
        nullable=True,
    )

    approval_required: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
    )