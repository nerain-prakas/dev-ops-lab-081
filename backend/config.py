import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Base configuration class."""
    _db_url = os.getenv(
        "DATABASE_URL",
        "postgresql://postgres:password@localhost:5432/course_reservation_db"
    )

    # Supabase Postgres commonly requires SSL from hosted environments.
    if _db_url.startswith("postgresql://") and "sslmode=" not in _db_url:
        _db_url = f"{_db_url}{'&' if '?' in _db_url else '?'}sslmode=require"

    SQLALCHEMY_DATABASE_URI = _db_url
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "change-this-secret-key")
    # Tokens expire after 24 hours for security
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    DEBUG = os.getenv("FLASK_DEBUG", "True") == "True"
