from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from db.database import get_db
from models.user import User, UserRole
from models.organization import Organization
from models.university import University
from schemas.user import RegisterRequest, LoginRequest, UserResponse, TokenResponse
from services.auth_service import get_password_hash, verify_password, create_access_token
from middleware.role_guard import get_current_user

router = APIRouter(prefix="/auth", tags=["Auth"])

def build_user_response(user: User) -> UserResponse:
    org_name = user.organization.name if user.organization else None
    university_name = user.university.name if user.university else None
    role_str = user.role.value if hasattr(user.role, 'value') else str(user.role)
    return UserResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=role_str,
        avatar_url=user.avatar_url,
        bio=user.bio,
        org_name=org_name,
        university_name=university_name,
        created_at=user.created_at
    )

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(request: RegisterRequest, response: Response, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == request.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is already registered"
        )

    hashed_pw = get_password_hash(request.password)
    new_user = User(
        email=request.email,
        password_hash=hashed_pw,
        full_name=request.full_name,
        role=request.role
    )
    db.add(new_user)
    db.flush()

    if request.role == UserRole.ORGANIZATION:
        org_title = request.org_name or request.full_name
        org = Organization(user_id=new_user.id, name=org_title)
        db.add(org)
    elif request.role == UserRole.UNIVERSITY:
        univ_title = request.university_name or request.full_name
        univ = University(user_id=new_user.id, name=univ_title)
        db.add(univ)

    db.commit()
    db.refresh(new_user)

    role_str = new_user.role.value if hasattr(new_user.role, 'value') else str(new_user.role)
    token = create_access_token({"sub": str(new_user.id), "role": role_str})

    # Set HttpOnly cookie for browser security
    response.set_cookie(
        key="auth_token",
        value=token,
        httponly=True,
        samesite="lax",
        max_age=86400
    )

    user_resp = build_user_response(new_user)
    return TokenResponse(access_token=token, user=user_resp)

@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest, response: Response, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()
    if not user or not verify_password(request.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    role_str = user.role.value if hasattr(user.role, 'value') else str(user.role)
    token = create_access_token({"sub": str(user.id), "role": role_str})

    response.set_cookie(
        key="auth_token",
        value=token,
        httponly=True,
        samesite="lax",
        max_age=86400
    )

    user_resp = build_user_response(user)
    return TokenResponse(access_token=token, user=user_resp)

@router.post("/logout")
def logout(response: Response):
    response.delete_cookie("auth_token")
    return {"message": "Successfully logged out"}

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return build_user_response(current_user)
