
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import (
    Application,
    Job,
    User,
    ScreeningResult as ScreeningResultModel
)
from app.schemas.screening import ScreeningRecordResponse
from app.services.screening_service import (
    screen_resume,
    ScreeningServiceError,
    FOUNDRY_MODEL
)
from app.utils.auth_dependencies import require_role
from app.utils.pdf_processor import extract_resume_text


router = APIRouter(
    prefix="/applications",
    tags=["AI Resume Screening"]
)


# Screen all applications belonging to a job (Recruiter only)
@router.post("/screen-all/{job_id}")
async def screen_all_applications(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("recruiter"))
):

    # Find the job
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

    # Fetch all applications submitted for this job
    applications = (
        db.query(Application)
        .filter(Application.job_id == job_id)
        .all()
    )

    if not applications:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No applications found for this job"
        )

    screening_results = []
    skipped_applications = []
    failed_applications = []

    # Screen each application
    for application in applications:

        # Skip applications already reviewed by the administrator
        if application.status == "reviewed":
            skipped_applications.append({
                "application_id": application.application_id,
                "reason": "Application already reviewed"
            })
            continue

        # Check whether resume path or text exists
        if not application.resume_file_path:
            failed_applications.append({
                "application_id": application.application_id,
                "reason": "Resume is missing"
            })
            continue

        stored_resume = application.resume_file_path

        # Extract text from PDF or use legacy raw resume text
        try:

            resume_path = Path(stored_resume)

            if resume_path.suffix.lower() == ".pdf":

                if not resume_path.is_file():
                    failed_applications.append({
                        "application_id": application.application_id,
                        "reason": "Resume PDF file not found"
                    })
                    continue

                file_content = resume_path.read_bytes()

                resume_text = extract_resume_text(file_content)

            else:
                # Backward compatibility for old text-based applications
                resume_text = stored_resume

        except (ValueError, OSError) as error:
            failed_applications.append({
                "application_id": application.application_id,
                "reason": str(error)
            })
            continue

        # Run AI screening
        try:
            result = await screen_resume(
                resume_text=resume_text,
                job_description=job.description,
                required_skills=job.required_skills
            )

        except ScreeningServiceError as error:
            failed_applications.append({
                "application_id": application.application_id,
                "reason": error.message,
                "error_code": error.error_code
            })
            continue

        # Convert requirement checks into JSON-compatible data
        requirement_checks = [
            check.model_dump(mode="json")
            for check in result.requirement_checks
        ]

        # Check whether a screening result already exists
        screening_record = (
            db.query(ScreeningResultModel)
            .filter(
                ScreeningResultModel.application_id
                == application.application_id
            )
            .order_by(ScreeningResultModel.screening_id.desc())
            .first()
        )

        # Update existing result or create a new one
        if screening_record:

            screening_record.extracted_skills = result.extracted_skills
            screening_record.requirement_checks = requirement_checks
            screening_record.summary = result.summary
            screening_record.interview_questions = result.interview_questions
            screening_record.match_percentage = result.match_percentage
            screening_record.model_name = FOUNDRY_MODEL

        else:

            screening_record = ScreeningResultModel(
                application_id=application.application_id,
                extracted_skills=result.extracted_skills,
                requirement_checks=requirement_checks,
                summary=result.summary,
                interview_questions=result.interview_questions,
                match_percentage=result.match_percentage,
                model_name=FOUNDRY_MODEL
            )

            db.add(screening_record)

        # Update application status
        application.status = "screened"

        # Save each candidate's result separately
        try:
            db.commit()
            db.refresh(screening_record)

            screening_results.append(
                ScreeningRecordResponse.model_validate(
                    screening_record
                ).model_dump(mode="json")
            )

        except Exception:
            db.rollback()
            failed_applications.append({
                "application_id": application.application_id,
                "reason": "Failed to save screening result"
            })

    return {
        "job_id": job_id,
        "total_applications": len(applications),
        "screened_count": len(screening_results),
        "skipped_count": len(skipped_applications),
        "failed_count": len(failed_applications),
        "screening_results": screening_results,
        "skipped_applications": skipped_applications,
        "failed_applications": failed_applications
    }


# Retrieve an individual application's screening result (Recruiter only)
@router.get(
    "/{application_id}/screening",
    response_model=ScreeningRecordResponse
)
def get_screening_result(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("recruiter"))
):

    # Check whether the application exists
    application = (
        db.query(Application)
        .filter(Application.application_id == application_id)
        .first()
    )

    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )

    # Retrieve the latest screening result
    screening_record = (
        db.query(ScreeningResultModel)
        .filter(
            ScreeningResultModel.application_id == application_id
        )
        .order_by(ScreeningResultModel.screening_id.desc())
        .first()
    )

    if not screening_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Screening result not found"
        )

    return screening_record
