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

    # "strands" = Bedrock processed it, "openai_fallback" =
    # OpenAI processed it after Bedrock failed,
    # "deterministic_fallback" = neither AI was reachable.
    analysis_source: str = "strands"


SYSTEM_PROMPT = """
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
"""


bedrock_model = BedrockModel(
    model_id=settings.bedrock_model_id,
    region_name=settings.bedrock_region,
    temperature=settings.bedrock_temperature,
)

document_analyzer_agent = Agent(
    model=bedrock_model,
    system_prompt=SYSTEM_PROMPT,
)


def _get_openai_agent() -> Optional[Agent]:
    """
    Builds the OpenAI-backed agent lazily, only if a key is
    configured — mirrors how the rest of the app treats
    optional integrations (Stripe, DocuSign, Gmail).
    """

    if not settings.openai_is_configured:
        return None

    from strands.models.openai import OpenAIModel

    openai_model = OpenAIModel(
        client_args={"api_key": settings.openai_api_key},
        model_id=settings.openai_model_id,
        params={
            "max_tokens": 1000,
            "temperature": 0.2,
        },
    )

    return Agent(
        model=openai_model,
        system_prompt=SYSTEM_PROMPT,
    )


def _fallback_analyze_document(
    content: str,
    filename: str,
) -> DocumentAnalysis:
    """
    Deterministic, rule-based document analysis used when
    neither Bedrock nor OpenAI is reachable. It won't
    understand the document the way a real model does, but it
    still lets the user get a task out of their upload instead
    of a hard failure.
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
        analysis_source="deterministic_fallback",
    )


def analyze_document(
    content: str,
    filename: str = "uploaded_document",
) -> DocumentAnalysis:
    # Layer 1: Amazon Bedrock
    try:
        result = document_analyzer_agent(
            content,
            structured_output_model=DocumentAnalysis,
        )

        analysis = result.structured_output
        analysis.analysis_source = "strands"

        return analysis

    except (BotoCoreError, ClientError) as bedrock_error:
        logger.warning(
            "Bedrock unavailable for document analysis: %s",
            bedrock_error,
        )

        # Layer 2: OpenAI, only if a key is configured
        openai_agent = _get_openai_agent()

        if openai_agent is not None:
            try:
                result = openai_agent(
                    content,
                    structured_output_model=DocumentAnalysis,
                )

                analysis = result.structured_output
                analysis.analysis_source = "openai_fallback"

                logger.info(
                    "Bedrock was unavailable; OpenAI "
                    "successfully analyzed the document instead."
                )

                return analysis

            except Exception as openai_error:
                logger.warning(
                    "OpenAI fallback also unavailable for "
                    "document analysis: %s",
                    openai_error,
                )

        # Layer 3: deterministic rule-based fallback
        return _fallback_analyze_document(
            content=content,
            filename=filename,
        )