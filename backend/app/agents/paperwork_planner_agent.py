import logging
from typing import Literal

from pydantic import BaseModel
from strands import Agent
from strands.models import BedrockModel

from app.config import settings
from app.models.task import Task


logger = logging.getLogger(__name__)

NextStep = Literal[
    "auto_complete",
    "route_to_approval",
]


class PlannerOutput(BaseModel):
    next_step: NextStep
    reasoning: str


bedrock_model = BedrockModel(
    model_id=settings.bedrock_model_id,
    region_name=settings.bedrock_region,
    temperature=settings.bedrock_temperature,
)


paperwork_planner_agent = Agent(
    model=bedrock_model,
    system_prompt=(
        "You are Clerkly's Paperwork Planner Agent. "
        "Given a single verified task, decide the next step. "
        "\n\n"
        "Rules:\n"
        "- If the task requires a signature, choose "
        "'route_to_approval'.\n"
        "- If the task requires a payment, choose "
        "'route_to_approval'.\n"
        "- Otherwise, if there is a clear required_action and "
        "no money or signature is involved, choose "
        "'auto_complete'.\n"
        "- Never choose 'auto_complete' for a task that "
        "involves money or a signature, even if the amount "
        "seems small or the deadline is far away.\n"
        "- Do not invent facts. Base your decision only on "
        "the fields provided.\n"
        "- Give a one-sentence reasoning for your decision."
    ),
)


def create_fallback_plan(task: Task) -> tuple[NextStep, str]:
    """
    Deterministic safety net used when the Planner Agent is
    unavailable. Mirrors the same safety boundary as the
    prompt above so behavior does not change if Bedrock is
    down.
    """

    if task.requires_signature:
        return (
            "route_to_approval",
            "Task requires a signature, so it needs "
            "user approval.",
        )

    if task.requires_payment:
        return (
            "route_to_approval",
            "Task requires a payment, so it needs "
            "user approval.",
        )

    return (
        "auto_complete",
        "No payment or signature is required, so this "
        "task can be completed automatically.",
    )


def plan_next_step(
    task: Task,
) -> tuple[
    NextStep,
    str,
    Literal["strands", "deterministic_fallback"],
]:
    """
    Decide what should happen to a task next.

    Returns (next_step, reasoning, source). This replaces the
    hardcoded if/else branching that used to live directly in
    the execution flow — the decision itself is now made by an
    agent, while the actual safety boundary (never claim a
    payment or signature was completed without a real
    provider) still lives in execution_service.py.
    """

    prompt = (
        "Decide the next step for this task. Only use the "
        "information below:\n"
        f"{task.model_dump(mode='json')}"
    )

    try:
        result = paperwork_planner_agent(
            prompt,
            structured_output_model=PlannerOutput,
        )

        output = result.structured_output

        if output is None:
            raise ValueError(
                "The Planner Agent returned no output"
            )

        # Safety override: never trust the agent to relax the
        # money/signature boundary, even if it hallucinates.
        if (
            task.requires_payment or task.requires_signature
        ) and output.next_step == "auto_complete":
            logger.warning(
                "Planner Agent chose auto_complete for a "
                "task requiring payment/signature; "
                "overriding to route_to_approval for task %s",
                task.task_id,
            )
            return (
                "route_to_approval",
                "Overridden: task requires payment or "
                "signature.",
                "deterministic_fallback",
            )

        return output.next_step, output.reasoning, "strands"

    except Exception as error:
        logger.warning(
            "Paperwork Planner Agent unavailable; using "
            "deterministic fallback: %s",
            error,
        )

        next_step, reasoning = create_fallback_plan(task)
        return next_step, reasoning, "deterministic_fallback"