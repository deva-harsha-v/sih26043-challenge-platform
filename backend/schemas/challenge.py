from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict
from models.challenge import ChallengeStatus

class ChallengeCreate(BaseModel):
    title: str
    description: str
    problem_statement: str
    category: str
    reward: Optional[str] = None
    difficulty: Optional[str] = "Medium"
    max_team_size: Optional[int] = 4
    deadline: Optional[datetime] = None
    skills: List[str] = []

class ChallengeUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    problem_statement: Optional[str] = None
    category: Optional[str] = None
    reward: Optional[str] = None
    difficulty: Optional[str] = None
    max_team_size: Optional[int] = None
    status: Optional[ChallengeStatus] = None
    deadline: Optional[datetime] = None
    skills: Optional[List[str]] = None

class ChallengeListItem(BaseModel):
    id: int
    organization_id: int
    organization_name: str
    title: str
    description: str
    category: str
    difficulty: str
    reward: Optional[str] = None
    max_team_size: int
    status: str
    deadline: Optional[datetime] = None
    skills: List[str] = []
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ChallengeResponse(BaseModel):
    id: int
    organization_id: int
    organization_name: str
    organization_website: Optional[str] = None
    title: str
    description: str
    problem_statement: str
    category: str
    difficulty: str
    reward: Optional[str] = None
    max_team_size: int
    status: str
    deadline: Optional[datetime] = None
    skills: List[str] = []
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
