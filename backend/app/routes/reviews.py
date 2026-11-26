from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.database import get_db
from app.models import Application, ReviewAction, ScreeningResult, User
from app.schemas.review import ReviewCreate, ReviewResponse
from app.utils.auth_dependencies import require_role


router = APIRouter(
    prefix="/applications",
    tags=["Human Review"]
)


# ==========================================
# SUBMIT HUMAN REVIEW
# ==========================================
@router.post(
    "/{application_id}/review",
    response_model=ReviewResponse,
    status_code=status.HTTP_201_CREATED
)
def submit_review(
    application_id: int,
    review_data: ReviewCreate,
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

    if application.status not in ["screened", "screening_failed"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Application must be screened or have a screening failure before recruiter review"
        )

    latest_screening = db.query(ScreeningResult).filter(
        ScreeningResult.application_id == application_id
    ).order_by(
        ScreeningResult.screening_id.desc()
    ).first()

    if application.status == "screened" and not latest_screening:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No screening result found for this application"
        )

    existing_review = db.query(ReviewAction).filter(
        ReviewAction.application_id == application_id
    ).first()

    if existing_review:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This application has already been reviewed"
        )

    new_review = ReviewAction(
        application_id=application_id,
        reviewer=review_data.reviewer,
        decision=review_data.decision,
        notes=review_data.notes
    )

    db.add(new_review)

    application.status = "reviewed"

    try:
        db.commit()
        db.refresh(new_review)

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A review already exists for this application"
        )

    return new_review


# ==========================================
# GET SAVED HUMAN REVIEW
# ==========================================
@router.get(
    "/{application_id}/review",
    response_model=ReviewResponse
)
def get_review(
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

    review = db.query(ReviewAction).filter(
        ReviewAction.application_id == application_id
    ).first()

    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found for this application"
        )

    return review