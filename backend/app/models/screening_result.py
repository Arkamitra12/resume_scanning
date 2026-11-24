
from sqlalchemy import (
    Column,
    Integer,
    Text,
    DateTime,
    String,
    ForeignKey,
    CheckConstraint,
    Float
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func

from app.database import Base


class ScreeningResult(Base):
    __tablename__ = "screening_results"

    screening_id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    application_id = Column(
        Integer,
        ForeignKey("applications.application_id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    extracted_skills = Column(
        JSONB,
        nullable=False,
        default=list
    )

    requirement_checks = Column(
        JSONB,
        nullable=False,
        default=list
    )

    summary = Column(
        Text,
        nullable=False
    )

    interview_questions = Column(
        JSONB,
        nullable=False,
        default=list
    )

    model_name = Column(
        String(150),
        nullable=True
    )

    created_at = Column(
        DateTime,
        nullable=False,
        server_default=func.current_timestamp()
    )

    match_percentage = Column(
        Float,
        nullable=False
    )

    __table_args__ = (
        CheckConstraint(
            "jsonb_typeof(extracted_skills) = 'array'",
            name="chk_extracted_skills_array"
        ),
        CheckConstraint(
            "jsonb_typeof(requirement_checks) = 'array'",
            name="chk_requirement_checks_array"
        ),
        CheckConstraint(
            "jsonb_typeof(interview_questions) = 'array'",
            name="chk_interview_questions_array"
        ),
        CheckConstraint(
            "match_percentage >= 0 AND match_percentage <= 100",
            name="chk_match_percentage"
        ),
    )
