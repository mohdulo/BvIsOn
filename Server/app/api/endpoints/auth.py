"""Authentication endpoints – Black & Flake8‑compliant (≤88 chars)."""

from __future__ import annotations

import logging
from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.core.security import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    create_access_token,
    verify_password,
)
from app.db.database import get_db
from app.db.models.user import User
from app.schemas.auth import LoginRequest, LoginResponse, UserResponse

router = APIRouter(prefix="/auth", tags=["authentication"])
logger = logging.getLogger(__name__)


@router.post("/login", response_model=LoginResponse)
def login(  # noqa: D401 – simple view
    login_data: LoginRequest, db: Session = Depends(get_db)
) -> LoginResponse:
    """Authenticate an admin user and return a JWT."""

    user: User | None = (
        db.query(User).filter(User.username == login_data.username).first()
    )

    if not user or not verify_password(login_data.password, user.hashed_password):
        logger.warning("Failed login attempt: %s", login_data.username)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account is disabled",
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    token = create_access_token(
        data={"sub": user.username},
        expires_delta=access_token_expires,
    )

    logger.info("Successful login: %s", user.username)

    return LoginResponse(
        access_token=token,
        token_type="bearer",
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=UserResponse.from_orm(user),
    )


@router.post("/logout")
def logout(  # type: ignore[name-defined]
    current_user: User = Depends(get_current_user),
) -> dict[str, str]:
    """Invalidate the current session (placeholder)."""

    logger.info("User logged out: %s", current_user.username)
    return {"message": "Successfully logged out"}
