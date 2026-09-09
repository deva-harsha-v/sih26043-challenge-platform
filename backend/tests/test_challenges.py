import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from db.database import Base, get_db
from models.user import User, UserRole
from models.organization import Organization
from models.university import University
from models.challenge import Challenge, ChallengeStatus
from models.skill import Skill
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

def create_user_and_token(email: str, role: str, org_name: str = None) -> tuple[str, dict]:
    payload = {
        "email": email,
        "password": "Password123!",
        "full_name": f"Name for {email}",
        "role": role,
        "org_name": org_name
    }
    res = client.post("/auth/register", json=payload)
    data = res.json()
    return data["access_token"], data["user"]

def test_create_challenge_as_organization_success():
    token, _ = create_user_and_token("org1@example.com", "organization", "Tech Solutions")
    headers = {"Authorization": f"Bearer {token}"}
    payload = {
        "title": "AI Agriculture Scanner",
        "description": "Scan crops for disease using vision AI",
        "problem_statement": "Farmers suffer heavy losses from undetected crop blight.",
        "category": "Artificial Intelligence",
        "reward": "$10,000",
        "difficulty": "Hard",
        "max_team_size": 4,
        "skills": ["Python", "TensorFlow", "Computer Vision"]
    }
    res = client.post("/challenges", json=payload, headers=headers)
    assert res.status_code == 201
    data = res.json()
    assert data["title"] == "AI Agriculture Scanner"
    assert data["organization_name"] == "Tech Solutions"
    assert data["status"] == "open"
    assert "Python" in data["skills"]

def test_create_challenge_as_contributor_fails_403():
    token, _ = create_user_and_token("student@example.com", "contributor")
    headers = {"Authorization": f"Bearer {token}"}
    payload = {
        "title": "Unauthorized Challenge",
        "description": "Should not be allowed",
        "problem_statement": "N/A",
        "category": "General"
    }
    res = client.post("/challenges", json=payload, headers=headers)
    assert res.status_code == 403

def test_list_challenges_returns_created_items():
    token, _ = create_user_and_token("org_list@example.com", "organization", "Acme Inc")
    headers = {"Authorization": f"Bearer {token}"}
    payload = {
        "title": "Smart Logistics Optimization",
        "description": "Optimize last mile delivery",
        "problem_statement": "High fuel waste in routing.",
        "category": "Logistics",
        "skills": ["Algorithms", "Python"]
    }
    client.post("/challenges", json=payload, headers=headers)

    res = client.get("/challenges")
    assert res.status_code == 200
    items = res.json()
    assert len(items) >= 1
    assert any(c["title"] == "Smart Logistics Optimization" for c in items)

def test_filter_challenges_by_skill_isolates_matching_item():
    token, _ = create_user_and_token("org_filter1@example.com", "organization", "Filter Org")
    headers = {"Authorization": f"Bearer {token}"}
    
    # Challenge A with Python skill
    client.post("/challenges", json={
        "title": "Python Data Pipeline",
        "description": "Build high throughput ETL",
        "problem_statement": "ETL bottleneck",
        "category": "Data Engineering",
        "skills": ["Python", "Spark"]
    }, headers=headers)

    # Challenge B with Rust skill
    client.post("/challenges", json={
        "title": "Rust Embedded Kernel",
        "description": "Develop RTOS kernel",
        "problem_statement": "Safety critical kernel",
        "category": "Systems",
        "skills": ["Rust", "Embedded"]
    }, headers=headers)

    # Filter by Rust
    res_rust = client.get("/challenges?skill=Rust")
    assert res_rust.status_code == 200
    rust_items = res_rust.json()
    assert len(rust_items) == 1
    assert rust_items[0]["title"] == "Rust Embedded Kernel"

    # Filter by Python
    res_py = client.get("/challenges?skill=Python")
    assert res_py.status_code == 200
    py_items = res_py.json()
    assert len(py_items) == 1
    assert py_items[0]["title"] == "Python Data Pipeline"

def test_filter_challenges_by_status_isolates_matching_item():
    token, _ = create_user_and_token("org_filter2@example.com", "organization", "Status Org")
    headers = {"Authorization": f"Bearer {token}"}
    
    # Create challenge
    res = client.post("/challenges", json={
        "title": "Open Challenge",
        "description": "Currently open",
        "problem_statement": "Problem 1",
        "category": "AI"
    }, headers=headers)
    c_id = res.json()["id"]

    # Update status to active
    client.patch(f"/challenges/{c_id}", json={"status": "active"}, headers=headers)

    # Create another open challenge
    client.post("/challenges", json={
        "title": "Another Open Challenge",
        "description": "Still open",
        "problem_statement": "Problem 2",
        "category": "AI"
    }, headers=headers)

    # Filter by active
    res_active = client.get("/challenges?status=active")
    assert res_active.status_code == 200
    active_items = res_active.json()
    assert len(active_items) == 1
    assert active_items[0]["title"] == "Open Challenge"

def test_get_challenge_by_id_returns_details():
    token, _ = create_user_and_token("org_detail@example.com", "organization", "Detail Org")
    headers = {"Authorization": f"Bearer {token}"}
    res_create = client.post("/challenges", json={
        "title": "Detail View Challenge",
        "description": "Short description",
        "problem_statement": "In-depth problem statement text",
        "category": "Healthcare",
        "skills": ["Bioinformatics"]
    }, headers=headers)
    c_id = res_create.json()["id"]

    res_get = client.get(f"/challenges/{c_id}")
    assert res_get.status_code == 200
    data = res_get.json()
    assert data["title"] == "Detail View Challenge"
    assert data["problem_statement"] == "In-depth problem statement text"
    assert "Bioinformatics" in data["skills"]

def test_update_challenge_by_non_owner_fails_403():
    token_owner, _ = create_user_and_token("owner@example.com", "organization", "Owner Org")
    token_other, _ = create_user_and_token("other_org@example.com", "organization", "Other Org")

    headers_owner = {"Authorization": f"Bearer {token_owner}"}
    headers_other = {"Authorization": f"Bearer {token_other}"}

    res_create = client.post("/challenges", json={
        "title": "Owner Challenge",
        "description": "Original",
        "problem_statement": "Original PS",
        "category": "General"
    }, headers=headers_owner)
    c_id = res_create.json()["id"]

    res_update = client.patch(f"/challenges/{c_id}", json={"title": "Hacked Title"}, headers=headers_other)
    assert res_update.status_code == 403

def test_update_challenge_by_owner_succeeds():
    token_owner, _ = create_user_and_token("owner2@example.com", "organization", "Owner Org 2")
    headers_owner = {"Authorization": f"Bearer {token_owner}"}

    res_create = client.post("/challenges", json={
        "title": "Initial Title",
        "description": "Original",
        "problem_statement": "Original PS",
        "category": "General"
    }, headers=headers_owner)
    c_id = res_create.json()["id"]

    res_update = client.patch(f"/challenges/{c_id}", json={"title": "Updated Title", "reward": "$5,000"}, headers=headers_owner)
    assert res_update.status_code == 200
    data = res_update.json()
    assert data["title"] == "Updated Title"
    assert data["reward"] == "$5,000"

def test_delete_challenge_by_non_owner_fails_403():
    token_owner, _ = create_user_and_token("del_owner@example.com", "organization", "Del Owner Org")
    token_other, _ = create_user_and_token("del_other@example.com", "contributor")

    headers_owner = {"Authorization": f"Bearer {token_owner}"}
    headers_other = {"Authorization": f"Bearer {token_other}"}

    res_create = client.post("/challenges", json={
        "title": "Protected Challenge",
        "description": "Do not delete",
        "problem_statement": "N/A",
        "category": "General"
    }, headers=headers_owner)
    c_id = res_create.json()["id"]

    res_del = client.delete(f"/challenges/{c_id}", headers=headers_other)
    assert res_del.status_code == 403
