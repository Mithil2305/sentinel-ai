import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import (
    verify_password, get_password_hash, create_access_token, create_refresh_token, decode_token,
    get_current_user, require_role
)
from app.core.redis_client import redis_client
from app.models.user import User
from app.schemas.auth import LoginRequest, LoginResponse, RefreshTokenRequest, UserCreate, UserResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials or password mismatch."
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is suspended or locked."
        )

    access_token = create_access_token({"sub": user.id, "email": user.email, "role": user.role})
    refresh_token = create_refresh_token({"sub": user.id})

    return LoginResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="Bearer",
        expires_in=900
    )

@router.post("/refresh-token", response_model=dict)
def refresh_token(payload: RefreshTokenRequest, db: Session = Depends(get_db)):
    if redis_client.is_blacklisted(payload.refresh_token):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token has been revoked."
        )

    decoded = decode_token(payload.refresh_token)
    if not decoded or decoded.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token is invalid, blacklisted, or expired."
        )
    user_id = decoded.get("sub")
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User unavailable.")

    new_access_token = create_access_token({"sub": user.id, "email": user.email, "role": user.role})
    return {
        "access_token": new_access_token,
        "token_type": "Bearer",
        "expires_in": 900
    }

@router.post("/logout", response_model=dict)
def logout(
    payload: RefreshTokenRequest,
    authorization: str = Header(None),
    current_user: User = Depends(get_current_user)
):
    # Blacklist the refresh token
    redis_client.blacklist_token(payload.refresh_token, expire_seconds=604800)

    # Blacklist access token if provided in header
    if authorization and authorization.startswith("Bearer "):
        access_token = authorization.split(" ")[1]
        redis_client.blacklist_token(access_token, expire_seconds=900)

    return {"status": "revoked", "message": "Tokens successfully invalidated"}

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(
    payload: UserCreate,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_role("admin"))
):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists."
        )

    user_id = f"usr_{uuid.uuid4().hex[:12]}"
    user = User(
        id=user_id,
        email=payload.email,
        password_hash=get_password_hash(payload.password),
        full_name=payload.full_name,
        role=payload.role or "analyst",
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
