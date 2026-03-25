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

