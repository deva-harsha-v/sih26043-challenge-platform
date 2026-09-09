from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone

from db.database import get_db
from models.user import User, UserRole
from models.challenge import Challenge
from models.team import Team, TeamMember
from models.submission import Submission, SubmissionStatus
from schemas.submission import SubmissionCreate, SubmissionStatusUpdate, SubmissionResponse
from schemas.team import TeamMemberResponse
from middleware.role_guard import get_current_user, require_role

router = APIRouter(prefix="/submissions", tags=["Submissions"])

def format_submission_response(sub: Submission, db: Session) -> SubmissionResponse:
    team = db.query(Team).filter(Team.id == sub.team_id).first()
    challenge = db.query(Challenge).filter(Challenge.id == sub.challenge_id).first()
    
    members_data = []
    if team:
        memberships = db.query(TeamMember).filter(TeamMember.team_id == team.id).all()
        for m in memberships:
            u = db.query(User).filter(User.id == m.user_id).first()
            if u:
                members_data.append(TeamMemberResponse(
                    id=m.id,
                    team_id=m.team_id,
                    user_id=m.user_id,
                    full_name=u.full_name,
                    email=u.email,
                    role_in_team=m.role_in_team,
                    joined_at=m.joined_at
                ))

    return SubmissionResponse(
        id=sub.id,
        challenge_id=sub.challenge_id,
        challenge_title=challenge.title if challenge else None,
        team_id=sub.team_id,
        team_name=team.name if team else None,
        team_members=members_data,
        title=sub.title,
        description=sub.description,
        document_url=sub.document_url,
        status=sub.status,
        reviewer_notes=sub.reviewer_notes,
        created_at=sub.created_at,
        updated_at=sub.updated_at,
        reviewed_at=sub.reviewed_at
    )

@router.post("", response_model=SubmissionResponse, status_code=status.HTTP_201_CREATED)
def create_or_update_submission(
    payload: SubmissionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("contributor"))
):
    # Fetch team
    team = db.query(Team).filter(Team.id == payload.team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    # Verify user is a member of this team
    is_member = db.query(TeamMember).filter(
        TeamMember.team_id == payload.team_id,
        TeamMember.user_id == current_user.id
    ).first()
    if not is_member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only members of this team can submit solutions"
        )

    # Verify team.challenge_id matches payload.challenge_id
    if team.challenge_id != payload.challenge_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Team challenge_id does not match submission challenge_id"
        )

    # Check for existing submission for (team_id, challenge_id)
    sub = db.query(Submission).filter(
        Submission.team_id == payload.team_id,
        Submission.challenge_id == payload.challenge_id
    ).first()

    now = datetime.now(timezone.utc)
    if sub:
        sub.title = payload.title
        sub.description = payload.description
        sub.document_url = payload.document_url
        sub.status = SubmissionStatus.SUBMITTED
        sub.updated_at = now
    else:
        sub = Submission(
            challenge_id=payload.challenge_id,
            team_id=payload.team_id,
            title=payload.title,
            description=payload.description,
            document_url=payload.document_url,
            status=SubmissionStatus.SUBMITTED,
            created_at=now,
            updated_at=now
        )
        db.add(sub)

    db.commit()
    db.refresh(sub)
    return format_submission_response(sub, db)

@router.get("", response_model=List[SubmissionResponse])
def list_submissions(
    challenge_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    challenge = db.query(Challenge).filter(Challenge.id == challenge_id).first()
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")

    # Check if user is challenge owner org/university or admin
    is_owner = False
    if current_user.role == UserRole.ADMIN:
        is_owner = True
    elif current_user.role == UserRole.ORGANIZATION and current_user.organization:
        if challenge.organization_id == current_user.organization.id:
            is_owner = True

    if is_owner:
        subs = db.query(Submission).filter(Submission.challenge_id == challenge_id).all()
        return [format_submission_response(s, db) for s in subs]

    # If non-owner organization or university user tries to list submissions for another org's challenge -> 403
    if current_user.role in (UserRole.ORGANIZATION, UserRole.UNIVERSITY):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the challenge owner can list all submissions for this challenge"
        )

    # If contributor: show only their team's submission for this challenge
    user_team_ids = [
        tm.team_id for tm in db.query(TeamMember).filter(TeamMember.user_id == current_user.id).all()
    ]
    if not user_team_ids:
        return []

    subs = db.query(Submission).filter(
        Submission.challenge_id == challenge_id,
        Submission.team_id.in_(user_team_ids)
    ).all()
    return [format_submission_response(s, db) for s in subs]

@router.get("/{id}", response_model=SubmissionResponse)
def get_submission(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    sub = db.query(Submission).filter(Submission.id == id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")

    challenge = db.query(Challenge).filter(Challenge.id == sub.challenge_id).first()

    # Access Authorization:
    # 1. Admin
    # 2. Challenge owner org
    # 3. Submitting team member
    is_authorized = False
    if current_user.role == UserRole.ADMIN:
        is_authorized = True
    elif current_user.role == UserRole.ORGANIZATION and current_user.organization and challenge:
        if challenge.organization_id == current_user.organization.id:
            is_authorized = True
    else:
        is_member = db.query(TeamMember).filter(
            TeamMember.team_id == sub.team_id,
            TeamMember.user_id == current_user.id
        ).first()
        if is_member:
            is_authorized = True

    if not is_authorized:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to view this submission"
        )

    return format_submission_response(sub, db)

@router.patch("/{id}/status", response_model=SubmissionResponse)
def update_submission_status(
    id: int,
    payload: SubmissionStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    sub = db.query(Submission).filter(Submission.id == id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")

    challenge = db.query(Challenge).filter(Challenge.id == sub.challenge_id).first()

    # Authorization: Only challenge owner organization or admin can update status
    is_owner = False
    if current_user.role == UserRole.ADMIN:
        is_owner = True
    elif current_user.role == UserRole.ORGANIZATION and current_user.organization and challenge:
        if challenge.organization_id == current_user.organization.id:
            is_owner = True

    if not is_owner:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the challenge owner can update submission status"
        )

    sub.status = payload.status
    if payload.reviewer_notes is not None:
        sub.reviewer_notes = payload.reviewer_notes
    sub.reviewed_at = datetime.now(timezone.utc)
    sub.updated_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(sub)
    return format_submission_response(sub, db)
