from typing import Literal

from pydantic import BaseModel


class CheckoutSessionResponse(BaseModel):
    provider: Literal["stripe"] = "stripe"
    session_id: str
    checkout_url: str
    payment_status: str