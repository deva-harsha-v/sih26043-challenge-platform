import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, Enum, ForeignKey, Table
from sqlalchemy.orm import relationship
from db.database import Base

class ChallengeStatus(str, enum.Enum):
    DRAFT = "draft"
    OPEN = "open"
    ACTIVE = "active"
    SUBMISSION = "submission"
    REVIEW = "review"
    COMPLETED = "completed"

challenge_skills = Table(
    "challenge_skills",
    Base.metadata,
    Column("id", Integer, primary_key=True),
    Column("challenge_id", Integer, ForeignKey("challenges.id", ondelete="CASCADE"), nullable=False),
    Column("skill_id", Integer, ForeignKey("skills.id", ondelete="CASCADE"), nullable=False)
)

class Challenge(Base):
    __tablename__ = "challenges"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    problem_statement = Column(Text, nullable=False)
    category = Column(String(100), nullable=False)
    reward = Column(String(255), nullable=True)
    difficulty = Column(String(50), default="Medium")
    max_team_size = Column(Integer, default=4)
    status = Column(
        Enum(ChallengeStatus, name="challenge_status", create_type=False, values_callable=lambda x: [e.value for e in x]),
        nullable=False,
        default=ChallengeStatus.OPEN,
        index=True
    )
    deadline = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    organization = relationship("Organization")
    skills = relationship("Skill", secondary=challenge_skills, back_populates="challenges")
