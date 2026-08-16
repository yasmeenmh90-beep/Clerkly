import logging

from app.models.task_record import TaskRecord


logger = logging.getLogger(__name__)


class TaskExecutionError(Exception):
    """Raised when a task cannot be executed."""


def execute_task_action(task: TaskRecord) -> None:
    """
    Execute the action associated with a task.

    This is the integration boundary for future payment,
    signature, email, and document services.
    """

    if not task.required_action:
        raise TaskExecutionError(
            "Task does not contain a required action"
        )

    logger.info(
        "Executing task %s: %s",
        task.task_id,
        task.required_action,
    )

    # Future external execution will be added here.
    #
    # Examples:
    # - payment service
    # - document submission
    # - signature service
    # - email service