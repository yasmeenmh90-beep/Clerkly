from dataclasses import dataclass
from datetime import date

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.paperwork_watch import (
    PaperworkAlert,
    WatchReason,
    WatchSeverity,
)
from app.models.task_event_record import TaskEventRecord
from app.models.task_record import TaskRecord
from app.services.audit_service import record_task_event


COMPLETED_STATUSES = {
    "completed",
    "rejected",
}


@dataclass
class PaperworkWatchScan:
    checked_tasks: int
    alerts: list[PaperworkAlert]
    notifications_created: int


def get_alert_event_type(
    reasons: list[WatchReason],
) -> str:
    """Return a stable audit-event type for duplicate prevention."""

    if "overdue" in reasons:
        return "paperwork_watch_overdue"

    if "due_today" in reasons:
        return "paperwork_watch_due_today"

    if "deadline_approaching" in reasons:
        return "paperwork_watch_deadline"

    if "execution_failed" in reasons:
        return "paperwork_watch_failed"

    if "approval_required" in reasons:
        return "paperwork_watch_approval"

    if "payment_required" in reasons:
        return "paperwork_watch_payment"

    return "paperwork_watch_signature"


def reminder_already_recorded(
    database: Session,
    task_id: str,
    event_type: str,
) -> bool:
    statement = select(TaskEventRecord.event_id).where(
        TaskEventRecord.task_id == task_id,
        TaskEventRecord.event_type == event_type,
    )

    return database.scalar(statement) is not None


def build_alert_message(
    task: TaskRecord,
    reasons: list[WatchReason],
    days_remaining: int | None,
) -> str:
    messages: list[str] = []

    if "overdue" in reasons:
        overdue_days = abs(days_remaining or 0)
        messages.append(
            f"This task is overdue by {overdue_days} day"
            f"{'s' if overdue_days != 1 else ''}."
        )

    elif "due_today" in reasons:
        messages.append("This task is due today.")

    elif "deadline_approaching" in reasons:
        messages.append(
            f"This task is due in {days_remaining} day"
            f"{'s' if days_remaining != 1 else ''}."
        )

    if "approval_required" in reasons:
        messages.append("Your approval is required.")

    if "payment_required" in reasons:
        if task.payment_amount is not None:
            currency = task.currency or "AED"
            messages.append(
                f"A payment of {currency} "
                f"{task.payment_amount:.2f} is waiting."
            )
        else:
            messages.append("A payment is waiting.")

    if "signature_required" in reasons:
        messages.append("A signature is required.")

    if "execution_failed" in reasons:
        messages.append(
            "The previous execution failed and needs attention."
        )

    return " ".join(messages)


def analyze_task(
    task: TaskRecord,
    current_date: date,
) -> tuple[
    list[WatchReason],
    WatchSeverity,
    int | None,
]:
    reasons: list[WatchReason] = []
    severity: WatchSeverity = "info"
    days_remaining: int | None = None

    if task.deadline is not None:
        days_remaining = (
            task.deadline - current_date
        ).days

        if days_remaining < 0:
            reasons.append("overdue")
            severity = "urgent"

        elif days_remaining == 0:
            reasons.append("due_today")
            severity = "urgent"

        elif days_remaining <= 2:
            reasons.append("deadline_approaching")
            severity = "urgent"

        elif days_remaining <= 7:
            reasons.append("deadline_approaching")
            severity = "warning"

    if (
        task.status == "awaiting_approval"
        or task.approval_required
    ):
        reasons.append("approval_required")

        if severity == "info":
            severity = "warning"

    if (
        task.requires_payment
        and task.status == "approved"
        and task.payment_status != "paid"
    ):
        reasons.append("payment_required")

        if severity == "info":
            severity = "warning"

    if task.requires_signature:
        reasons.append("signature_required")

        if severity == "info":
            severity = "warning"

    if task.status == "failed":
        reasons.append("execution_failed")
        severity = "urgent"

    return reasons, severity, days_remaining


def scan_user_paperwork(
    database: Session,
    owner_id: str,
    current_date: date | None = None,
) -> PaperworkWatchScan:
    today = current_date or date.today()

    statement = (
        select(TaskRecord)
        .where(
            TaskRecord.owner_id == owner_id,
            TaskRecord.status.notin_(
                COMPLETED_STATUSES
            ),
        )
        .order_by(
            TaskRecord.deadline.asc(),
            TaskRecord.task_id.asc(),
        )
    )

    tasks = list(
        database.scalars(statement).all()
    )

    alerts: list[PaperworkAlert] = []
    notifications_created = 0

    for task in tasks:
        (
            reasons,
            severity,
            days_remaining,
        ) = analyze_task(
            task=task,
            current_date=today,
        )

        if not reasons:
            continue

        event_type = get_alert_event_type(reasons)

        notification_created = not (
            reminder_already_recorded(
                database=database,
                task_id=task.task_id,
                event_type=event_type,
            )
        )

        message = build_alert_message(
            task=task,
            reasons=reasons,
            days_remaining=days_remaining,
        )

        if notification_created:
            record_task_event(
                database=database,
                task_id=task.task_id,
                event_type=event_type,
                previous_status=task.status,
                new_status=task.status,
                message=message,
            )

            notifications_created += 1

        alerts.append(
            PaperworkAlert(
                task_id=task.task_id,
                title=task.title,
                deadline=task.deadline,
                days_remaining=days_remaining,
                severity=severity,
                reasons=reasons,
                message=message,
                requires_user_action=True,
                notification_created=(
                    notification_created
                ),
            )
        )

    return PaperworkWatchScan(
        checked_tasks=len(tasks),
        alerts=alerts,
        notifications_created=(
            notifications_created
        ),
    )