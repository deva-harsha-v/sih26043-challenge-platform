from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from db.database import get_db
from models.user import User, UserRole
from models.organization import Organization
from models.university import University
from models.challenge import Challenge, ChallengeStatus
from models.skill import Skill
from schemas.challenge import ChallengeCreate, ChallengeUpdate, ChallengeListItem, ChallengeResponse
from middleware.role_guard import get_current_user, require_role

router = APIRouter(prefix="/challenges", tags=["Challenges"])

def resolve_org_id_for_user(user: User, db: Session) -> int:
    if user.organization:
        return user.organization.id
    if user.university:
        # Check if an organization profile exists or create one mapping to university
        org = db.query(Organization).filter(Organization.user_id == user.id).first()
        if not org:
            org = Organization(user_id=user.id, name=user.university.name)
            db.add(org)
            db.flush()
        return org.id
    # Fallback for admin or user missing org record
    org = db.query(Organization).filter(Organization.user_id == user.id).first()
    if not org:
        org = Organization(user_id=user.id, name=user.full_name)
        db.add(org)
        db.flush()
    return org.id

def attach_skills_to_challenge(challenge: Challenge, skill_names: List[str], db: Session):
    challenge.skills.clear()
    for name in skill_names:
        clean_name = name.strip()
        if not clean_name:
            continue
        skill = db.query(Skill).filter(Skill.name.ilike(clean_name)).first()
        if not skill:
            skill = Skill(name=clean_name, category="General")
            db.add(skill)
            db.flush()
        challenge.skills.append(skill)

def build_challenge_list_item(challenge: Challenge) -> ChallengeListItem:
    status_str = challenge.status.value if hasattr(challenge.status, 'value') else str(challenge.status)
    skill_names = [s.name for s in challenge.skills]
    return ChallengeListItem(
        id=challenge.id,
        organization_id=challenge.organization_id,
        organization_name=challenge.organization.name if challenge.organization else "Organization",
        title=challenge.title,
        description=challenge.description,
        category=challenge.category,
        difficulty=challenge.difficulty,
        reward=challenge.reward,
        max_team_size=challenge.max_team_size,
        status=status_str,
        deadline=challenge.deadline,
        skills=skill_names,
        created_at=challenge.created_at
    )

def build_challenge_response(challenge: Challenge) -> ChallengeResponse:
    status_str = challenge.status.value if hasattr(challenge.status, 'value') else str(challenge.status)
    skill_names = [s.name for s in challenge.skills]
    return ChallengeResponse(
        id=challenge.id,
        organization_id=challenge.organization_id,
        organization_name=challenge.organization.name if challenge.organization else "Organization",
        organization_website=challenge.organization.website if challenge.organization else None,
        title=challenge.title,
        description=challenge.description,
        problem_statement=challenge.problem_statement,
        category=challenge.category,
        difficulty=challenge.difficulty,
        reward=challenge.reward,
        max_team_size=challenge.max_team_size,
        status=status_str,
        deadline=challenge.deadline,
        skills=skill_names,
        created_at=challenge.created_at,
        updated_at=challenge.updated_at
    )

@router.post("", response_model=ChallengeResponse, status_code=status.HTTP_201_CREATED)
def create_challenge(
    request: ChallengeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["organization", "university", "admin"]))
):
    org_id = resolve_org_id_for_user(current_user, db)
    
    new_challenge = Challenge(
        organization_id=org_id,
        title=request.title,
        description=request.description,
        problem_statement=request.problem_statement,
        category=request.category,
        reward=request.reward,
        difficulty=request.difficulty,
        max_team_size=request.max_team_size,
        status=ChallengeStatus.OPEN,
        deadline=request.deadline
    )
    db.add(new_challenge)
    db.flush()

    if request.skills:
        attach_skills_to_challenge(new_challenge, request.skills, db)

    db.commit()
    db.refresh(new_challenge)
    return build_challenge_response(new_challenge)

@router.get("", response_model=List[ChallengeListItem])
def list_challenges(
    search: Optional[str] = Query(None, description="Search keyword in title or description"),
    skill: Optional[str] = Query(None, description="Filter by skill name"),
    status: Optional[str] = Query(None, description="Filter by challenge status"),
    category: Optional[str] = Query(None, description="Filter by category"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(Challenge)

    if search:
        pattern = f"%{search}%"
        query = query.filter((Challenge.title.ilike(pattern)) | (Challenge.description.ilike(pattern)))

    if status:
        query = query.filter(Challenge.status == status)

    if category:
        query = query.filter(Challenge.category.ilike(f"%{category}%"))

    if skill:
        query = query.join(Challenge.skills).filter(Skill.name.ilike(skill))

    query = query.order_by(Challenge.created_at.desc())
    offset = (page - 1) * limit
    challenges = query.offset(offset).limit(limit).all()

    return [build_challenge_list_item(c) for c in challenges]

@router.get("/{challenge_id}", response_model=ChallengeResponse)
def get_challenge(challenge_id: int, db: Session = Depends(get_db)):
    challenge = db.query(Challenge).filter(Challenge.id == challenge_id).first()
    if not challenge:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Challenge not found"
        )
    return build_challenge_response(challenge)

@router.patch("/{challenge_id}", response_model=ChallengeResponse)
def update_challenge(
    challenge_id: int,
    request: ChallengeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    challenge = db.query(Challenge).filter(Challenge.id == challenge_id).first()
    if not challenge:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Challenge not found"
        )

    # Server-side ownership check
    user_org_id = current_user.organization.id if current_user.organization else None
    role_str = current_user.role.value if hasattr(current_user.role, 'value') else str(current_user.role)

    if role_str != "admin" and challenge.organization_id != user_org_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to edit this challenge"
        )

    update_data = request.model_dump(exclude_unset=True)
    skills_data = update_data.pop("skills", None)

    for field, val in update_data.items():
        if val is not None:
            setattr(challenge, field, val)

    if skills_data is not None:
        attach_skills_to_challenge(challenge, skills_data, db)

    db.commit()
    db.refresh(challenge)
    return build_challenge_response(challenge)

@router.delete("/{challenge_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_challenge(
    challenge_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    challenge = db.query(Challenge).filter(Challenge.id == challenge_id).first()
    if not challenge:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Challenge not found"
        )

    user_org_id = current_user.organization.id if current_user.organization else None
    role_str = current_user.role.value if hasattr(current_user.role, 'value') else str(current_user.role)

    if role_str != "admin" and challenge.organization_id != user_org_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to delete this challenge"
        )

    db.delete(challenge)
    db.commit()
    return None
