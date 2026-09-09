import pytest
from fastapi.testclient import TestClient

def create_user_and_token(client: TestClient, email: str, role: str, org_name: str = None) -> tuple[str, int]:
    payload = {
        "email": email,
        "password": "Password123!",
        "full_name": f"User {email}",
        "role": role,
        "org_name": org_name
    }
    res = client.post("/auth/register", json=payload)
    data = res.json()
    return data["access_token"], data["user"]["id"]

def create_challenge_helper(client: TestClient, org_token: str, title: str = "Test Challenge") -> int:
    headers = {"Authorization": f"Bearer {org_token}"}
    res = client.post("/challenges", json={
        "title": title,
        "description": "Test Desc",
        "problem_statement": "Test PS",
        "category": "General"
    }, headers=headers)
    return res.json()["id"]

def test_create_team_as_contributor_succeeds(client):
    org_token, _ = create_user_and_token(client, "org1@test.com", "organization", "Org One")
    c_id = create_challenge_helper(client, org_token)

    student_token, student_id = create_user_and_token(client, "student1@test.com", "contributor")
    headers = {"Authorization": f"Bearer {student_token}"}

    res = client.post("/teams", json={
        "name": "Alpha Hackers",
        "challenge_id": c_id,
        "description": "Winning team"
    }, headers=headers)

    assert res.status_code == 201
    data = res.json()
    assert data["name"] == "Alpha Hackers"
    assert data["challenge_id"] == c_id
    assert data["leader_id"] == student_id
    assert len(data["members"]) == 1
    assert data["members"][0]["role_in_team"] == "Leader"

def test_create_team_as_organization_fails_403(client):
    org_token, _ = create_user_and_token(client, "org2@test.com", "organization", "Org Two")
    c_id = create_challenge_helper(client, org_token)

    headers = {"Authorization": f"Bearer {org_token}"}
    res = client.post("/teams", json={
        "name": "Invalid Org Team",
        "challenge_id": c_id
    }, headers=headers)
    assert res.status_code == 403

def test_join_team_succeeds(client):
    org_token, _ = create_user_and_token(client, "org3@test.com", "organization", "Org Three")
    c_id = create_challenge_helper(client, org_token)

    leader_token, leader_id = create_user_and_token(client, "leader1@test.com", "contributor")
    member_token, member_id = create_user_and_token(client, "member1@test.com", "contributor")

    # Create team
    res_create = client.post("/teams", json={"name": "Beta Team", "challenge_id": c_id}, headers={"Authorization": f"Bearer {leader_token}"})
    team_id = res_create.json()["id"]

    # Join team
    res_join = client.post(f"/teams/{team_id}/join", headers={"Authorization": f"Bearer {member_token}"})
    assert res_join.status_code == 200
    data = res_join.json()
    assert len(data["members"]) == 2
    assert any(m["user_id"] == member_id and m["role_in_team"] == "Member" for m in data["members"])

def test_join_second_team_same_challenge_fails_400(client):
    org_token, _ = create_user_and_token(client, "org4@test.com", "organization", "Org Four")
    c_id = create_challenge_helper(client, org_token)

    leader1_token, _ = create_user_and_token(client, "l1@test.com", "contributor")
    leader2_token, _ = create_user_and_token(client, "l2@test.com", "contributor")
    student_token, _ = create_user_and_token(client, "student_dupe@test.com", "contributor")

    t1_id = client.post("/teams", json={"name": "Team A", "challenge_id": c_id}, headers={"Authorization": f"Bearer {leader1_token}"}).json()["id"]
    t2_id = client.post("/teams", json={"name": "Team B", "challenge_id": c_id}, headers={"Authorization": f"Bearer {leader2_token}"}).json()["id"]

    # Join Team A succeeds
    res_j1 = client.post(f"/teams/{t1_id}/join", headers={"Authorization": f"Bearer {student_token}"})
    assert res_j1.status_code == 200

    # Join Team B for same challenge fails 400
    res_j2 = client.post(f"/teams/{t2_id}/join", headers={"Authorization": f"Bearer {student_token}"})
    assert res_j2.status_code == 400
    assert "already a member" in res_j2.json()["detail"]

def test_join_team_different_challenge_succeeds(client):
    org_token, _ = create_user_and_token(client, "org5@test.com", "organization", "Org Five")
    c1_id = create_challenge_helper(client, org_token, "Challenge 1")
    c2_id = create_challenge_helper(client, org_token, "Challenge 2")

    l1_token, _ = create_user_and_token(client, "l1_diff@test.com", "contributor")
    l2_token, _ = create_user_and_token(client, "l2_diff@test.com", "contributor")
    student_token, _ = create_user_and_token(client, "student_multi@test.com", "contributor")

    t1_id = client.post("/teams", json={"name": "Team C1", "challenge_id": c1_id}, headers={"Authorization": f"Bearer {l1_token}"}).json()["id"]
    t2_id = client.post("/teams", json={"name": "Team C2", "challenge_id": c2_id}, headers={"Authorization": f"Bearer {l2_token}"}).json()["id"]

    assert client.post(f"/teams/{t1_id}/join", headers={"Authorization": f"Bearer {student_token}"}).status_code == 200
    assert client.post(f"/teams/{t2_id}/join", headers={"Authorization": f"Bearer {student_token}"}).status_code == 200

def test_leader_remove_member_succeeds(client):
    org_token, _ = create_user_and_token(client, "org6@test.com", "organization", "Org Six")
    c_id = create_challenge_helper(client, org_token)

    l_token, _ = create_user_and_token(client, "leader_kick@test.com", "contributor")
    m_token, m_id = create_user_and_token(client, "member_kick@test.com", "contributor")

    t_id = client.post("/teams", json={"name": "Kick Team", "challenge_id": c_id}, headers={"Authorization": f"Bearer {l_token}"}).json()["id"]
    client.post(f"/teams/{t_id}/join", headers={"Authorization": f"Bearer {m_token}"})

    # Leader kicks member
    res_kick = client.delete(f"/teams/{t_id}/members/{m_id}", headers={"Authorization": f"Bearer {l_token}"})
    assert res_kick.status_code == 200
    assert len(res_kick.json()["members"]) == 1

def test_non_leader_remove_member_fails_403(client):
    org_token, _ = create_user_and_token(client, "org7@test.com", "organization", "Org Seven")
    c_id = create_challenge_helper(client, org_token)

    l_token, l_id = create_user_and_token(client, "leader_safe@test.com", "contributor")
    m_token, _ = create_user_and_token(client, "member_rogue@test.com", "contributor")

    t_id = client.post("/teams", json={"name": "Rogue Team", "challenge_id": c_id}, headers={"Authorization": f"Bearer {l_token}"}).json()["id"]
    client.post(f"/teams/{t_id}/join", headers={"Authorization": f"Bearer {m_token}"})

    # Member tries to kick leader -> Fails 403
    res_kick = client.delete(f"/teams/{t_id}/members/{l_id}", headers={"Authorization": f"Bearer {m_token}"})
    assert res_kick.status_code == 403

def test_leader_leaving_promotes_next_member_atomically(client):
    org_token, _ = create_user_and_token(client, "org8@test.com", "organization", "Org Eight")
    c_id = create_challenge_helper(client, org_token)

    l_token, l_id = create_user_and_token(client, "leader_leave@test.com", "contributor")
    m_token, m_id = create_user_and_token(client, "next_leader@test.com", "contributor")

    t_id = client.post("/teams", json={"name": "Promotion Team", "challenge_id": c_id}, headers={"Authorization": f"Bearer {l_token}"}).json()["id"]
    client.post(f"/teams/{t_id}/join", headers={"Authorization": f"Bearer {m_token}"})

    # Leader leaves
    res_leave = client.delete(f"/teams/{t_id}/leave", headers={"Authorization": f"Bearer {l_token}"})
    assert res_leave.status_code == 200

    # Fetch updated team details & verify atomic promotion
    res_team = client.get(f"/teams/{t_id}")
    data = res_team.json()
    assert data["leader_id"] == m_id
    assert len(data["members"]) == 1
    assert data["members"][0]["user_id"] == m_id
    assert data["members"][0]["role_in_team"] == "Leader"

def test_last_member_leaving_deletes_team(client):
    org_token, _ = create_user_and_token(client, "org9@test.com", "organization", "Org Nine")
    c_id = create_challenge_helper(client, org_token)

    l_token, _ = create_user_and_token(client, "solo_leader@test.com", "contributor")
    t_id = client.post("/teams", json={"name": "Solo Team", "challenge_id": c_id}, headers={"Authorization": f"Bearer {l_token}"}).json()["id"]

    # Solo leader leaves
    res_leave = client.delete(f"/teams/{t_id}/leave", headers={"Authorization": f"Bearer {l_token}"})
    assert res_leave.status_code == 200

    # Verify team deleted 404
    res_get = client.get(f"/teams/{t_id}")
    assert res_get.status_code == 404
