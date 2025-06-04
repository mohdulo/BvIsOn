from __future__ import annotations

from datetime import datetime
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.security import verify_token
from app.db.database import get_db
from app.db.models.user import User, UserRole

security = HTTPBearer()

# Type aliases for dependency clarity
DB: Annotated[Session, Depends(get_db)] = Depends(get_db)
Creds: Annotated[
    HTTPAuthorizationCredentials, Depends(security)
] = Depends(security)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Creds,
    db: Session = DB,
) -> User:
    """Return the currently authenticated user or raise 401/403."""

    payload = verify_token(credentials.credentials)
    username: str | None = payload.get("sub")

    user: User | None = db.query(User).filter(User.username == username).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Inactive user",
        )

    # Update last login timestamp
    user.last_login = datetime.utcnow()
    db.commit()

    return user


def get_admin_user(current_user: User = Depends(get_current_user)) -> User:  # noqa: B008
    """Ensure the requester has admin privileges."""

    if current_user.role != UserRole.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return current_user


# Read‑friendly alias for route dependencies
AdminRequired = Depends(get_admin_user)
