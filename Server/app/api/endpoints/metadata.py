# Server/app/api/endpoints/metadata.py - VERSION COMPLÈTEMENT SÉCURISÉE
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer
from app.core.deps import get_current_user
from app.db.models.user import User
import pandas as pd
import os
import logging

# ✅ Sécurité HTTPBearer obligatoire
security = HTTPBearer()
router = APIRouter()
logger = logging.getLogger(__name__)

def validate_admin_user(current_user: User):
    """Validation stricte de l'utilisateur admin"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    if not current_user.is_active:
        raise HTTPException(status_code=403, detail="Account is disabled")

@router.get("/metadata", dependencies=[Depends(security)])
def get_metadata(current_user: User = Depends(get_current_user)):
    """Obtenir les métadonnées pour les prédictions - ADMIN SEULEMENT"""
    validate_admin_user(current_user)
    
    logger.info(f"Metadata requested by admin {current_user.username}")
    
    try:
        csv_path = os.path.join("app", "data", "data_cleaned_used.csv")
        
        if not os.path.exists(csv_path):
            logger.error(f"Data file not found: {csv_path}")
            raise HTTPException(status_code=500, detail="Data file not found")
        
        df = pd.read_csv(csv_path)

        # Nettoyage des données
        df = df.dropna(subset=["Country", "WHO Region"])
            
        regions = sorted(df["WHO Region"].unique().tolist())

        # Mapping région -> [pays...]
        region_country_map = {}
        for region in regions:
            countries = df[df["WHO Region"] == region]["Country"].unique().tolist()
            region_country_map[region] = sorted(countries)

        logger.info(f"Metadata delivered to admin {current_user.username}: {len(regions)} regions, {sum(len(countries) for countries in region_country_map.values())} countries")
        
        return {
            "who_regions": regions,
            "countries_by_region": region_country_map
        }
        
    except Exception as e:
        logger.error(f"Error loading metadata for admin {current_user.username}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to load metadata")