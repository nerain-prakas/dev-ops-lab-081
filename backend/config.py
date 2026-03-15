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
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "change-this-secret-key")
    JWT_ACCESS_TOKEN_EXPIRES = False  # Tokens don't expire (adjust for production)
    DEBUG = os.getenv("FLASK_DEBUG", "True") == "True"
