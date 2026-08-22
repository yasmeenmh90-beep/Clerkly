from datetime import date
from uuid import uuid4

from app.agents.document_analyzer import analyze_document
from app.agents.paperwork_planner_agent import plan_next_step
from app.models.task import Task


def extract_task_from_document(
    filename: str,
    content: str,
) -> Task:

    analysis = analyze_document(content, filename=filename)

    parsed_deadline = None

    if analysis.deadline:
        try:
            parsed_deadline = date.fromisoformat(analysis.deadline)
        except ValueError:
            parsed_deadline = None

    task = Task(
        task_id=f"task_{uuid4().hex[:8]}",
        title=analysis.title,
        description=analysis.description,
        source="document",

        # Placeholder status/approval_required — the Planner
        # Agent below decides the real values. Kept here only
        # so the Task model has something valid to construct
        # with before the plan is known.
        status="awaiting_approval",
        approval_required=True,

        deadline=parsed_deadline,
        required_action=analysis.required_action,

        requires_signature=analysis.requires_signature,
        requires_payment=analysis.requires_payment,

        payment_amount=analysis.payment_amount,
        currency=analysis.currency,
    )

    next_step, reasoning, plan_source = plan_next_step(task)

    # The Planner Agent decides WHAT should happen next.
    # execution_service.validate_task_execution() still
    # enforces the safety boundary before anything is ever
    # marked complete — the Planner cannot bypass that check,
    # it only routes the task.
    if next_step == "route_to_approval":
        task.status = "awaiting_approval"
        task.approval_required = True
    else:
        # "approved" is the correct value here, not a made-up
        # "ready_to_execute" — it must match Task.status's
        # Literal exactly or Pydantic validation will fail.
        task.status = "approved"
        task.approval_required = False

    task.plan_reasoning = reasoning
    task.plan_source = plan_source

    return task