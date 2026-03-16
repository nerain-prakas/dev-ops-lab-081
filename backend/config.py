import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Base configuration class."""
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL",
        "postgresql://postgres:password@localhost:5432/course_reservation_db"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_pre_ping": True,
    }
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "change-this-secret-key")
    DEBUG = os.getenv("FLASK_DEBUG", "True") == "True"
    AUTO_CREATE_TABLES = os.getenv("AUTO_CREATE_TABLES", "False") == "True"
