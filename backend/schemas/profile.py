from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict
from schemas.challenge import ChallengeListItem

class OrganizationProfileResponse(BaseModel):
    id: int
    user_id: int
    name: str
    description: Optional[str] = None
    website: Optional[str] = None
    logo_url: Optional[str] = None
    location: Optional[str] = None
    focus_area: Optional[str] = None
    created_at: datetime
    challenges: List[ChallengeListItem] = []

    model_config = ConfigDict(from_attributes=True)

class UniversityProfileResponse(BaseModel):
    id: int
    user_id: int
    name: str
    description: Optional[str] = None
    location: Optional[str] = None
    domain: Optional[str] = None
    logo_url: Optional[str] = None
    focus_area: Optional[str] = None
    created_at: datetime
    challenges: List[ChallengeListItem] = []

    model_config = ConfigDict(from_attributes=True)

class OrganizationProfileUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    website: Optional[str] = None
    logo_url: Optional[str] = None
    location: Optional[str] = None
    focus_area: Optional[str] = None

class UniversityProfileUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    domain: Optional[str] = None
    logo_url: Optional[str] = None
    focus_area: Optional[str] = None
