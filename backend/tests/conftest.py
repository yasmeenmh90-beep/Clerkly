import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, delete
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app
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
        # Delete child records before their parent records.
        database.execute(delete(TaskEventRecord))
        database.execute(delete(TaskRecord))
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