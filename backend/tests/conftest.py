import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, delete
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app
from app.models.organization_invite_record import (
    OrganizationInviteRecord,
)
from app.models.organization_member_record import (
    OrganizationMemberRecord,
)
from app.models.organization_record import OrganizationRecord
from app.models.task_event_record import TaskEventRecord
from app.models.task_record import TaskRecord
from app.models.user_record import UserRecord


TEST_DATABASE_URL = "sqlite://"


test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)


TestingSessionLocal = sessionmaker(
    bind=test_engine,
    autoflush=False,
    autocommit=False,
)


Base.metadata.create_all(bind=test_engine)


def override_get_db():
    database = TestingSessionLocal()

    try:
        yield database
    finally:
        database.close()


app.dependency_overrides[get_db] = override_get_db


def clear_database() -> None:
    database = TestingSessionLocal()

    try:
        # Delete child records before their parent records —
        # organization_invites and organization_members both
        # reference organizations, and organizations references
        # users, so they all have to go before UserRecord.
        database.execute(delete(TaskEventRecord))
        database.execute(delete(TaskRecord))
        database.execute(delete(OrganizationInviteRecord))
        database.execute(delete(OrganizationMemberRecord))
        database.execute(delete(OrganizationRecord))
        database.execute(delete(UserRecord))
        database.commit()
    finally:
        database.close()


@pytest.fixture(autouse=True)
def clean_test_database():
    clear_database()
    yield
    clear_database()


@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def authenticated_client(client):
    email = "authenticated-user@example.com"
    password = "SecurePassword123!"

    register_response = client.post(
        "/auth/register",
        json={
            "email": email,
            "password": password,
            "full_name": "Authenticated Test User",
        },
    )

    assert register_response.status_code == 201

    login_response = client.post(
        "/auth/token",
        data={
            "username": email,
            "password": password,
        },
    )

    assert login_response.status_code == 200

    access_token = login_response.json()["access_token"]

    client.headers.update(
        {
            "Authorization": f"Bearer {access_token}",
        }
    )

    yield client


@pytest.fixture
def database():
    """
    Direct database session for tests that exercise a service
    layer function directly rather than through an HTTP
    endpoint — used for organization_service.py, which has no
    router wired to it yet (that's Phase 3).
    """

    session = TestingSessionLocal()

    try:
        yield session
    finally:
        session.close()