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