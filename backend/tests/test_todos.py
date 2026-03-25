from fastapi.testclient import TestClient

from app.main import app


def _auth_headers(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def test_create_todo_success():
    client = TestClient(app)

    username = "todo-user-1"
    email = "todo1@example.com"
    password = "Password123!"

    register_resp = client.post(
        "/api/v1/auth/register",
        json={"username": username, "email": email, "password": password},
    )
    assert register_resp.status_code == 201

    login_resp = client.post(
        "/api/v1/auth/login",
        json={"username": username, "password": password},
    )
    assert login_resp.status_code == 200
    token = login_resp.json()["access_token"]

    me_resp = client.get(
        "/api/v1/users/me",
        headers=_auth_headers(token),
    )
    assert me_resp.status_code == 200
    user_id = me_resp.json()["id"]

    todo_resp = client.post(
        "/api/v1/todos",
        headers=_auth_headers(token),
        json={
            "title": "Test Todo",
            "description": "Test description",
            "priority": "HIGH",
        },
    )
    assert todo_resp.status_code == 201
    data = todo_resp.json()
    assert data["title"] == "Test Todo"
    assert data["description"] == "Test description"
    assert data["priority"] == "HIGH"
    assert data["user_id"] == user_id


def test_get_all_todos():
    client = TestClient(app)

    password = "Password123!"

    # User 1
    u1_username = "todo-user-1a"
    u1_email = "todo1a@example.com"
    u1_register = client.post(
        "/api/v1/auth/register",
        json={"username": u1_username, "email": u1_email, "password": password},
    )
    assert u1_register.status_code == 201
    u1_login = client.post(
        "/api/v1/auth/login",
        json={"username": u1_username, "password": password},
    )
    assert u1_login.status_code == 200
    u1_token = u1_login.json()["access_token"]
    u1_me = client.get("/api/v1/users/me", headers=_auth_headers(u1_token))
    assert u1_me.status_code == 200
    u1_id = u1_me.json()["id"]

    # User 2
    u2_username = "todo-user-2a"
    u2_email = "todo2a@example.com"
    u2_register = client.post(
        "/api/v1/auth/register",
        json={"username": u2_username, "email": u2_email, "password": password},
    )
    assert u2_register.status_code == 201
    u2_login = client.post(
        "/api/v1/auth/login",
        json={"username": u2_username, "password": password},
    )
    assert u2_login.status_code == 200
    u2_token = u2_login.json()["access_token"]
    u2_me = client.get("/api/v1/users/me", headers=_auth_headers(u2_token))
    assert u2_me.status_code == 200
    u2_id = u2_me.json()["id"]

    # Create todos for both users
    t1 = client.post(
        "/api/v1/todos",
        headers=_auth_headers(u1_token),
        json={
            "title": "U1 Todo",
            "description": "U1 description",
            "priority": "LOW",
        },
    )
    assert t1.status_code == 201

    t2 = client.post(
        "/api/v1/todos",
        headers=_auth_headers(u2_token),
        json={
            "title": "U2 Todo",
            "description": "U2 description",
            "priority": "MEDIUM",
        },
    )
    assert t2.status_code == 201

    list_resp = client.get(
        "/api/v1/todos",
        headers=_auth_headers(u1_token),
    )
    assert list_resp.status_code == 200
    todos = list_resp.json()

    assert isinstance(todos, list)
    assert len(todos) >= 2

    # Verify ownership + description hiding.
    by_user_id = {t["user_id"]: t for t in todos}
    assert u1_id in by_user_id
    assert u2_id in by_user_id

    # Owner sees description
    assert by_user_id[u1_id]["title"] == "U1 Todo"
    assert by_user_id[u1_id]["description"] == "U1 description"

    # Non-owner: description should be hidden (field omitted)
    assert by_user_id[u2_id]["title"] == "U2 Todo"
    assert "description" not in by_user_id[u2_id]


def test_delete_todo():
    client = TestClient(app)
    username = "test-delete-user"
    password = "Password123!"

    # Register
    client.post(
        "/api/v1/auth/register",
        json={"username": username, "email": "delete@example.com", "password": password},
    )

    # Login
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"username": username, "password": password},
    )
    token = login_resp.json()["access_token"]

    # Create Todo
    todo_resp = client.post(
        "/api/v1/todos",
        headers=_auth_headers(token),
        json={"title": "Delete Me", "description": "Delete me description", "priority": "LOW"}
    )
    assert todo_resp.status_code == 201
    todo_id = todo_resp.json()["id"]

    # Delete Todo
    delete_resp = client.delete(
        f"/api/v1/todos/{todo_id}",
        headers=_auth_headers(token)
    )
    assert delete_resp.status_code == 204

    # Verify it's gone
    get_resp = client.get(
        f"/api/v1/todos/{todo_id}",
        headers=_auth_headers(token)
    )
    assert get_resp.status_code == 404


def test_update_todo():
    client = TestClient(app)
    username = "test-update-user"
    password = "Password123!"

    # Register
    client.post(
        "/api/v1/auth/register",
        json={"username": username, "email": "update@example.com", "password": password},
    )

    # Login
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"username": username, "password": password},
    )
    token = login_resp.json()["access_token"]

    # Create Todo
    todo_resp = client.post(
        "/api/v1/todos",
        headers=_auth_headers(token),
        json={"title": "Old Title", "description": "Old description", "priority": "LOW"}
    )
    assert todo_resp.status_code == 201
    todo_id = todo_resp.json()["id"]

    # Update (PATCH)
    patch_resp = client.patch(
        f"/api/v1/todos/{todo_id}",
        headers=_auth_headers(token),
        json={"title": "New Title"}
    )
    assert patch_resp.status_code == 200
    assert patch_resp.json()["title"] == "New Title"
    assert patch_resp.json()["description"] == "Old description"

    # Update (PUT)
    put_resp = client.put(
        f"/api/v1/todos/{todo_id}",
        headers=_auth_headers(token),
        json={"title": "Updated Title", "description": "Updated description", "priority": "HIGH"}
    )
    assert put_resp.status_code == 200
    assert put_resp.json()["title"] == "Updated Title"
    assert put_resp.json()["description"] == "Updated description"
    assert put_resp.json()["priority"] == "HIGH"


def test_complete_todo():
    client = TestClient(app)
    username = "test-complete-user"
    password = "Password123!"

    # Register
    client.post(
        "/api/v1/auth/register",
        json={"username": username, "email": "complete@example.com", "password": password},
    )

    # Login
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"username": username, "password": password},
    )
    token = login_resp.json()["access_token"]

    # Create Todo
    todo_resp = client.post(
        "/api/v1/todos",
        headers=_auth_headers(token),
        json={"title": "Incomplete Todo", "description": "Description", "priority": "LOW"}
    )
    assert todo_resp.status_code == 201
    todo_id = todo_resp.json()["id"]
    assert todo_resp.json()["status"] == "NOT_STARTED"

    # Toggle complete (to COMPLETED)
    complete_resp = client.patch(
        f"/api/v1/todos/{todo_id}/complete",
        headers=_auth_headers(token)
    )
    assert complete_resp.status_code == 200
    assert complete_resp.json()["status"] == "COMPLETED"

    # Toggle complete again (back to NOT_STARTED)
    incomplete_resp = client.patch(
        f"/api/v1/todos/{todo_id}/complete",
        headers=_auth_headers(token)
    )
    assert incomplete_resp.status_code == 200
    assert incomplete_resp.json()["status"] == "NOT_STARTED"


def test_todo_stats():
    client = TestClient(app)
    username = "test-stats-user"
    password = "Password123!"

    # Register
    client.post(
        "/api/v1/auth/register",
        json={"username": username, "email": "stats@example.com", "password": password},
    )

    # Login
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"username": username, "password": password},
    )
    token = login_resp.json()["access_token"]

    # Create todos with various priorities and statuses
    # 1. HIGH, COMPLETED
    t1 = client.post(
        "/api/v1/todos",
        headers=_auth_headers(token),
        json={"title": "T1", "description": "D1", "priority": "HIGH"}
    )
    client.patch(f"/api/v1/todos/{t1.json()['id']}/complete", headers=_auth_headers(token))

    # 2. HIGH, PENDING
    client.post(
        "/api/v1/todos",
        headers=_auth_headers(token),
        json={"title": "T2", "description": "D2", "priority": "HIGH"}
    )

    # 3. MEDIUM, PENDING
    client.post(
        "/api/v1/todos",
        headers=_auth_headers(token),
        json={"title": "T3", "description": "D3", "priority": "MEDIUM"}
    )

    # 4. LOW, PENDING
    client.post(
        "/api/v1/todos",
        headers=_auth_headers(token),
        json={"title": "T4", "description": "D4", "priority": "LOW"}
    )

    # Stats
    stats_resp = client.get(
        "/api/v1/todos/stats",
        headers=_auth_headers(token)
    )
    assert stats_resp.status_code == 200
    stats = stats_resp.json()
    assert stats["total"] == 4
    assert stats["completed"] == 1
    assert stats["pending"] == 3
    assert stats["by_priority"]["HIGH"] == 2
    assert stats["by_priority"]["MEDIUM"] == 1
    assert stats["by_priority"]["LOW"] == 1


def test_get_single_todo_owner_only():
    client = TestClient(app)
    password = "Password123!"

    # User 1
    u1_reg = client.post(
        "/api/v1/auth/register",
        json={"username": "u1", "email": "u1@example.com", "password": password},
    )
    u1_token = client.post(
        "/api/v1/auth/login",
        json={"username": "u1", "password": password},
    ).json()["access_token"]

    # User 2
    u2_reg = client.post(
        "/api/v1/auth/register",
        json={"username": "u2", "email": "u2@example.com", "password": password},
    )
    u2_token = client.post(
        "/api/v1/auth/login",
        json={"username": "u2", "password": password},
    ).json()["access_token"]

    # U1 creates a todo
    t1_resp = client.post(
        "/api/v1/todos",
        headers=_auth_headers(u1_token),
        json={"title": "U1 Todo", "description": "U1 Description"}
    )
    t1_id = t1_resp.json()["id"]

    # U1 can get it
    get_u1 = client.get(f"/api/v1/todos/{t1_id}", headers=_auth_headers(u1_token))
    assert get_u1.status_code == 200

    # U2 cannot get it (Forbidden)
    get_u2 = client.get(f"/api/v1/todos/{t1_id}", headers=_auth_headers(u2_token))
    assert get_u2.status_code == 403

