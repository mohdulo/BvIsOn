from __future__ import annotations

import logging
import time
from typing import List

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse

from app.api import predict
from app.api.endpoints import (
    analytics,
    auth,
    covid,
    manage,
    metadata,
)

# ---------------------------------------------------------------------------
# Logging configuration
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Application factory
# ---------------------------------------------------------------------------
app = FastAPI(
    title="COVID-19 Analytics API",
    description="Secure COVID-19 data analytics with admin authentication",
    version="1.0.0",
)

# ---------------------------------------------------------------------------
# Security middlewares
# ---------------------------------------------------------------------------
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["localhost", "127.0.0.1", "*.votre-domaine.com"],
)

ALLOWED_ORIGINS: List[str] = [
    "http://localhost:5173",  # Development
    "http://localhost:3000",  # Alternative dev port
    "https://votre-domaine.com",  # Production
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)


# ---------------------------------------------------------------------------
# Request‑logging middleware
# ---------------------------------------------------------------------------
@app.middleware("http")
async def log_requests(request: Request, call_next):  # type: ignore[override]
    """Log every request/response pair with latency."""

    start_time = time.time()

    # Avoid logging sensitive payloads
    hide_body = "/auth/login" in str(request.url)
    client_ip = request.client.host if request.client else "unknown"
    logger.info("📥 %s %s from %s", request.method, request.url.path, client_ip)

    try:
        response = await call_next(request)
    except Exception as exc:  # pylint: disable=broad-except
        process_time = time.time() - start_time
        logger.error(
            "💥 %s %s - ERROR: %s - Time: %.2fs",
            request.method,
            request.url.path,
            exc,
            process_time,
        )
        raise

    process_time = time.time() - start_time
    log_level = logger.warning if response.status_code >= 400 else logger.info
    log_level(
        "📤 %s %s - Status: %s - Time: %.2fs",
        request.method,
        request.url.path,
        response.status_code,
        process_time,
    )

    return response


# ---------------------------------------------------------------------------
# Security headers middleware
# ---------------------------------------------------------------------------
@app.middleware("http")
async def security_headers(request: Request, call_next):  # type: ignore[override]
    response = await call_next(request)

    # Standard headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"

    # HSTS only outside local development
    if request.url.hostname not in {"localhost", "127.0.0.1"}:
        response.headers[
            "Strict-Transport-Security"
        ] = "max-age=31536000; includeSubDomains"

    return response


# ---------------------------------------------------------------------------
# Global error handlers
# ---------------------------------------------------------------------------
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):  # noqa: D401
    """Return JSON for HTTPException and log appropriately."""

    if exc.status_code >= 500:
        logger.error(
            "🚨 Server Error %s: %s on %s %s",
            exc.status_code,
            exc.detail,
            request.method,
            request.url,
        )
    elif exc.status_code == 401:
        logger.warning("🔒 Unauthorized access on %s %s", request.method, request.url)
    elif exc.status_code == 403:
        logger.warning("🚫 Forbidden access on %s %s", request.method, request.url)

    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):  # noqa: D401
    """Catch‑all handler for uncaught exceptions."""

    logger.error("💥 Unhandled error on %s %s: %s", request.method, request.url, exc)
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})


# ---------------------------------------------------------------------------
# Route registration
# ---------------------------------------------------------------------------
app.include_router(auth.router, prefix="/api/v1")  # public auth endpoints

# Secured endpoints (token required)
app.include_router(covid.router, prefix="/api/v1")
app.include_router(manage.router, prefix="/api/v1")
app.include_router(predict.router, prefix="/api/v1")
app.include_router(metadata.router, prefix="/api/v1")
app.include_router(analytics.router, prefix="/api/v1")
