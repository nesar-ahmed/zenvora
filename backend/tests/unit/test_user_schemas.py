import pytest
from pydantic import ValidationError

from app.users.schemas import UserRegisterRequest


def test_registration_requires_a_valid_email() -> None:
    with pytest.raises(ValidationError):
        UserRegisterRequest(
            email="not-an-email",
            password="StrongPass123!",
            full_name="Nesar Ahmed",
        )


def test_registration_requires_a_minimum_password_length() -> None:
    with pytest.raises(ValidationError):
        UserRegisterRequest(
            email="nesar@example.com",
            password="short",
            full_name="Nesar Ahmed",
        )


def test_registration_trims_the_full_name() -> None:
    payload = UserRegisterRequest(
        email="nesar@example.com",
        password="StrongPass123!",
        full_name="  Nesar Ahmed  ",
    )

    assert payload.full_name == "Nesar Ahmed"
