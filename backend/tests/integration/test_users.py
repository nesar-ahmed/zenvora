from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.users import repository
from app.users.models import UserRole


def register_payload(
    *,
    email: str = "nesar@example.com",
    password: str = "StrongPass123!",
    full_name: str = "Nesar Ahmed",
) -> dict[str, str]:
    return {
        "email": email,
        "password": password,
        "full_name": full_name,
    }


def login(client: TestClient, email: str, password: str) -> dict[str, object]:
    response = client.post(
        "/api/v1/users/login",
        json={"email": email, "password": password},
    )
    assert response.status_code == 200
    return response.json()


def auth_headers(client: TestClient, email: str, password: str) -> dict[str, str]:
    tokens = login(client, email, password)
    return {"Authorization": f"Bearer {tokens['access_token']}"}


def test_register_login_and_manage_profile(client: TestClient) -> None:
    response = client.post(
        "/api/v1/users/register",
        json=register_payload(email="Nesar@Example.com"),
    )

    assert response.status_code == 201
    registered = response.json()
    assert registered["email"] == "nesar@example.com"
    assert registered["full_name"] == "Nesar Ahmed"
    assert registered["role"] == "customer"
    assert registered["is_active"] is True
    assert "password" not in registered
    assert "hashed_password" not in registered

    headers = auth_headers(client, "nesar@example.com", "StrongPass123!")

    profile = client.get("/api/v1/users/me", headers=headers)
    assert profile.status_code == 200
    assert profile.json()["id"] == registered["id"]

    updated = client.patch(
        "/api/v1/users/me",
        headers=headers,
        json={"full_name": "Nesar A."},
    )
    assert updated.status_code == 200
    assert updated.json()["full_name"] == "Nesar A."


def test_registration_rejects_duplicate_email(client: TestClient) -> None:
    payload = register_payload()
    assert client.post("/api/v1/users/register", json=payload).status_code == 201

    response = client.post("/api/v1/users/register", json=payload)

    assert response.status_code == 409
    assert response.json()["error"]["code"] == "USER_ALREADY_EXISTS"


def test_login_rejects_invalid_credentials(client: TestClient) -> None:
    client.post("/api/v1/users/register", json=register_payload())

    response = client.post(
        "/api/v1/users/login",
        json={"email": "nesar@example.com", "password": "wrong-password"},
    )

    assert response.status_code == 401
    assert response.json()["error"]["code"] == "INVALID_CREDENTIALS"


def test_profile_requires_authentication(client: TestClient) -> None:
    response = client.get("/api/v1/users/me")

    assert response.status_code == 401
    assert response.json()["error"]["code"] == "AUTHENTICATION_REQUIRED"
    assert response.headers["www-authenticate"] == "Bearer"


def test_inactive_user_cannot_log_in(
    client: TestClient,
    db_session: Session,
) -> None:
    client.post("/api/v1/users/register", json=register_payload())

    user = repository.get_by_email(db_session, "nesar@example.com")
    assert user is not None
    user.is_active = False
    db_session.commit()

    response = client.post(
        "/api/v1/users/login",
        json={"email": "nesar@example.com", "password": "StrongPass123!"},
    )

    assert response.status_code == 403
    assert response.json()["error"]["code"] == "USER_INACTIVE"


def test_seed_users_are_loaded_from_file(db_session: Session) -> None:
    from app.database.seed import load_seed_users, seed_users

    records = load_seed_users()

    assert len(records) == 5
    assert {record.role for record in records} == {
        UserRole.SUPER_ADMIN,
        UserRole.ADMIN,
        UserRole.CUSTOMER,
        UserRole.MERCHANT,
        UserRole.DRIVER,
    }

    created = seed_users(db_session, records)

    assert len(created) == len(records)
    assert seed_users(db_session, records) == []

    for record in records:
        user = repository.get_by_email(db_session, str(record.email))
        assert user is not None
        assert user.role == record.role.value
