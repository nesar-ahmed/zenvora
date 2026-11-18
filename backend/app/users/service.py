from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.security import create_access_token, hash_password, verify_password
from app.users import repository
from app.users.exceptions import (
    InactiveUserError,
    InvalidCredentialsError,
    UserAlreadyExistsError,
)
from app.users.models import User, UserRole
from app.users.schemas import TokenResponse


def register_user(
    db: Session,
    *,
    email: str,
    password: str,
    full_name: str,
) -> User:
    normalized_email = email.strip().lower()

    if repository.get_by_email(db, normalized_email) is not None:
        raise UserAlreadyExistsError()

    try:
        return repository.create(
            db,
            email=normalized_email,
            hashed_password=hash_password(password),
            full_name=full_name,
            role=UserRole.CUSTOMER.value,
        )
    except IntegrityError as exc:
        # Handles a concurrent registration for the same email.
        db.rollback()
        raise UserAlreadyExistsError() from exc


def authenticate_user(db: Session, *, email: str, password: str) -> User:
    user = repository.get_by_email(db, email.strip().lower())
    if user is None or not verify_password(password, user.hashed_password):
        raise InvalidCredentialsError()

    if not user.is_active:
        raise InactiveUserError()

    return user


def login_user(db: Session, *, email: str, password: str) -> TokenResponse:
    user = authenticate_user(db, email=email, password=password)
    token, expires_in = create_access_token(user.id)
    return TokenResponse(access_token=token, expires_in=expires_in)


def update_profile(
    db: Session,
    user: User,
    *,
    full_name: str | None,
) -> User:
    if full_name is None:
        return user
    return repository.update_full_name(db, user, full_name=full_name)
