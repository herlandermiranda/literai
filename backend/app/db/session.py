"""
Database session management.
Creates and manages SQLAlchemy engine and session.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Create database engine with production-ready timeouts
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,      # Enable connection health checks before using
    pool_recycle=3600,       # Recycle connections after 1 hour (prevents stale connections)
    pool_timeout=30,         # Timeout after 30 seconds when getting connection from pool
    pool_size=10,            # Maximum number of permanent connections
    max_overflow=20,         # Maximum number of temporary connections beyond pool_size
    echo=settings.DEBUG,     # Log SQL queries in debug mode
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    """
    Dependency function to get database session.
    Yields a database session and ensures it's closed after use.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
