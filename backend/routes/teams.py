from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from db.database import get_db
from models.user import User
from models.challenge import Challenge
from models.team import Team, TeamMember
from schemas.team import TeamCreate, TeamResponse, TeamMemberResponse
from middleware.role_guard import get_current_user, require_role

router = APIRouter(prefix="/teams", tags=["Teams"])

def check_user_on_challenge_team(user_id: int, challenge_id: int, db: Session) -> bool:
    existing = db.query(TeamMember).join(Team).filter(
        TeamMember.user_id == user_id,
        Team.challenge_id == challenge_id
    ).first()
    return existing is not None

def build_team_response(team: Team, db: Session) -> TeamResponse:
    challenge_title = team.challenge.title if team.challenge else "General Challenge"
    leader_name = team.leader.full_name if team.leader else "Unknown Leader"

    member_responses = []
    for tm in team.members:
        member_responses.append(TeamMemberResponse(
            user_id=tm.user_id,
            full_name=tm.user.full_name if tm.user else "Unknown User",
            email=tm.user.email if tm.user else "",
            role_in_team=tm.role_in_team,
            joined_at=tm.joined_at
        ))

    return TeamResponse(
        id=team.id,
        name=team.name,
        description=team.description,
        challenge_id=team.challenge_id,
        challenge_title=challenge_title,
        leader_id=team.leader_id,
        leader_name=leader_name,
        members=member_responses,
        created_at=team.created_at
    )

@router.post("", response_model=TeamResponse, status_code=status.HTTP_201_CREATED)
def create_team(
    request: TeamCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["contributor"]))
):
    challenge = db.query(Challenge).filter(Challenge.id == request.challenge_id).first()
    if not challenge:
        raise HTTPException(
            status_code=status.HTTP_44_NOT_FOUND if hasattr(status, 'HTTP_44_NOT_FOUND') else status.HTTP_404_NOT_FOUND,
            detail="Challenge not found"
        )

    if check_user_on_challenge_team(current_user.id, request.challenge_id, db):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You are already a member of a team for this challenge"
        )

    new_team = Team(
        leader_id=current_user.id,
        challenge_id=request.challenge_id,
        name=request.name,
        description=request.description
    )
    db.add(new_team)
    db.flush()

    leader_member = TeamMember(
        team_id=new_team.id,
        user_id=current_user.id,
        role_in_team="Leader"
    )
    db.add(leader_member)

    db.commit()
    db.refresh(new_team)
    return build_team_response(new_team, db)

@router.get("", response_model=List[TeamResponse])
def list_teams(
    challenge_id: Optional[int] = Query(None, description="Filter teams by challenge ID"),
    db: Session = Depends(get_db)
):
    query = db.query(Team)
    if challenge_id:
        query = query.filter(Team.challenge_id == challenge_id)
    teams = query.order_by(Team.created_at.desc()).all()
    return [build_team_response(t, db) for t in teams]

@router.get("/{team_id}", response_model=TeamResponse)
def get_team(team_id: int, db: Session = Depends(get_db)):
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )
    return build_team_response(team, db)

@router.post("/{team_id}/join", response_model=TeamResponse)
def join_team(
    team_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["contributor"]))
):
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )

    if check_user_on_challenge_team(current_user.id, team.challenge_id, db):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You are already a member of a team for this challenge"
        )

    new_member = TeamMember(
        team_id=team.id,
        user_id=current_user.id,
        role_in_team="Member"
    )
    db.add(new_member)
    db.commit()
    db.refresh(team)
    return build_team_response(team, db)

@router.delete("/{team_id}/leave")
def leave_team(
    team_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )

    user_member = db.query(TeamMember).filter(
        TeamMember.team_id == team_id,
        TeamMember.user_id == current_user.id
    ).first()

    if not user_member:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You are not a member of this team"
        )

    db.delete(user_member)
    db.flush()

    # If leaving member was the leader
    if team.leader_id == current_user.id:
        remaining_members = db.query(TeamMember).filter(
            TeamMember.team_id == team_id
        ).order_by(TeamMember.joined_at.asc()).all()

        if remaining_members:
            # Promote earliest joined member to Leader atomically
            next_leader = remaining_members[0]
            next_leader.role_in_team = "Leader"
            team.leader_id = next_leader.user_id
            db.flush()
        else:
            # No members left, delete team
            db.delete(team)

    db.commit()
    return {"message": "Successfully left team"}

@router.delete("/{team_id}/members/{user_id}", response_model=TeamResponse)
def remove_team_member(
    team_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )

    role_str = current_user.role.value if hasattr(current_user.role, 'value') else str(current_user.role)
    if role_str != "admin" and team.leader_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the team leader can remove members"
        )

    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Leader cannot kick themselves. Use /leave to leave team."
        )

    target_member = db.query(TeamMember).filter(
        TeamMember.team_id == team_id,
        TeamMember.user_id == user_id
    ).first()

    if not target_member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member not found in team"
        )

    db.delete(target_member)
    db.commit()
    db.refresh(team)
    return build_team_response(team, db)
