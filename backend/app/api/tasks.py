import logging
from datetime import date
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth_dependencies import get_current_user
from app.database import get_db
from app.models.task import Task
from app.models.task_event import TaskEvent
from app.models.task_event_record import TaskEventRecord
from app.models.task_record import TaskRecord
from app.models.user_record import UserRecord
from app.services.audit_service import record_task_event
from app.services.execution_service import (
    ExecutionProviderNotConfigured,
    TaskExecutionError,
    execute_task_action,
    validate_task_execution,
)

logger = logging.getLogger(__name__)


router = APIRouter(
    prefix="/tasks",
    tags=["Tasks"],
)


TaskStatus = Literal[
    "pending",
    "in_progress",
    "awaiting_approval",
    "approved",
    "completed",
    "rejected",
    "failed",
]


TaskSource = Literal[
    "email",
    "document",
    "manual",
]


def find_task_or_404(
    task_id: str,
    owner_id: str,
    database: Session,
) -> TaskRecord:
    statement = select(TaskRecord).where(
        TaskRecord.task_id == task_id,
        TaskRecord.owner_id == owner_id,
    )

    task = database.scalar(statement)

    if task is None:
        raise HTTPException(
            status_code=404,
            detail="Task not found",
        )

    return task


# --------------------------------------------------
# Get all tasks belonging to current user
# --------------------------------------------------

@router.get("/", response_model=list[Task])
def get_tasks(
    response: Response,
    status: TaskStatus | None = Query(default=None),
    source: TaskSource | None = Query(default=None),
    deadline: date | None = Query(default=None),
    requires_payment: bool | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    database: Session = Depends(get_db),
    current_user: UserRecord = Depends(get_current_user),
):
    query = database.query(TaskRecord).filter(
        TaskRecord.owner_id == current_user.user_id
    )

    if status is not None:
        query = query.filter(TaskRecord.status == status)

    if source is not None:
        query = query.filter(TaskRecord.source == source)

    if deadline is not None:
        query = query.filter(TaskRecord.deadline == deadline)

    if requires_payment is not None:
        query = query.filter(
            TaskRecord.requires_payment == requires_payment
        )

    total_items = query.count()

    total_pages = (
        (total_items + page_size - 1) // page_size
        if total_items > 0
        else 0
    )

    offset = (page - 1) * page_size

    tasks = (
        query
        .order_by(TaskRecord.task_id)
        .offset(offset)
        .limit(page_size)
        .all()
    )

    response.headers["X-Total-Count"] = str(total_items)
    response.headers["X-Total-Pages"] = str(total_pages)
    response.headers["X-Current-Page"] = str(page)
    response.headers["X-Page-Size"] = str(page_size)

    return tasks


# --------------------------------------------------
# Get current user's tasks waiting for approval
# Keep this before /{task_id}
# --------------------------------------------------

@router.get("/approvals", response_model=list[Task])
def get_approvals(
    database: Session = Depends(get_db),
    current_user: UserRecord = Depends(get_current_user),
):
    statement = select(TaskRecord).where(
        TaskRecord.owner_id == current_user.user_id,
        TaskRecord.status == "awaiting_approval",
    )

    return list(database.scalars(statement).all())


# --------------------------------------------------
# Create task for current user
# --------------------------------------------------

@router.post("/", response_model=Task, status_code=201)
def create_task(
    task: Task,
    database: Session = Depends(get_db),
    current_user: UserRecord = Depends(get_current_user),
):
    existing_task = database.get(
        TaskRecord,
        task.task_id,
    )

    if existing_task is not None:
        raise HTTPException(
            status_code=409,
            detail="Task ID already exists",
        )

    task_record = TaskRecord(
        owner_id=current_user.user_id,
        **task.model_dump(),
    )

    database.add(task_record)

    record_task_event(
        database=database,
        task_id=task_record.task_id,
        event_type="task_created",
        previous_status=None,
        new_status=task_record.status,
        message="Task created manually",
    )

    database.commit()
    database.refresh(task_record)

    return task_record


# --------------------------------------------------
# Get current user's task audit history
# Keep this before /{task_id}
# --------------------------------------------------

@router.get(
    "/{task_id}/history",
    response_model=list[TaskEvent],
)
def get_task_history(
    task_id: str,
    database: Session = Depends(get_db),
    current_user: UserRecord = Depends(get_current_user),
):
    find_task_or_404(
        task_id=task_id,
        owner_id=current_user.user_id,
        database=database,
    )

    statement = (
        select(TaskEventRecord)
        .where(TaskEventRecord.task_id == task_id)
        .order_by(TaskEventRecord.created_at.asc())
    )

    return list(database.scalars(statement).all())


# --------------------------------------------------
# Approve current user's task
# --------------------------------------------------

@router.post("/{task_id}/approve", response_model=Task)
def approve_task(
    task_id: str,
    database: Session = Depends(get_db),
    current_user: UserRecord = Depends(get_current_user),
):
    task = find_task_or_404(
        task_id=task_id,
        owner_id=current_user.user_id,
        database=database,
    )

    if task.status != "awaiting_approval":
        raise HTTPException(
            status_code=400,
            detail="Task is not awaiting approval",
        )

    previous_status = task.status
    task.status = "approved"
    task.approval_required = False

    record_task_event(
        database=database,
        task_id=task.task_id,
        event_type="task_approved",
        previous_status=previous_status,
        new_status=task.status,
        message="Task approved by user",
    )

    database.commit()
    database.refresh(task)

    return task


# --------------------------------------------------
# Execute current user's approved task
# --------------------------------------------------

@router.post("/{task_id}/execute", response_model=Task)
def execute_task(
    task_id: str,
    database: Session = Depends(get_db),
    current_user: UserRecord = Depends(get_current_user),
):
    task = find_task_or_404(
        task_id=task_id,
        owner_id=current_user.user_id,
        database=database,
    )

    if task.status != "approved":
        raise HTTPException(
            status_code=400,
            detail="Task must be approved before execution",
        )

    # --------------------------------------------------
    # Check whether the required provider is connected
    # --------------------------------------------------

    try:
        validate_task_execution(task)

    except ExecutionProviderNotConfigured as error:
        logger.warning(
            "Execution blocked for task %s: %s",
            task.task_id,
            error,
        )

        record_task_event(
            database=database,
            task_id=task.task_id,
            event_type="execution_blocked",
            previous_status=task.status,
            new_status=task.status,
            message=str(error),
        )

        database.commit()

        raise HTTPException(
            status_code=503,
            detail=str(error),
            headers={
                "Retry-After": "300",
            },
        ) from error

    # --------------------------------------------------
    # Mark execution as started
    # --------------------------------------------------

    previous_status = task.status
    task.status = "in_progress"

    record_task_event(
        database=database,
        task_id=task.task_id,
        event_type="execution_started",
        previous_status=previous_status,
        new_status=task.status,
        message="Task execution started",
    )

    # --------------------------------------------------
    # Execute the internal task
    # --------------------------------------------------

    try:
        execute_task_action(task)

    except TaskExecutionError as error:
        logger.error(
            "Execution failed for task %s: %s",
            task.task_id,
            error,
        )

        previous_status = task.status
        task.status = "failed"

        record_task_event(
            database=database,
            task_id=task.task_id,
            event_type="execution_failed",
            previous_status=previous_status,
            new_status=task.status,
            message=str(error),
        )

        database.commit()
        database.refresh(task)

        raise HTTPException(
            status_code=500,
            detail="Task execution failed",
        ) from error

    # --------------------------------------------------
    # Mark internal task as completed
    # --------------------------------------------------

    previous_status = task.status
    task.status = "completed"

    record_task_event(
        database=database,
        task_id=task.task_id,
        event_type="execution_completed",
        previous_status=previous_status,
        new_status=task.status,
        message="Internal task execution completed",
    )

    database.commit()
    database.refresh(task)

    return task


# --------------------------------------------------
# Reject current user's task
# --------------------------------------------------

@router.post("/{task_id}/reject", response_model=Task)
def reject_task(
    task_id: str,
    database: Session = Depends(get_db),
    current_user: UserRecord = Depends(get_current_user),
):
    task = find_task_or_404(
        task_id=task_id,
        owner_id=current_user.user_id,
        database=database,
    )

    if task.status != "awaiting_approval":
        raise HTTPException(
            status_code=400,
            detail="Task is not awaiting approval",
        )

    previous_status = task.status
    task.status = "rejected"
    task.approval_required = False

    record_task_event(
        database=database,
        task_id=task.task_id,
        event_type="task_rejected",
        previous_status=previous_status,
        new_status=task.status,
        message="Task rejected by user",
    )

    database.commit()
    database.refresh(task)

    return task


# --------------------------------------------------
# Get one task belonging to current user
# Keep dynamic route LAST
# --------------------------------------------------

@router.get("/{task_id}", response_model=Task)
def get_task(
    task_id: str,
    database: Session = Depends(get_db),
    current_user: UserRecord = Depends(get_current_user),
):
    return find_task_or_404(
        task_id=task_id,
        owner_id=current_user.user_id,
        database=database,
    )