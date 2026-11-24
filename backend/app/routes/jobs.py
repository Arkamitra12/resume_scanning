
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models import (
    Job,
    User,
    Application,
    ScreeningResult,
    ReviewAction
)
from app.schemas.job import (
    JobCreate,
    JobResponse,
    JobSummaryResponse
)
from app.utils.auth_dependencies import require_role


router = APIRouter(
    prefix="/jobs",
    tags=["Job Management"]
)


# Create a new job (Recruiter only)
@router.post(
    "",
    response_model=JobResponse,
    status_code=status.HTTP_201_CREATED
)
def create_job(
    data: JobCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("recruiter"))
):
    new_job = Job(
        created_by=current_user.user_id,
        title=data.title,
        description=data.description,
        required_skills=data.required_skills,
        status="open"
    )

    db.add(new_job)
    db.commit()
    db.refresh(new_job)

    return new_job


# Get all jobs
@router.get(
    "",
    response_model=list[JobResponse]
)
def get_all_jobs(
    db: Session = Depends(get_db)
):
    jobs = (
        db.query(Job)
        .order_by(Job.created_at.desc())
        .all()
    )

    return jobs


# Get job details by ID
@router.get(
    "/{job_id}",
    response_model=JobResponse
)
def get_job_by_id(
    job_id: int,
    db: Session = Depends(get_db)
):
    job = (
        db.query(Job)
        .filter(Job.job_id == job_id)
        .first()
    )

    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )

    return job


# Get job application and screening summary (Recruiter only)
@router.get(
    "/{job_id}/summary",
    response_model=JobSummaryResponse
)
def get_job_summary(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("recruiter"))
):
    # Check whether the job exists
    job = (
        db.query(Job)
        .filter(Job.job_id == job_id)
        .first()
    )

    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )

    # Count applications by status
    application_counts = db.query(
        func.count(Application.application_id).label("total"),
        func.count(Application.application_id)
        .filter(Application.status == "submitted")
        .label("submitted"),
        func.count(Application.application_id)
        .filter(Application.status == "screened")
        .label("screened"),
        func.count(Application.application_id)
        .filter(Application.status == "screening_failed")
        .label("screening_failed"),
        func.count(Application.application_id)
        .filter(Application.status == "reviewed")
        .label("reviewed")
    ).filter(
        Application.job_id == job_id
    ).one()

    # Calculate average AI match percentage
    average_match = (
        db.query(func.avg(ScreeningResult.match_percentage))
        .join(
            Application,
            Application.application_id == ScreeningResult.application_id
        )
        .filter(Application.job_id == job_id)
        .scalar()
    )

    # Find the latest review action for each application
    latest_reviews = (
        db.query(
            func.max(ReviewAction.review_id).label("review_id")
        )
        .join(
            Application,
            Application.application_id == ReviewAction.application_id
        )
        .filter(Application.job_id == job_id)
        .group_by(ReviewAction.application_id)
        .subquery()
    )

    # Count the latest recruiter decisions
    review_counts = (
        db.query(
            ReviewAction.decision,
            func.count(ReviewAction.review_id)
        )
        .join(
            latest_reviews,
            ReviewAction.review_id == latest_reviews.c.review_id
        )
        .group_by(ReviewAction.decision)
        .all()
    )

    # Convert review counts into a dictionary
    decisions = {
        decision: count
        for decision, count in review_counts
    }

    return JobSummaryResponse(
        job_id=job.job_id,
        job_title=job.title,

        total_applications=application_counts.total,
        submitted_applications=application_counts.submitted,
        screened_applications=application_counts.screened,
        screening_failed_applications=application_counts.screening_failed,
        reviewed_applications=application_counts.reviewed,

        average_match_percentage=(
            round(float(average_match), 2)
            if average_match is not None
            else None
        ),

        proceed_count=decisions.get("proceed", 0),
        hold_count=decisions.get("hold", 0),
        do_not_proceed_count=decisions.get("do_not_proceed", 0)
    )
