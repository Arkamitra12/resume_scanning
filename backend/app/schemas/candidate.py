# from pydantic import BaseModel, ConfigDict, EmailStr
# from datetime import datetime
#
#
# class CandidateResponse(BaseModel):
#     candidate_id: int
#     user_id: int | None
#     name: str
#     email: EmailStr
#     created_at: datetime
#
#     model_config = ConfigDict(from_attributes=True)


from pydantic import BaseModel, ConfigDict, EmailStr
from datetime import datetime
from typing import Literal, Optional


class CandidateResponse(BaseModel):
    candidate_id: int
    user_id: int | None
    name: str
    email: EmailStr
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CandidateApplicationStatusResponse(BaseModel):
    application_id: int

    application_status: Literal[
        "submitted",
        "screening_failed",
        "screened",
        "reviewed"
    ]

    final_decision: Literal[
        "pending",
        "proceed",
        "hold",
        "do_not_proceed"
    ]

    recruiter_notes: Optional[str] = None
    reviewed_at: Optional[datetime] = None
