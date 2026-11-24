
from enum import Enum
from typing import Optional
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


# Possible statuses for each job requirement
class RequirementStatus(str, Enum):
    SUPPORTED = "supported"
    NOT_FOUND = "not_found"
    UNCLEAR = "unclear"


# Result for one required skill
class RequirementCheck(BaseModel):
    requirement: str
    status: RequirementStatus
    evidence: Optional[str] = None


# AI screening result
class ScreeningResult(BaseModel):
    extracted_skills: list[str] = Field(default_factory=list)
    requirement_checks: list[RequirementCheck] = Field(default_factory=list)
    summary: str
    interview_questions: list[str] = Field(min_length=2, max_length=3)
    match_percentage: float = Field(ge=0, le=100)

    model_config = ConfigDict(from_attributes=True)


# Request body for the screening API
class ScreeningRequest(BaseModel):
    resume_text: str = Field(min_length=1)


# Response returned from the database
class ScreeningRecordResponse(BaseModel):
    screening_id: int
    application_id: int
    extracted_skills: list[str]
    requirement_checks: list[RequirementCheck]
    summary: str
    interview_questions: list[str]
    model_name: Optional[str] = None
    created_at: datetime
    match_percentage: float

    model_config = ConfigDict(from_attributes=True)
