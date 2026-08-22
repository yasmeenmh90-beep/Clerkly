import logging
from typing import Literal, Optional

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

PlanSource = Literal[
    "strands",
    "openai_fallback",
    "deterministic_fallback",
]


class PlannerOutput(BaseModel):
    next_step: NextStep
    reasoning: str


SYSTEM_PROMPT = (
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
)


bedrock_model = BedrockModel(
    model_id=settings.bedrock_model_id,
    region_name=settings.bedrock_region,
    temperature=settings.bedrock_temperature,
)

paperwork_planner_agent = Agent(
    model=bedrock_model,
    system_prompt=SYSTEM_PROMPT,
)


def _get_openai_planner_agent() -> Optional[Agent]:
    """
    Builds the OpenAI-backed planner lazily, only if a key is
    configured — same pattern as document_analyzer.py.
    """

    if not settings.openai_is_configured:
        return None

    from strands.models.openai import OpenAIModel

    openai_model = OpenAIModel(
        client_args={"api_key": settings.openai_api_key},
        model_id=settings.openai_model_id,
        params={
            "max_tokens": 500,
            "temperature": 0.1,
        },
    )

    return Agent(
        model=openai_model,
        system_prompt=SYSTEM_PROMPT,
    )


def create_fallback_plan(task: Task) -> tuple[NextStep, str]:
    """
    Deterministic safety net used when neither Bedrock nor
    OpenAI is available. Mirrors the same safety boundary as
    the prompt above so behavior does not change regardless of
    which layer actually ran.
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


def _apply_safety_override(
    task: Task,
    output: PlannerOutput,
    source: PlanSource,
) -> tuple[NextStep, str, PlanSource]:
    """
    Never trust any agent — Bedrock or OpenAI — to relax the
    money/signature boundary, even if it hallucinates.
    """

    if (
        task.requires_payment or task.requires_signature
    ) and output.next_step == "auto_complete":
        logger.warning(
            "Planner Agent (%s) chose auto_complete for a "
            "task requiring payment/signature; overriding "
            "to route_to_approval for task %s",
            source,
            task.task_id,
        )

        return (
            "route_to_approval",
            "Overridden: task requires payment or signature.",
            "deterministic_fallback",
        )

    return output.next_step, output.reasoning, source


def plan_next_step(
    task: Task,
) -> tuple[NextStep, str, PlanSource]:
    """
    Decide what should happen to a task next.

    Tries Bedrock first, then OpenAI if Bedrock is
    unreachable, then falls back to deterministic rules if
    neither AI provider is available. The actual safety
    boundary (never claim a payment or signature was completed
    without a real provider) still lives in
    execution_service.py — this function only routes.
    """

    prompt = (
        "Decide the next step for this task. Only use the "
        "information below:\n"
        f"{task.model_dump(mode='json')}"
    )

    # Layer 1: Amazon Bedrock
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

        return _apply_safety_override(task, output, "strands")

    except Exception as bedrock_error:
        logger.warning(
            "Paperwork Planner Agent (Bedrock) unavailable: %s",
            bedrock_error,
        )

        # Layer 2: OpenAI, only if a key is configured
        openai_agent = _get_openai_planner_agent()

        if openai_agent is not None:
            try:
                result = openai_agent(
                    prompt,
                    structured_output_model=PlannerOutput,
                )

                output = result.structured_output

                if output is None:
                    raise ValueError(
                        "The OpenAI Planner returned no output"
                    )

                logger.info(
                    "Bedrock was unavailable; OpenAI "
                    "successfully planned the next step instead."
                )

                return _apply_safety_override(
                    task, output, "openai_fallback"
                )

            except Exception as openai_error:
                logger.warning(
                    "Paperwork Planner Agent (OpenAI fallback) "
                    "also unavailable: %s",
                    openai_error,
                )

        # Layer 3: deterministic rule-based fallback
        next_step, reasoning = create_fallback_plan(task)
        return next_step, reasoning, "deterministic_fallback"