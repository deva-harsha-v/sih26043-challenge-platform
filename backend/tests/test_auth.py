import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from db.database import Base, get_db
from models.user import User, UserRole
from models.organization import Organization
from models.university import University
from main import app

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

client = TestClient(app)

def test_register_success():
    payload = {
        "email": "testorg@example.com",
        "password": "securepassword123",
        "full_name": "Test Org Admin",
        "role": "organization",
        "org_name": "Acme Corp"
    }
    response = client.post("/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "testorg@example.com"
    assert data["user"]["role"] == "organization"
    assert data["user"]["org_name"] == "Acme Corp"

def test_register_duplicate_email_fails():
    payload = {
        "email": "duplicate@example.com",
        "password": "password123",
        "full_name": "First User",
        "role": "contributor"
    }
    first_res = client.post("/auth/register", json=payload)
    assert first_res.status_code == 201

    second_res = client.post("/auth/register", json=payload)
    assert second_res.status_code == 400
    assert "already registered" in second_res.json()["detail"]

def test_login_success():
    register_payload = {
        "email": "loginuser@example.com",
        "password": "mypassword",
        "full_name": "Login User",
        "role": "contributor"
    }
    client.post("/auth/register", json=register_payload)

    login_payload = {
        "email": "loginuser@example.com",
        "password": "mypassword"
    }
    response = client.post("/auth/login", json=login_payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "loginuser@example.com"

def test_login_wrong_password_fails():
    register_payload = {
        "email": "user2@example.com",
        "password": "correctpassword",
        "full_name": "User Two",
        "role": "contributor"
    }
    client.post("/auth/register", json=register_payload)

    login_payload = {
        "email": "user2@example.com",
        "password": "wrongpassword"
    }
    response = client.post("/auth/login", json=login_payload)
    assert response.status_code == 401
    assert "Invalid email or password" in response.json()["detail"]

def test_get_me_missing_token_fails():
    response = client.get("/auth/me")
    assert response.status_code == 401

def test_get_me_valid_token_success():
    register_payload = {
        "email": "meuser@example.com",
        "password": "password123",
        "full_name": "Me User",
        "role": "university",
        "university_name": "Tech Institute"
    }
    reg_res = client.post("/auth/register", json=register_payload)
    token = reg_res.json()["access_token"]

    headers = {"Authorization": f"Bearer {token}"}
    me_res = client.get("/auth/me", headers=headers)
    assert me_res.status_code == 200
    data = me_res.json()
    assert data["email"] == "meuser@example.com"
    assert data["role"] == "university"
    assert data["university_name"] == "Tech Institute"
