from sqlalchemy import select
from sqlalchemy.orm import Session

from app.users.models import User


def get_by_id(db: Session, user_id: str) -> User | None:
    return db.scalar(select(User).where(User.id == user_id))


def get_by_email(db: Session, email: str) -> User | None:
    return db.scalar(select(User).where(User.email == email))


def create(
    db: Session,
    *,
    email: str,
    hashed_password: str,
    full_name: str,
    role: str,
) -> User:
    user = User(
        email=email,
        hashed_password=hashed_password,
        full_name=full_name,
        role=role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def update_full_name(db: Session, user: User, *, full_name: str) -> User:
    user.full_name = full_name
    db.commit()
    db.refresh(user)
    return user
