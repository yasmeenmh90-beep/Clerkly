from datetime import date
from typing import Optional, Literal

from pydantic import BaseModel, ConfigDict, Field


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

    plan_reasoning: Optional[str] = None
    plan_source: Optional[
        Literal[
            "strands", "openai_fallback", "deterministic_fallback"
        ]
    ] = None

    analysis_source: Optional[
        Literal[
            "strands", "openai_fallback", "deterministic_fallback"
        ]
    ] = None

    original_filename: Optional[str] = None
    original_file_path: Optional[str] = None

    signature_provider: Optional[str] = None
    signature_envelope_id: Optional[str] = None
    signature_status: Optional[
        Literal["sent", "signed", "declined", "voided"]
    ] = None

    # --------------------------------------------------
    # Attribution — read automatically off TaskRecord's
    # owner/approver relationships. Always None for tasks
    # created before this feature, or for auto-completed /
    # rejected tasks that never went through approval.
    # --------------------------------------------------

    owner_name: Optional[str] = None
    owner_email: Optional[str] = None
    approved_by_name: Optional[str] = None
    approved_by_email: Optional[str] = None