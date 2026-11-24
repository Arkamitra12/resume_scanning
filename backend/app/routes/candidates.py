# from fastapi import APIRouter, Depends
# from sqlalchemy.orm import Session
#
# from app.database import get_db
# from app.models import Candidate, User
# from app.schemas.candidate import CandidateResponse
# from app.utils.auth_dependencies import require_role
#
# router = APIRouter(
#     prefix="/candidates",
#     tags=["Candidate Management"]
# )
#
#
# # Get all candidates (Recruiter only)
# @router.get(
#     "",
#     response_model=list[CandidateResponse]
# )
# def get_all_candidates(
#         db: Session = Depends(get_db),
#         current_user: User = Depends(require_role("recruiter"))
# ):
#     candidates = db.query(Candidate).order_by(
#         Candidate.created_at.desc()
#     ).all()
#
#     return candidates


from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Candidate, User, Application, ReviewAction
from app.schemas.candidate import (
    CandidateResponse,
    CandidateApplicationStatusResponse
)
from app.utils.auth_dependencies import require_role


router = APIRouter(
    prefix="/candidates",
    tags=["Candidate Management"]
)


# Get all candidates (Recruiter only)
@router.get(
    "",
    response_model=list[CandidateResponse]
)
def get_all_candidates(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("recruiter"))
):
    candidates = db.query(Candidate).order_by(
        Candidate.created_at.desc()
    ).all()

    return candidates


# Get applications and their review decisions (Candidate only)
@router.get(
    "/my-applications",
    response_model=list[CandidateApplicationStatusResponse]
)
def get_my_applications(
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

    # Retrieve all applications and their human reviews
    applications = (
        db.query(Application, ReviewAction)
        .outerjoin(
            ReviewAction,
            Application.application_id == ReviewAction.application_id
        )
        .filter(
            Application.candidate_id == candidate.candidate_id
        )
        .order_by(Application.submitted_at.desc())
        .all()
    )

    results = []

    for application, review in applications:

        results.append({
            "application_id": application.application_id,
            "application_status": application.status,
            "final_decision": review.decision if review else "pending",
            "recruiter_notes": review.notes if review else None,
            "reviewed_at": review.reviewed_at if review else None
        })

    return results



# Get individual candidate details (Recruiter only)
@router.get(
    "/{candidate_id}",
    response_model=CandidateResponse
)
def get_candidate_by_id(
    candidate_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("recruiter"))
):

    candidate = db.query(Candidate).filter(
        Candidate.candidate_id == candidate_id
    ).first()

    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate not found"
        )

    return candidate
