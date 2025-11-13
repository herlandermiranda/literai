"""
Pytest configuration and fixtures for testing.
"""
import pytest
from typing import Generator
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, Session
from uuid import uuid4

from app.db.base_class import Base
from app.models import *  # Import all models


# Test database URL
TEST_DATABASE_URL = "postgresql://literai_user:literai_password@localhost:5432/literai_test_db"


@pytest.fixture(scope="session")
def engine():
    """Create test database engine."""
    engine = create_engine(TEST_DATABASE_URL)
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def db(engine) -> Generator[Session, None, None]:
    """Create a new database session for each test with transaction rollback."""
    connection = engine.connect()
    transaction = connection.begin()
    
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=connection)
    session = TestingSessionLocal()
    
    # Begin a nested transaction
    session.begin_nested()
    
    # Each time the session is committed, start a new nested transaction
    @event.listens_for(session, "after_transaction_end")
    def restart_savepoint(session, transaction):
        if transaction.nested and not transaction._parent.nested:
            session.begin_nested()
    
    try:
        yield session
    finally:
        session.close()
        transaction.rollback()
        connection.close()


@pytest.fixture
def test_user(db: Session):
    """Create a test user."""
    from app.models.user import User
    from app.core.security import get_password_hash
    
    user = User(
        id=uuid4(),
        email="test@example.com",
        password_hash=get_password_hash("testpassword123")
    )
    db.add(user)
    db.flush()
    db.refresh(user)
    return user


@pytest.fixture
def test_project(db: Session, test_user):
    """Create a test project."""
    from app.models.project import Project, ProjectStatus
    
    project = Project(
        id=uuid4(),
        user_id=test_user.id,
        title="Test Novel",
        description="A test novel for testing purposes",
        language="en",
        status=ProjectStatus.ACTIVE
    )
    db.add(project)
    db.flush()
    db.refresh(project)
    return project


@pytest.fixture
def test_document(db: Session, test_project):
    """Create a test document."""
    from app.models.document import Document, DocumentType
    
    document = Document(
        id=uuid4(),
        project_id=test_project.id,
        title="Chapter 1",
        type=DocumentType.DRAFT,
        content_raw="This is a test document content.",
        order_index=0
    )
    db.add(document)
    db.flush()
    db.refresh(document)
    return document


@pytest.fixture
def test_entity(db: Session, test_project):
    """Create a test entity."""
    from app.models.entity import Entity, EntityType
    
    entity = Entity(
        id=uuid4(),
        project_id=test_project.id,
        name="John Doe",
        slug="john-doe",
        type=EntityType.CHARACTER,
        summary="A test character"
    )
    db.add(entity)
    db.flush()
    db.refresh(entity)
    return entity


@pytest.fixture
def mock_llm_mode():
    """Ensure LLM is in mock mode for tests."""
    import os
    original_value = os.getenv("LLM_MOCK_MODE")
    os.environ["LLM_MOCK_MODE"] = "true"
    yield
    if original_value:
        os.environ["LLM_MOCK_MODE"] = original_value
    else:
        os.environ.pop("LLM_MOCK_MODE", None)


@pytest.fixture
def client(db: Session):
    """Fixture pour créer un client de test FastAPI avec la session de base de données de test"""
    from starlette.testclient import TestClient
    from app.main import app
    from app.core.deps import get_db  # Import from deps, not session!
    
    # Override the get_db dependency to use the test database session
    def override_get_db():
        try:
            yield db
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    
    with TestClient(app) as test_client:
        yield test_client
    
    # Clean up
    app.dependency_overrides.clear()


@pytest.fixture
def test_user_token(test_user):
    """Create a JWT token for the test user."""
    from app.core.security import create_access_token
    
    token = create_access_token(data={"sub": str(test_user.id)})
    return token
