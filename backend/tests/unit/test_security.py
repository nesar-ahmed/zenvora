import pytest

from app.core.exceptions import AuthenticationError
from app.core.security import (
    create_access_token,
    decode_access_token,
    hash_password,
    verify_password,
)


def test_password_hash_can_be_verified() -> None:
    hashed = hash_password("StrongPass123!")

    assert hashed != "StrongPass123!"
    assert verify_password("StrongPass123!", hashed) is True
    assert verify_password("wrong-password", hashed) is False


def test_invalid_hash_is_rejected() -> None:
    assert verify_password("StrongPass123!", "not-a-valid-hash") is False


def test_access_token_round_trip() -> None:
    token, expires_in = create_access_token("user-id")

    assert expires_in > 0
    assert decode_access_token(token) == "user-id"


def test_tampered_access_token_is_rejected() -> None:
    with pytest.raises(AuthenticationError):
        decode_access_token("not-a-valid-token")
