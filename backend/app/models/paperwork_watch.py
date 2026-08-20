from datetime import date
from typing import Literal

from pydantic import BaseModel, Field


WatchSeverity = Literal[
    "info",
    "warning",
    "urgent",
]


WatchReason = Literal[
    "overdue",
    "due_today",
    "deadline_approaching",
    "approval_required",
    "payment_required",
    "signature_required",
    "execution_failed",
]


class PaperworkAlert(BaseModel):
    task_id: str
    title: str
    deadline: date | None
    days_remaining: int | None

    severity: WatchSeverity
    reasons: list[WatchReason]

    message: str
    requires_user_action: bool = True
    notification_created: bool = False


class PaperworkWatchSummary(BaseModel):
    checked_tasks: int = Field(ge=0)
    attention_required: int = Field(ge=0)
    notifications_created: int = Field(ge=0)

    generated_by: Literal[
        "strands",
        "deterministic_fallback",
    ]

    summary: str
    alerts: list[PaperworkAlert]