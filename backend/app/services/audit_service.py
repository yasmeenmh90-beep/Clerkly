from typing import Optional

from sqlalchemy.orm import Session

from app.models.task_event_record import TaskEventRecord


def record_task_event(
    database: Session,
    task_id: str,
    event_type: str,
    new_status: str,
    previous_status: Optional[str] = None,
    message: Optional[str] = None,
) -> TaskEventRecord:
    event = TaskEventRecord(
        task_id=task_id,
        event_type=event_type,
        previous_status=previous_status,
        new_status=new_status,
        message=message,
    )

    database.add(event)

    return event