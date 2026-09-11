from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from db.database import get_db
from models.user import User, UserRole
from models.organization import Organization
from models.university import University
from models.challenge import Challenge
from schemas.profile import (
    OrganizationProfileResponse, UniversityProfileResponse,
    OrganizationProfileUpdate, UniversityProfileUpdate
)
from schemas.challenge import ChallengeListItem
from middleware.role_guard import get_current_user

router = APIRouter(prefix="/profiles", tags=["Profiles"])

def format_challenge_list_item(c: Challenge) -> ChallengeListItem:
    skills = [s.name for s in c.skills] if hasattr(c, 'skills') and c.skills else []
    status_str = c.status.value if hasattr(c.status, 'value') else str(c.status)
    return ChallengeListItem(
        id=c.id,
        organization_id=c.organization_id,
        organization_name=c.organization.name if c.organization else "",
        title=c.title,
        description=c.description,
        category=c.category,
        difficulty=c.difficulty,
        reward=c.reward,
        max_team_size=c.max_team_size,
        status=status_str,
        deadline=c.deadline,
        skills=skills,
        created_at=c.created_at
    )

@router.get("/organizations/{id}", response_model=OrganizationProfileResponse)
def get_organization_profile(id: int, db: Session = Depends(get_db)):
    org = db.query(Organization).filter(Organization.id == id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization profile not found")

    challenges = db.query(Challenge).filter(Challenge.organization_id == org.id).all()
    challenge_items = [format_challenge_list_item(c) for c in challenges]

    return OrganizationProfileResponse(
        id=org.id,
        user_id=org.user_id,
        name=org.name,
        description=org.description,
        website=org.website,
        logo_url=org.logo_url,
        location=org.location,
        focus_area=org.focus_area,
        created_at=org.created_at,
        challenges=challenge_items
    )

@router.get("/universities/{id}", response_model=UniversityProfileResponse)
def get_university_profile(id: int, db: Session = Depends(get_db)):
    uni = db.query(University).filter(University.id == id).first()
    if not uni:
        raise HTTPException(status_code=404, detail="University profile not found")

    # In case university published challenges via their organization link or user_id
    challenges = db.query(Challenge).filter(Challenge.organization_id == uni.id).all()
    challenge_items = [format_challenge_list_item(c) for c in challenges]

    return UniversityProfileResponse(
        id=uni.id,
        user_id=uni.user_id,
        name=uni.name,
        description=uni.description,
        location=uni.location,
        domain=uni.domain,
        logo_url=uni.logo_url,
        focus_area=uni.focus_area,
        created_at=uni.created_at,
        challenges=challenge_items
    )

@router.patch("/organizations/{id}", response_model=OrganizationProfileResponse)
def update_organization_profile(
    id: int,
    payload: OrganizationProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    org = db.query(Organization).filter(Organization.id == id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization profile not found")

    is_owner = (current_user.id == org.user_id) or (current_user.role == UserRole.ADMIN)
    if not is_owner:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to update this organization profile"
        )

    if payload.name is not None:
        org.name = payload.name
    if payload.description is not None:
        org.description = payload.description
    if payload.website is not None:
        org.website = payload.website
    if payload.logo_url is not None:
        org.logo_url = payload.logo_url
    if payload.location is not None:
        org.location = payload.location
    if payload.focus_area is not None:
        org.focus_area = payload.focus_area

    db.commit()
    db.refresh(org)

    challenges = db.query(Challenge).filter(Challenge.organization_id == org.id).all()
    challenge_items = [format_challenge_list_item(c) for c in challenges]

    return OrganizationProfileResponse(
        id=org.id,
        user_id=org.user_id,
        name=org.name,
        description=org.description,
        website=org.website,
        logo_url=org.logo_url,
        location=org.location,
        focus_area=org.focus_area,
        created_at=org.created_at,
        challenges=challenge_items
    )

@router.patch("/universities/{id}", response_model=UniversityProfileResponse)
def update_university_profile(
    id: int,
    payload: UniversityProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    uni = db.query(University).filter(University.id == id).first()
    if not uni:
        raise HTTPException(status_code=404, detail="University profile not found")

    is_owner = (current_user.id == uni.user_id) or (current_user.role == UserRole.ADMIN)
    if not is_owner:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to update this university profile"
        )

    if payload.name is not None:
        uni.name = payload.name
    if payload.description is not None:
        uni.description = payload.description
    if payload.location is not None:
        uni.location = payload.location
    if payload.domain is not None:
        uni.domain = payload.domain
    if payload.logo_url is not None:
        uni.logo_url = payload.logo_url
    if payload.focus_area is not None:
        uni.focus_area = payload.focus_area

    db.commit()
    db.refresh(uni)

    challenges = db.query(Challenge).filter(Challenge.organization_id == uni.id).all()
    challenge_items = [format_challenge_list_item(c) for c in challenges]

    return UniversityProfileResponse(
        id=uni.id,
        user_id=uni.user_id,
        name=uni.name,
        description=uni.description,
        location=uni.location,
        domain=uni.domain,
        logo_url=uni.logo_url,
        focus_area=uni.focus_area,
        created_at=uni.created_at,
        challenges=challenge_items
    )
