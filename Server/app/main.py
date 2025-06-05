# Server/app/main.py - VERSION AVEC MIDDLEWARE DE SÉCURITÉ
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
import time
import logging

from app.api.endpoints import covid, manage, analytics, metadata, auth
from app.api import predict


# Configuration des logs
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="COVID-19 Analytics API",
    description="Secure COVID-19 data analytics with admin authentication",
    version="1.0.0"
)

# Middleware de sécurité - Hosts autorisés
app.add_middleware(
    TrustedHostMiddleware, 
    allowed_hosts=["localhost", "0.0.0.0", "*.votre-domaine.com", "*.onrender.com"]
)

# CORS sécurisé
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Development
        "http://frontend:3000",  
        "http://localhost:3000",  # Alternative dev port
        "https://frontend-qvkb.onrender.com"  # Production
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Middleware de logging des requêtes sécurisé
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    
    # Ne pas logger les mots de passe
    log_body = True
    if "/auth/login" in str(request.url):
        log_body = False
    
    # Log de la requête (sans données sensibles)
    client_ip = request.client.host if request.client else "unknown"
    logger.info(f"📥 {request.method} {request.url.path} from {client_ip}")
    
    try:
        response = await call_next(request)
        
        process_time = time.time() - start_time
        
        # Log de la réponse
        if response.status_code >= 400:
            logger.warning(
                f"📤 {request.method} {request.url.path} - "
                f"Status: {response.status_code} - "
                f"Time: {process_time:.2f}s"
            )
        else:
            logger.info(
                f"📤 {request.method} {request.url.path} - "
                f"Status: {response.status_code} - "
                f"Time: {process_time:.2f}s"
            )
        
        return response
        
    except Exception as e:
        process_time = time.time() - start_time
        logger.error(
            f"💥 {request.method} {request.url.path} - "
            f"ERROR: {str(e)} - "
            f"Time: {process_time:.2f}s"
        )
        raise

# Headers de sécurité
@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    
    # Headers de sécurité standard
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    
    # HSTS en production uniquement
    if not request.url.hostname in ["localhost", "127.0.0.1"]:
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    
    return response

# Middleware de gestion globale des erreurs
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Gestionnaire global des erreurs HTTP"""
    
    # Log détaillé pour les erreurs serveur
    if exc.status_code >= 500:
        logger.error(f"🚨 Server Error {exc.status_code}: {exc.detail} on {request.method} {request.url}")
    elif exc.status_code == 401:
        logger.warning(f"🔒 Unauthorized access attempt on {request.method} {request.url}")
    elif exc.status_code == 403:
        logger.warning(f"🚫 Forbidden access attempt on {request.method} {request.url}")
    
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Gestionnaire global des erreurs non gérées"""
    logger.error(f"💥 Unhandled error on {request.method} {request.url}: {str(exc)}")
    
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )

# Routes - Authentification en premier (pas de restriction)
app.include_router(auth.router, prefix="/api/v1")
@app.get("/")
async def root():
    return {"status": "Backend is running"}

# Routes protégées (nécessitent une authentification)
app.include_router(covid.router, prefix="/api/v1")
app.include_router(manage.router, prefix="/api/v1")
app.include_router(predict.router, prefix="/api/v1")
app.include_router(metadata.router, prefix="/api/v1")
app.include_router(analytics.router, prefix="/api/v1")


