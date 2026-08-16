from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class TaskEventRecord(Base):
    __tablename__ = "task_events"

    event_id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    task_id: Mapped[str] = mapped_column(
        ForeignKey("tasks.task_id"),
        index=True,
    )

    event_type: Mapped[str] = mapped_column(String)

    previous_status: Mapped[Optional[str]] = mapped_column(
        String,
        nullable=True,
    )

    new_status: Mapped[str] = mapped_column(String)

    message: Mapped[Optional[str]] = mapped_column(
        String,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )