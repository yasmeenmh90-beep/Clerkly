from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class TaskEvent(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    event_id: int
    task_id: str
    event_type: str

    previous_status: Optional[str] = None
    new_status: str

    message: Optional[str] = None
    created_at: datetime