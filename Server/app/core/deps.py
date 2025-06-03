from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.core.security import verify_token
from app.db.database import get_db
from app.db.models.user import User, UserRole
from datetime import datetime

security = HTTPBearer()

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """Obtenir l'utilisateur actuel à partir du token"""
    token = credentials.credentials
    payload = verify_token(token)
    
    username = payload.get("sub")
    user = db.query(User).filter(User.username == username).first()
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Inactive user"
        )
    
    # Mettre à jour le dernier login
    user.last_login = datetime.utcnow()
    db.commit()
    
    return user

def get_admin_user(current_user: User = Depends(get_current_user)) -> User:
    """Vérifier que l'utilisateur est admin"""
    if current_user.role != UserRole.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user

# Alias pour faciliter l'utilisation
AdminRequired = Depends(get_admin_user)
