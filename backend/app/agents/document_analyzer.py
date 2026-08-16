from typing import Optional

from pydantic import BaseModel
from strands import Agent
from strands.models import BedrockModel

from app.config import settings

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


def analyze_document(content: str) -> DocumentAnalysis:
    result = document_analyzer_agent(
        content,
        structured_output_model=DocumentAnalysis,
    )

    return result.structured_output