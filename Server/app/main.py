from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.endpoints import covid
from app.core.config import settings
from app.db.database import Base, engine

# Créer les tables dans la base de données si elles n'existent pas déjà
# Base.metadata.create_all(bind=engine)

app = FastAPI(title="COVID-19 Tracker API")

# Configurer CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Votre URL frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclure les routes
app.include_router(covid.router, prefix=f"{settings.API_V1_STR}/covid", tags=["covid"])

@app.get("/")
def read_root():
    return {"message": "Bienvenue sur l'API COVID-19 Tracker"}

@app.get("/health-check")
def health_check():
    return {"status": "healthy"}