
from pydantic import BaseModel, Field, ConfigDict
from typing import Literal
from datetime import datetime


class JobCreate(BaseModel):
    title: str = Field(min_length=2, max_length=150)
    description: str = Field(min_length=10)
    required_skills: list[str] = Field(min_length=1)


class JobResponse(BaseModel):
    job_id: int
    title: str
    description: str
    required_skills: list[str]
    status: Literal["open", "closed"]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)



class JobSummaryResponse(BaseModel):
    job_id: int
    job_title: str

    total_applications: int
    submitted_applications: int
    screened_applications: int
    screening_failed_applications: int
    reviewed_applications: int

    average_match_percentage: float | None = None

    proceed_count: int
    hold_count: int
    do_not_proceed_count: int
