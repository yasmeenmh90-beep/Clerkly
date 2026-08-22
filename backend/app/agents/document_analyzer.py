import logging
import re
from typing import Optional

from botocore.exceptions import BotoCoreError, ClientError
from pydantic import BaseModel
from strands import Agent
from strands.models import BedrockModel

from app.config import settings

logger = logging.getLogger(__name__)


class DocumentAnalysis(BaseModel):
    title: str
    description: str
    deadline: Optional[str] = None
    required_action: str

    requires_signature: bool = False
    requires_payment: bool = False

    payment_amount: Optional[float] = None
    currency: Optional[str] = None


bedrock_model = BedrockModel(
    model_id=settings.bedrock_model_id,
    region_name=settings.bedrock_region,
    temperature=settings.bedrock_temperature,
)


document_analyzer_agent = Agent(
    model=bedrock_model,
    system_prompt="""
You are the Clerkly Document Analyzer Agent.

Analyze the supplied paperwork and extract:

- a clear short title
- a short description
- deadline in YYYY-MM-DD format, if explicitly stated
- required action
- whether a signature is required
- whether payment is required
- payment amount, if explicitly stated
- currency, if explicitly stated

Rules:

- Do not invent missing information.
- Return null if no deadline is stated.
- Return null if no payment amount is stated.
- Return null if no currency is stated.
- Set requires_signature to true only when signing is required.
- Set requires_payment to true only when payment is required.
""",
)


def _fallback_analyze_document(
    content: str,
    filename: str,
) -> DocumentAnalysis:
    """
    Deterministic, rule-based document analysis used when
    Bedrock is unreachable. It won't understand the document
    the way the AI agent does, but it still lets the user get
    a task out of their upload instead of a hard failure —
    same reasoning as the fallback already used for email
    intake and the Paperwork Planner Agent.
    """

    title = (
        filename.rsplit(".", 1)[0]
        .replace("_", " ")
        .replace("-", " ")
        .strip()
        .title()
    ) or "Uploaded Document"

    lowered_content = content.lower()

    requires_signature = any(
        keyword in lowered_content
        for keyword in ("sign", "signature", "signed")
    )

    requires_payment = any(
        keyword in lowered_content
        for keyword in (
            "pay",
            "payment",
            "amount due",
            "invoice",
            "$",
            "aed",
            "usd",
        )
    )

    payment_amount = None
    currency = None

    dollar_match = re.search(
        r"(?:\$|usd)\s?([\d,]+\.?\d*)",
        content,
        re.IGNORECASE,
    )

    aed_match = re.search(
        r"([\d,]+\.?\d*)\s?aed",
        content,
        re.IGNORECASE,
    )

    if dollar_match:
        payment_amount = float(
            dollar_match.group(1).replace(",", "")
        )
        currency = "USD"
    elif aed_match:
        payment_amount = float(
            aed_match.group(1).replace(",", "")
        )
        currency = "AED"

    deadline = None

    date_match = re.search(r"(\d{4}-\d{2}-\d{2})", content)

    if date_match:
        deadline = date_match.group(1)

    stripped_lines = [
        line.strip()
        for line in content.strip().splitlines()
        if line.strip()
    ]

    description = (
        stripped_lines[0][:200]
        if stripped_lines
        else "Document uploaded, awaiting manual review."
    )

    return DocumentAnalysis(
        title=title,
        description=description,
        deadline=deadline,
        required_action=(
            "Review this document manually — automatic "
            "analysis was temporarily unavailable."
        ),
        requires_signature=requires_signature,
        requires_payment=requires_payment,
        payment_amount=payment_amount,
        currency=currency,
    )


def analyze_document(
    content: str,
    filename: str = "uploaded_document",
) -> DocumentAnalysis:
    try:
        result = document_analyzer_agent(
            content,
            structured_output_model=DocumentAnalysis,
        )

        return result.structured_output

    except (BotoCoreError, ClientError) as error:
        logger.warning(
            "Bedrock unavailable, using deterministic "
            "fallback for document analysis: %s",
            error,
        )

        return _fallback_analyze_document(
            content=content,
            filename=filename,
        )