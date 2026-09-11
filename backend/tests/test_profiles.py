import pytest
from fastapi.testclient import TestClient

def register_user(client: TestClient, email: str, role: str, org_name: str = None, uni_name: str = None) -> tuple[str, int, dict]:
    payload = {
        "email": email,
        "password": "Password123!",
        "full_name": f"User {email}",
        "role": role,
        "org_name": org_name,
        "university_name": uni_name
    }
    res = client.post("/auth/register", json=payload)
    data = res.json()
    return data["access_token"], data["user"]["id"], data["user"]

def test_get_organization_profile_success(client):
    token, user_id, user_data = register_user(client, "org_prof1@test.com", "organization", org_name="Acme Research Labs")
    org_id = user_data["org_id"]

    # Create challenge under this org
    headers = {"Authorization": f"Bearer {token}"}
    client.post("/challenges", json={
        "title": "Quantum Sensor Challenge",
        "description": "Build high precision sensor",
        "problem_statement": "PS Text",
        "category": "Physics"
    }, headers=headers)

    # Public GET (no auth header required)
    res = client.get(f"/profiles/organizations/{org_id}")
    assert res.status_code == 200
    data = res.json()
    assert data["id"] == org_id
    assert data["name"] == "Acme Research Labs"
    assert len(data["challenges"]) == 1
    assert data["challenges"][0]["title"] == "Quantum Sensor Challenge"

def test_get_university_profile_success(client):
    token, user_id, user_data = register_user(client, "uni_prof1@test.com", "university", uni_name="National Tech Institute")
    uni_id = user_data["university_id"]

    res = client.get(f"/profiles/universities/{uni_id}")
    assert res.status_code == 200
    data = res.json()
    assert data["id"] == uni_id
    assert data["name"] == "National Tech Institute"
    assert isinstance(data["challenges"], list)

def test_update_own_organization_profile_succeeds(client):
    token, user_id, user_data = register_user(client, "org_owner_edit@test.com", "organization", org_name="BioHealth Inc")
    org_id = user_data["org_id"]

    headers = {"Authorization": f"Bearer {token}"}
    update_payload = {
        "description": "Leading biotechnology research organization",
        "website": "https://biohealth.example.com",
        "location": "Boston, MA",
        "focus_area": "Healthcare & Biotech"
    }

    res = client.patch(f"/profiles/organizations/{org_id}", json=update_payload, headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["description"] == "Leading biotechnology research organization"
    assert data["website"] == "https://biohealth.example.com"
    assert data["location"] == "Boston, MA"
    assert data["focus_area"] == "Healthcare & Biotech"

def test_update_other_organization_profile_fails_403(client):
    token1, _, user1_data = register_user(client, "org_target@test.com", "organization", org_name="Target Org")
    token2, _, _ = register_user(client, "org_hacker@test.com", "organization", org_name="Rogue Org")
    target_org_id = user1_data["org_id"]

    headers_rogue = {"Authorization": f"Bearer {token2}"}
    update_payload = {
        "description": "Hacked description"
    }

    res = client.patch(f"/profiles/organizations/{target_org_id}", json=update_payload, headers=headers_rogue)
    assert res.status_code == 403
    assert "permission" in res.json()["detail"].lower()

def test_update_own_university_profile_succeeds(client):
    token, user_id, user_data = register_user(client, "uni_owner_edit@test.com", "university", uni_name="State Science College")
    uni_id = user_data["university_id"]

    headers = {"Authorization": f"Bearer {token}"}
    update_payload = {
        "description": "Premier science & engineering institution",
        "location": "California, USA",
        "domain": "statescience.edu",
        "focus_area": "Computer Science & Engineering"
    }

    res = client.patch(f"/profiles/universities/{uni_id}", json=update_payload, headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["description"] == "Premier science & engineering institution"
    assert data["location"] == "California, USA"
    assert data["domain"] == "statescience.edu"
    assert data["focus_area"] == "Computer Science & Engineering"

def test_update_other_university_profile_fails_403(client):
    token1, _, user1_data = register_user(client, "uni_target@test.com", "university", uni_name="Target University")
    token2, _, _ = register_user(client, "uni_hacker@test.com", "university", uni_name="Rogue University")
    target_uni_id = user1_data["university_id"]

    headers_rogue = {"Authorization": f"Bearer {token2}"}
    res = client.patch(f"/profiles/universities/{target_uni_id}", json={"description": "Tampered description"}, headers=headers_rogue)
    assert res.status_code == 403

def test_get_nonexistent_profile_fails_404(client):
    res_org = client.get("/profiles/organizations/999999")
    assert res_org.status_code == 404

    res_uni = client.get("/profiles/universities/999999")
    assert res_uni.status_code == 404
