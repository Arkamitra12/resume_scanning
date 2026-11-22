
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Job, User
from app.schemas.job import JobCreate, JobResponse
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
