"""
Application configuration management.
Loads settings from environment variables.
"""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Database
    DATABASE_URL: str = "postgresql://literai_user:literai_password@localhost:5432/literai_db"
    
    # JWT
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # OpenAI
    OPENAI_API_KEY: str
    
    # Application
    DEBUG: bool = False
    LLM_MOCK_MODE: bool = True
    
    # API
    API_V1_PREFIX: str = "/api/v1"
    PROJECT_NAME: str = "LiterAI - Literary Writing Assistant"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Force PostgreSQL URL (ignore system DATABASE_URL from webdev)
import os
if 'DATABASE_URL' in os.environ and 'mysql' in os.environ['DATABASE_URL']:
    os.environ['DATABASE_URL'] = "postgresql://literai_user:literai_password@localhost:5432/literai_db"

settings = Settings()
