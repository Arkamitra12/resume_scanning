
from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    ForeignKey,
    UniqueConstraint,
    CheckConstraint
)
from sqlalchemy.sql import func

from app.database import Base


class Application(Base):

    __tablename__ = "applications"

    application_id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    job_id = Column(
        Integer,
        ForeignKey("jobs.job_id", ondelete="RESTRICT"),
        nullable=False,
        index=True
    )

    candidate_id = Column(
        Integer,
        ForeignKey("candidates.candidate_id", ondelete="RESTRICT"),
        nullable=False,
        index=True
    )

    resume_file_path = Column(
        String,
        nullable=False
    )

    submitted_at = Column(
        DateTime,
        nullable=False,
        server_default=func.current_timestamp()
    )

    status = Column(
        String(30),
        nullable=False,
        default="submitted"
    )

    __table_args__ = (
        UniqueConstraint(
            "job_id",
            "candidate_id",
            name="uq_job_candidate"
        ),

        CheckConstraint(
            "status IN ('submitted', 'screening_failed', 'screened', 'reviewed')",
            name="chk_application_status"
        ),
    )
