
from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    CheckConstraint,
    ForeignKey
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func

from app.database import Base


class Job(Base):
    __tablename__ = "jobs"

    job_id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    created_by = Column(
        Integer,
        ForeignKey("users.user_id", ondelete="RESTRICT"),
        nullable=True,
        index=True
    )

    title = Column(
        String(150),
        nullable=False
    )

    description = Column(
        Text,
        nullable=False
    )

    required_skills = Column(
        JSONB,
        nullable=False,
        default=list
    )

    status = Column(
        String(20),
        nullable=False,
        default="open"
    )

    created_at = Column(
        DateTime,
        nullable=False,
        server_default=func.current_timestamp()
    )

    __table_args__ = (
        CheckConstraint(
            "status IN ('open', 'closed')",
            name="chk_job_status"
        ),
        CheckConstraint(
            "jsonb_typeof(required_skills) = 'array'",
            name="chk_required_skills_array"
        ),
    )

