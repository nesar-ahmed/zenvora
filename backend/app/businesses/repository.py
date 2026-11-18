from sqlalchemy import select
from sqlalchemy.orm import Session

from app.businesses.models import Business, BusinessStatus


def list_public(
    db: Session,
    *,
    country_code: str | None = None,
    city: str | None = None,
    category: str | None = None,
    search: str | None = None,
    limit: int = 20,
    offset: int = 0,
) -> list[Business]:
    statement = select(Business).where(
        Business.status == BusinessStatus.APPROVED.value,
        Business.is_active.is_(True),
    )

    if country_code is not None:
        statement = statement.where(Business.country_code == country_code.upper())

    if city is not None:
        statement = statement.where(Business.city == city)

    if category is not None:
        statement = statement.where(Business.category == category)

    if search:
        pattern = f"%{search.strip()}%"
        statement = statement.where(
            Business.name.ilike(pattern) | Business.description.ilike(pattern)
        )

    statement = statement.order_by(Business.name).limit(limit).offset(offset)
    return list(db.scalars(statement).all())


def get_by_slug(db: Session, slug: str) -> Business | None:
    return db.scalar(select(Business).where(Business.slug == slug))


def get_public_by_slug(db: Session, slug: str) -> Business | None:
    return db.scalar(
        select(Business).where(
            Business.slug == slug,
            Business.status == BusinessStatus.APPROVED.value,
            Business.is_active.is_(True),
        )
    )
