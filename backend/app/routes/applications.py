
from pathlib import Path
from uuid import uuid4

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
    UploadFile,
    File,
    Form
)
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.database import get_db
from app.models import Job, Candidate, Application, User
from app.schemas.application import ApplicationResponse
from app.utils.auth_dependencies import require_role
from app.utils.pdf_processor import extract_resume_text, MAX_FILE_SIZE


router = APIRouter(
    prefix="/applications",
    tags=["Application Management"]
)


# Directory where uploaded resumes will be stored
UPLOAD_DIR = (
    Path(__file__).resolve().parents[2]
    / "uploads"
    / "resumes"
)


# Submit a job application with PDF resume (Candidate only)
@router.post(
    "",
    response_model=ApplicationResponse,
    status_code=status.HTTP_201_CREATED
)
async def submit_application(
    job_id: int = Form(...),
    resume: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("candidate"))
):

    # Find the candidate linked to the logged-in user
    candidate = db.query(Candidate).filter(
        Candidate.user_id == current_user.user_id
    ).first()

    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate profile not found"
        )

    # Check whether the job exists
    job = db.query(Job).filter(
        Job.job_id == job_id
    ).first()

    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )

    # Check whether the job is open
    if job.status != "open":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This job is closed"
        )

    # Prevent duplicate applications
    existing_application = db.query(Application).filter(
        Application.job_id == job_id,
        Application.candidate_id == candidate.candidate_id
    ).first()

    if existing_application:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You have already applied for this job"
        )

    # Validate PDF filename
    if not resume.filename or not resume.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF resumes are allowed"
        )

    # Read uploaded PDF (maximum 5 MB)
    file_content = await resume.read(MAX_FILE_SIZE + 1)

    try:
        # Extract text to validate the PDF
        extract_resume_text(file_content)

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

    # Create upload directory if it does not exist
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

    # Generate a unique filename
    saved_filename = (
        f"application_{candidate.candidate_id}_{uuid4().hex}.pdf"
    )

    file_path = UPLOAD_DIR / saved_filename

    try:
        # Save PDF file
        with open(file_path, "wb") as pdf_file:
            pdf_file.write(file_content)

        # Store PDF path in PostgreSQL
        new_application = Application(
            job_id=job_id,
            candidate_id=candidate.candidate_id,
            resume_file_path=str(file_path),
            status="submitted"
        )

        db.add(new_application)
        db.commit()
        db.refresh(new_application)

        return new_application

    except IntegrityError:
        db.rollback()

        if file_path.exists():
            file_path.unlink()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You have already applied for this job"
        )

    except Exception:
        db.rollback()

        if file_path.exists():
            file_path.unlink()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to submit application."
        )

    finally:
        await resume.close()

# Get individual application details (Recruiter only)
@router.get(
    "/{application_id}",
    response_model=ApplicationResponse
)
def get_application_by_id(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("recruiter"))
):

    application = db.query(Application).filter(
        Application.application_id == application_id
    ).first()

    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )

    return application


# Get all applications (Recruiter only)
@router.get(
    "",
    response_model=list[ApplicationResponse]
)
def get_all_applications(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("recruiter"))
):

    applications = db.query(Application).order_by(
        Application.submitted_at.desc()
    ).all()

    return applications


# from fastapi import APIRouter, Depends, HTTPException, status
# from sqlalchemy.orm import Session
#
# from app.database import get_db
# from app.models import Job, Candidate, Application, User
# from app.schemas.application import ApplicationCreate, ApplicationResponse
# from app.utils.auth_dependencies import require_role
#
#
# router = APIRouter(
#     prefix="/applications",
#     tags=["Application Management"]
# )
#
#
# # Submit a job application (Candidate only)
# @router.post(
#     "",
#     response_model=ApplicationResponse,
#     status_code=status.HTTP_201_CREATED
# )
# def submit_application(
#     data: ApplicationCreate,
#     db: Session = Depends(get_db),
#     current_user: User = Depends(require_role("candidate"))
# ):
#     # Check whether the job exists and is open
#     job = db.query(Job).filter(
#         Job.job_id == data.job_id
#     ).first()
#
#     if not job:
#         raise HTTPException(
#             status_code=status.HTTP_404_NOT_FOUND,
#             detail="Job not found"
#         )
#
#     if job.status != "open":
#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST,
#             detail="This job is closed"
#         )
#
#     # Find the candidate linked to the logged-in user
#     candidate = db.query(Candidate).filter(
#         Candidate.user_id == current_user.user_id
#     ).first()
#
#     if not candidate:
#         raise HTTPException(
#             status_code=status.HTTP_404_NOT_FOUND,
#             detail="Candidate profile not found"
#         )
#
#     # Prevent duplicate applications
#     existing_application = db.query(Application).filter(
#         Application.job_id == data.job_id,
#         Application.candidate_id == candidate.candidate_id
#     ).first()
#
#     if existing_application:
#         raise HTTPException(
#             status_code=status.HTTP_409_CONFLICT,
#             detail="You have already applied for this job"
#         )
#
#     # Save resume text temporarily in resume_file_path
#     new_application = Application(
#         job_id=data.job_id,
#         candidate_id=candidate.candidate_id,
#         resume_file_path=data.resume_text,
#         status="submitted"
#     )
#
#     db.add(new_application)
#
#     try:
#         db.commit()
#         db.refresh(new_application)
#
#     except Exception:
#         db.rollback()
#         raise HTTPException(
#             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             detail="Failed to submit application."
#         )
#
#     return new_application
