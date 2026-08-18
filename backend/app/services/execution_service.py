import logging

from app.models.task_record import TaskRecord


logger = logging.getLogger(__name__)


class TaskExecutionError(Exception):
    """Raised when a task execution fails."""


class ExecutionProviderNotConfigured(TaskExecutionError):
    """Raised when an external provider is not configured."""


def validate_task_execution(task: TaskRecord) -> None:
    """
    Check whether Clerkly has the provider required to execute
    this task.

    Payment and signature providers are not connected yet, so
    Clerkly must not claim those actions were completed.
    """

    if task.requires_payment:
        raise ExecutionProviderNotConfigured(
            "Payment provider is not configured"
        )

    if task.requires_signature:
        raise ExecutionProviderNotConfigured(
            "Signature provider is not configured"
        )


def execute_task_action(task: TaskRecord) -> None:
    """
    Execute a task that does not require an external payment
    or signature provider.
    """

    if not task.required_action:
        raise TaskExecutionError(
            "Task does not contain a required action"
        )

    logger.info(
        "Completing internal task %s: %s",
        task.task_id,
        task.required_action,
    )

    # Only internal/manual workflow completion happens here.
    #
    # Payment and signature tasks are stopped by
    # validate_task_execution() until real providers are connected.