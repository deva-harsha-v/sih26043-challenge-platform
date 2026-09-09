import pytest
from fastapi.testclient import TestClient

def create_user_helper(client: TestClient, email: str, role: str, org_name: str = None) -> tuple[str, int]:
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

def create_challenge_helper(client: TestClient, org_token: str, title: str = "Submission Challenge") -> int:
    headers = {"Authorization": f"Bearer {org_token}"}
    res = client.post("/challenges", json={
        "title": title,
        "description": "Challenge Description",
        "problem_statement": "Problem Statement",
        "category": "Software"
    }, headers=headers)
    return res.json()["id"]

def create_team_helper(client: TestClient, leader_token: str, challenge_id: int, name: str = "Alpha Team") -> int:
    headers = {"Authorization": f"Bearer {leader_token}"}
    res = client.post("/teams", json={
        "name": name,
        "challenge_id": challenge_id
    }, headers=headers)
    return res.json()["id"]

def test_submit_as_team_member_succeeds(client):
    org_token, _ = create_user_helper(client, "org_sub1@test.com", "organization", "Sub Org 1")
    c_id = create_challenge_helper(client, org_token)
    student_token, _ = create_user_helper(client, "student_sub1@test.com", "contributor")
    t_id = create_team_helper(client, student_token, c_id)

    headers = {"Authorization": f"Bearer {student_token}"}
    sub_payload = {
        "title": "Quantum AI Solver",
        "description": "High performance solver algorithm",
        "document_url": "https://github.com/example/quantum-solver",
        "team_id": t_id,
        "challenge_id": c_id
    }
    res = client.post("/submissions", json=sub_payload, headers=headers)
    assert res.status_code == 201
    data = res.json()
    assert data["title"] == "Quantum AI Solver"
    assert data["status"] == "submitted"
    assert data["team_id"] == t_id
    assert data["challenge_id"] == c_id

def test_submit_as_non_team_member_fails_403(client):
    org_token, _ = create_user_helper(client, "org_sub2@test.com", "organization", "Sub Org 2")
    c_id = create_challenge_helper(client, org_token)
    leader_token, _ = create_user_helper(client, "leader_sub2@test.com", "contributor")
    other_token, _ = create_user_helper(client, "other_sub2@test.com", "contributor")
    t_id = create_team_helper(client, leader_token, c_id)

    headers_other = {"Authorization": f"Bearer {other_token}"}
    sub_payload = {
        "title": "Unauthorized Submission",
        "description": "Rogue attempt",
        "team_id": t_id,
        "challenge_id": c_id
    }
    res = client.post("/submissions", json=sub_payload, headers=headers_other)
    assert res.status_code == 403

def test_submit_mismatched_challenge_id_fails_400(client):
    org_token, _ = create_user_helper(client, "org_sub3@test.com", "organization", "Sub Org 3")
    c1_id = create_challenge_helper(client, org_token, "Challenge 1")
    c2_id = create_challenge_helper(client, org_token, "Challenge 2")
    student_token, _ = create_user_helper(client, "student_sub3@test.com", "contributor")
    t_id = create_team_helper(client, student_token, c1_id)

    headers = {"Authorization": f"Bearer {student_token}"}
    # Submit for c2_id when team is registered for c1_id
    sub_payload = {
        "title": "Mismatched Submission",
        "description": "Mismatched challenge ID",
        "team_id": t_id,
        "challenge_id": c2_id
    }
    res = client.post("/submissions", json=sub_payload, headers=headers)
    assert res.status_code == 400
    assert "does not match" in res.json()["detail"]

def test_resubmission_updates_existing_submission(client):
    org_token, _ = create_user_helper(client, "org_sub4@test.com", "organization", "Sub Org 4")
    c_id = create_challenge_helper(client, org_token)
    student_token, _ = create_user_helper(client, "student_sub4@test.com", "contributor")
    t_id = create_team_helper(client, student_token, c_id)

    headers = {"Authorization": f"Bearer {student_token}"}
    p1 = {
        "title": "Initial Draft",
        "description": "Version 1",
        "document_url": "https://v1.example.com",
        "team_id": t_id,
        "challenge_id": c_id
    }
    res1 = client.post("/submissions", json=p1, headers=headers)
    sub1_id = res1.json()["id"]

    p2 = {
        "title": "Final Polished Solution",
        "description": "Version 2 updated",
        "document_url": "https://v2.example.com",
        "team_id": t_id,
        "challenge_id": c_id
    }
    res2 = client.post("/submissions", json=p2, headers=headers)
    assert res2.status_code == 201
    data2 = res2.json()
    assert data2["id"] == sub1_id  # Same submission ID updated in-place
    assert data2["title"] == "Final Polished Solution"
    assert data2["description"] == "Version 2 updated"

def test_challenge_owner_can_list_submissions(client):
    org_token, _ = create_user_helper(client, "org_owner_list@test.com", "organization", "Owner List Org")
    c_id = create_challenge_helper(client, org_token)
    student_token, _ = create_user_helper(client, "student_list1@test.com", "contributor")
    t_id = create_team_helper(client, student_token, c_id)

    # Submit solution
    client.post("/submissions", json={
        "title": "Team Submission",
        "description": "Ready for review",
        "team_id": t_id,
        "challenge_id": c_id
    }, headers={"Authorization": f"Bearer {student_token}"})

    # Owner lists submissions
    res = client.get(f"/submissions?challenge_id={c_id}", headers={"Authorization": f"Bearer {org_token}"})
    assert res.status_code == 200
    subs = res.json()
    assert len(subs) == 1
    assert subs[0]["title"] == "Team Submission"

def test_contributor_sees_only_own_team_submission(client):
    org_token, _ = create_user_helper(client, "org_owner_isol@test.com", "organization", "Isol Org")
    c_id = create_challenge_helper(client, org_token)

    t1_leader_token, _ = create_user_helper(client, "t1_leader@test.com", "contributor")
    t2_leader_token, _ = create_user_helper(client, "t2_leader@test.com", "contributor")

    t1_id = create_team_helper(client, t1_leader_token, c_id, "Team One")
    t2_id = create_team_helper(client, t2_leader_token, c_id, "Team Two")

    client.post("/submissions", json={
        "title": "Team 1 Submission",
        "description": "T1 Desc",
        "team_id": t1_id,
        "challenge_id": c_id
    }, headers={"Authorization": f"Bearer {t1_leader_token}"})

    client.post("/submissions", json={
        "title": "Team 2 Submission",
        "description": "T2 Desc",
        "team_id": t2_id,
        "challenge_id": c_id
    }, headers={"Authorization": f"Bearer {t2_leader_token}"})

    # Contributor 1 lists submissions for challenge -> sees ONLY Team 1 submission
    res_t1 = client.get(f"/submissions?challenge_id={c_id}", headers={"Authorization": f"Bearer {t1_leader_token}"})
    assert res_t1.status_code == 200
    items_t1 = res_t1.json()
    assert len(items_t1) == 1
    assert items_t1[0]["title"] == "Team 1 Submission"

def test_non_owner_org_cannot_list_or_update_submissions_403(client):
    org1_token, _ = create_user_helper(client, "org_real_owner@test.com", "organization", "Real Owner Org")
    org2_token, _ = create_user_helper(client, "org_fake_owner@test.com", "organization", "Rogue Org")
    c_id = create_challenge_helper(client, org1_token)

    student_token, _ = create_user_helper(client, "student_rogue@test.com", "contributor")
    t_id = create_team_helper(client, student_token, c_id)

    sub_res = client.post("/submissions", json={
        "title": "Target Submission",
        "description": "Target desc",
        "team_id": t_id,
        "challenge_id": c_id
    }, headers={"Authorization": f"Bearer {student_token}"})
    sub_id = sub_res.json()["id"]

    # Non-owner org tries to list -> 403
    res_list = client.get(f"/submissions?challenge_id={c_id}", headers={"Authorization": f"Bearer {org2_token}"})
    assert res_list.status_code == 403

    # Non-owner org tries to get submission detail -> 403
    res_get = client.get(f"/submissions/{sub_id}", headers={"Authorization": f"Bearer {org2_token}"})
    assert res_get.status_code == 403

    # Non-owner org tries to update status -> 403
    res_patch = client.patch(f"/submissions/{sub_id}/status", json={"status": "accepted"}, headers={"Authorization": f"Bearer {org2_token}"})
    assert res_patch.status_code == 403

def test_status_update_by_owner_succeeds(client):
    org_token, _ = create_user_helper(client, "org_eval@test.com", "organization", "Evaluator Org")
    c_id = create_challenge_helper(client, org_token)
    student_token, _ = create_user_helper(client, "student_eval@test.com", "contributor")
    t_id = create_team_helper(client, student_token, c_id)

    sub_res = client.post("/submissions", json={
        "title": "Top Innovation",
        "description": "Groundbreaking entry",
        "team_id": t_id,
        "challenge_id": c_id
    }, headers={"Authorization": f"Bearer {student_token}"})
    sub_id = sub_res.json()["id"]

    # Owner updates status to shortlisted with reviewer notes
    patch_res = client.patch(f"/submissions/{sub_id}/status", json={
        "status": "shortlisted",
        "reviewer_notes": "Exceptional architecture and documentation."
    }, headers={"Authorization": f"Bearer {org_token}"})

    assert patch_res.status_code == 200
    data = patch_res.json()
    assert data["status"] == "shortlisted"
    assert data["reviewer_notes"] == "Exceptional architecture and documentation."
    assert data["reviewed_at"] is not None

def test_status_update_by_non_owner_fails_403(client):
    org_token, _ = create_user_helper(client, "org_legit@test.com", "organization", "Legit Org")
    c_id = create_challenge_helper(client, org_token)
    student_token, _ = create_user_helper(client, "student_hacker@test.com", "contributor")
    t_id = create_team_helper(client, student_token, c_id)

    sub_res = client.post("/submissions", json={
        "title": "Hack Submission",
        "description": "Desc",
        "team_id": t_id,
        "challenge_id": c_id
    }, headers={"Authorization": f"Bearer {student_token}"})
    sub_id = sub_res.json()["id"]

    # Student attempts to accept their own submission -> 403
    res_patch = client.patch(f"/submissions/{sub_id}/status", json={"status": "accepted"}, headers={"Authorization": f"Bearer {student_token}"})
    assert res_patch.status_code == 403

def test_status_update_with_invalid_enum_fails_validation(client):
    org_token, _ = create_user_helper(client, "org_val@test.com", "organization", "Val Org")
    c_id = create_challenge_helper(client, org_token)
    student_token, _ = create_user_helper(client, "student_val@test.com", "contributor")
    t_id = create_team_helper(client, student_token, c_id)

    sub_res = client.post("/submissions", json={
        "title": "Val Submission",
        "description": "Desc",
        "team_id": t_id,
        "challenge_id": c_id
    }, headers={"Authorization": f"Bearer {student_token}"})
    sub_id = sub_res.json()["id"]

    # Passing invalid status "aproved" (typo) -> 422 Unprocessable Entity
    res_patch = client.patch(f"/submissions/{sub_id}/status", json={"status": "aproved"}, headers={"Authorization": f"Bearer {org_token}"})
    assert res_patch.status_code == 422
