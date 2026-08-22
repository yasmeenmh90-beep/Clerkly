import json
import logging
from typing import Literal

from pydantic import BaseModel
from strands import Agent
from strands.models import BedrockModel

from app.config import settings
from app.models.paperwork_watch import (
    PaperworkAlert,
)


logger = logging.getLogger(__name__)


class WatchAgentOutput(BaseModel):
    summary: str


bedrock_model = BedrockModel(
    model_id=settings.bedrock_model_id,
    region_name=settings.bedrock_region,
    temperature=settings.bedrock_temperature,
)


paperwork_watch_agent = Agent(
    model=bedrock_model,
    system_prompt=(
        "You are Clerkly's Paperwork Watch Agent. "
        "You quietly monitor unfinished paperwork and "
        "surface only items that genuinely need the "
        "user's attention. "
        "Prioritize overdue tasks, deadlines within two "
        "days, failed execution, approval, payment, and "
        "signature requirements. "
        "Write one short daily summary in clear language. "
        "Do not invent facts, dates, amounts, or actions. "
        "Do not claim that an action was completed. "
        "Keep the summary under 100 words."
    ),
)


def create_fallback_summary(
    alerts: list[PaperworkAlert],
) -> str:
    if not alerts:
        return (
            "No unfinished paperwork currently requires "
            "your attention."
        )

    urgent_count = sum(
        alert.severity == "urgent"
        for alert in alerts
    )

    warning_count = sum(
        alert.severity == "warning"
        for alert in alerts
    )

    parts: list[str] = []

    if urgent_count:
        urgent_label = (
            "item requires"
            if urgent_count == 1
            else "items require"
        )

        parts.append(
            f"{urgent_count} urgent paperwork "
            f"{urgent_label} your attention"
        )

    if warning_count:
        warning_label = (
            "item should"
            if warning_count == 1
            else "items should"
        )

        parts.append(
            f"{warning_count} upcoming "
            f"{warning_label} be reviewed"
        )

    if not parts:
        alert_count = len(alerts)

        alert_label = (
            "item requires"
            if alert_count == 1
            else "items require"
        )

        parts.append(
            f"{alert_count} paperwork "
            f"{alert_label} attention"
        )

    highest_priority = next(
        (
            alert
            for alert in alerts
            if alert.severity == "urgent"
        ),
        alerts[0],
    )

    return (
        f"{'; '.join(parts)}. "
        f"Highest priority: {highest_priority.title}. "
        f"{highest_priority.message}"
    )

def generate_watch_summary(
    alerts: list[PaperworkAlert],
) -> tuple[
    str,
    Literal[
        "strands",
        "deterministic_fallback",
    ],
]:
    if not alerts:
        return (
            create_fallback_summary(alerts),
            "deterministic_fallback",
        )

    alert_data = [
        alert.model_dump(mode="json")
        for alert in alerts
    ]

    prompt = (
        "Create today's paperwork summary from the "
        "following verified alerts. Only use the provided "
        "information:\n"
        f"{json.dumps(alert_data, indent=2)}"
    )

    try:
        result = paperwork_watch_agent(
            prompt,
            structured_output_model=WatchAgentOutput,
        )

        output = result.structured_output

        if output is None or not output.summary.strip():
            raise ValueError(
                "The Watch Agent returned an empty summary"
            )

        return output.summary.strip(), "strands"

    except Exception as error:
        # Bedrock access is currently restricted for some
        # accounts. Deadline detection must continue working.
        logger.warning(
            "Paperwork Watch Agent unavailable; using "
            "deterministic fallback: %s",
            error,
        )

        return (
            create_fallback_summary(alerts),
            "deterministic_fallback",
        )