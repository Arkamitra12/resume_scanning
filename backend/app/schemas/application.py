
from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Literal


class ApplicationResponse(BaseModel):
    application_id: int
    job_id: int
    candidate_id: int
    submitted_at: datetime
    candidate_name:str
    status: Literal[
        "submitted",
        "screening_failed",
        "screened",
        "reviewed"
    ]

    model_config = ConfigDict(from_attributes=True)
