from datetime import date
from typing import Optional, Literal

from pydantic import BaseModel, ConfigDict, Field

from fastapi import APIRouter, Depends, HTTPException, Query, Response

class Task(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    task_id: str
    title: str
    description: Optional[str] = None

    source: Literal["email", "document", "manual"]

    status: Literal[
        "pending",
        "in_progress",
        "awaiting_approval",
        "approved",
        "completed",
        "rejected",
        "failed",
    ] = "pending"

    deadline: Optional[date] = None

    required_action: Optional[str] = None

    requires_signature: bool = False
    requires_payment: bool = False

    payment_amount: Optional[float] = Field(default=None, ge=0)
    currency: Optional[str] = None

    approval_required: bool = False

    # Set by the Planner Agent (paperwork_planner_agent.py).
    plan_reasoning: Optional[str] = None
    plan_source: Optional[
        Literal[
            "strands", "openai_fallback", "deterministic_fallback"
        ]
    ] = None

    # Set by the Document Analyzer Agent (document_analyzer.py).
    # Tracks whether Bedrock, OpenAI, or the deterministic
    # fallback actually processed this document.
    analysis_source: Optional[
        Literal[
            "strands", "openai_fallback", "deterministic_fallback"
        ]
    ] = None

    # DocuSign (sandbox) signature tracking, mirrors the
    # existing Stripe payment tracking fields below.
    signature_provider: Optional[str] = None
    signature_envelope_id: Optional[str] = None
    signature_status: Optional[
        Literal["sent", "signed", "declined", "voided"]
    ] = None