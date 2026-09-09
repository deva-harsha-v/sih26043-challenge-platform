import pytest

def test_register_success(client):
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

def test_register_duplicate_email_fails(client):
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

def test_login_success(client):
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

def test_login_wrong_password_fails(client):
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

def test_get_me_missing_token_fails(client):
    response = client.get("/auth/me")
    assert response.status_code == 401

def test_get_me_valid_token_success(client):
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
