from datetime import date
from uuid import uuid4

from app.agents.document_analyzer import analyze_document
from app.models.task import Task


def extract_task_from_document(
    filename: str,
    content: str,
) -> Task:

    analysis = analyze_document(content)

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

        # Clerkly safety boundary
        status="awaiting_approval",
        approval_required=True,

        deadline=parsed_deadline,
        required_action=analysis.required_action,

        requires_signature=analysis.requires_signature,
        requires_payment=analysis.requires_payment,

        payment_amount=analysis.payment_amount,
        currency=analysis.currency,
    )

    return task