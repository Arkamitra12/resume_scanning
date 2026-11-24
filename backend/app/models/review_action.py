
from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    ForeignKey,
    CheckConstraint
)
from sqlalchemy.sql import func

from app.database import Base


class ReviewAction(Base):
    __tablename__ = "review_actions"

    review_id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    application_id = Column(
        Integer,
        ForeignKey("applications.application_id", ondelete="CASCADE"),
        nullable=False,
        unique=True
    )

    reviewer = Column(
        String(150),
        nullable=False
    )

    decision = Column(
        String(30),
        nullable=False
    )

    notes = Column(
        Text,
        nullable=True
    )

    reviewed_at = Column(
        DateTime,
        nullable=False,
        server_default=func.current_timestamp()
    )

    __table_args__ = (
        CheckConstraint(
            "decision IN ('proceed', 'hold', 'do_not_proceed')",
            name="chk_review_decision"
        ),
    )
