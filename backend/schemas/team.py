from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict

class TeamCreate(BaseModel):
    name: str
    challenge_id: int  # Required: every team must be linked to a challenge
    description: Optional[str] = None

class TeamMemberResponse(BaseModel):
    user_id: int
    full_name: str
    email: str
    role_in_team: str
    joined_at: datetime

    model_config = ConfigDict(from_attributes=True)

class TeamResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    challenge_id: int
    challenge_title: str
    leader_id: int
    leader_name: str
    members: List[TeamMemberResponse]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
