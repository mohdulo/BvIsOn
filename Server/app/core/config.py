from __future__ import annotations

import os

from dotenv import load_dotenv

load_dotenv()


class Settings:
    """Centralised runtime settings."""

    API_V1_STR: str = "/api/v1"

    # Database connection parameters
    DB_HOST: str = os.getenv("DB_HOST", "localhost")
    DB_PORT: str = os.getenv("DB_PORT", "3306")
    DB_USER: str = os.getenv("DB_USER", "root")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD", "root")
    DB_NAME: str = os.getenv("DB_NAME", "Data")

    DATABASE_URL: str = (
        f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    )


settings = Settings()
