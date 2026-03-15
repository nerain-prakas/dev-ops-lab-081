import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Base configuration class."""
    _db_url = os.getenv(
        "DATABASE_URL",
        "postgresql://postgres:password@localhost:5432/course_reservation_db"
    )

    # Supabase requires SSL — append if not already present
    if "supabase" in _db_url and "sslmode" not in _db_url:
        _db_url += "?sslmode=require"

    SQLALCHEMY_DATABASE_URI = _db_url
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_pre_ping": True,       # Auto-reconnect on dropped connections
        "pool_recycle": 300,         # Recycle connections every 5 mins (good for serverless)
    }
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "change-this-secret-key")
    JWT_ACCESS_TOKEN_EXPIRES = False
    DEBUG = os.getenv("FLASK_DEBUG", "True") == "True"