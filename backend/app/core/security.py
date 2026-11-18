from datetime import UTC, datetime, timedelta

import jwt
from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerificationError

from app.config import settings
from app.core.exceptions import AuthenticationError

_password_hasher = PasswordHasher()


def hash_password(password: str) -> str:
    """Hash a plain-text password using Argon2id."""
    return _password_hasher.hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
    """Verify a password against its Argon2 hash."""
    try:
        return _password_hasher.verify(hashed_password, password)
    except (InvalidHashError, VerificationError):
        return False


def create_access_token(subject: str) -> tuple[str, int]:
    """Create a signed access token and return it with its lifetime in seconds."""
    expires_in = settings.access_token_expire_minutes * 60
    issued_at = datetime.now(UTC)
    payload = {
        "sub": subject,
        "type": "access",
        "iat": issued_at,
        "exp": issued_at + timedelta(seconds=expires_in),
    }
    token = jwt.encode(
        payload,
        settings.jwt_secret_key,
        algorithm=settings.jwt_algorithm,
    )
    return token, expires_in


def decode_access_token(token: str) -> str:
    """Decode an access token and return its subject (user ID)."""
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm],
        )
    except jwt.InvalidTokenError as exc:
        raise AuthenticationError("Invalid or expired authentication token.") from exc

    subject = payload.get("sub")
    if not isinstance(subject, str) or not subject:
        raise AuthenticationError("Invalid or expired authentication token.")

    return subject
