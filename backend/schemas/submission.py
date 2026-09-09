from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from models.submission import SubmissionStatus
from schemas.team import TeamMemberResponse

class SubmissionCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: str = Field(..., min_length=1)
    document_url: Optional[str] = None
    team_id: int
    challenge_id: int

class SubmissionStatusUpdate(BaseModel):
    status: SubmissionStatus
    reviewer_notes: Optional[str] = None

class SubmissionResponse(BaseModel):
    id: int
    challenge_id: int
    challenge_title: Optional[str] = None
    team_id: int
    team_name: Optional[str] = None
    team_members: List[TeamMemberResponse] = []
    title: str
    description: str
    document_url: Optional[str] = None
    status: SubmissionStatus
    reviewer_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    reviewed_at: Optional[datetime] = None

    class Config:
        from_attributes = True
