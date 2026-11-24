
from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field


class ReviewCreate(BaseModel):
    decision: Literal[
        "proceed",
        "hold",
        "do_not_proceed"
    ]

    reviewer: str = Field(min_length=1, max_length=150)

    notes: Optional[str] = None


class ReviewResponse(BaseModel):
    review_id: int
    application_id: int
    reviewer: str
    decision: Literal[
        "proceed",
        "hold",
        "do_not_proceed"
    ]
    notes: Optional[str] = None
    reviewed_at: datetime

    model_config = ConfigDict(from_attributes=True)
