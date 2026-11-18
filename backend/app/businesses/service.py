from sqlalchemy.orm import Session

from app.businesses import repository
from app.businesses.exceptions import BusinessNotFoundError
from app.businesses.models import Business
from app.catalog import repository as catalog_repository
from app.catalog.models import Product


def list_businesses(
    db: Session,
    *,
    country_code: str | None = None,
    city: str | None = None,
    category: str | None = None,
    search: str | None = None,
    limit: int = 20,
    offset: int = 0,
) -> list[Business]:
    return repository.list_public(
        db,
        country_code=country_code,
        city=city,
        category=category,
        search=search,
        limit=limit,
        offset=offset,
    )


def get_business(db: Session, slug: str) -> Business:
    business = repository.get_public_by_slug(db, slug)
    if business is None:
        raise BusinessNotFoundError()
    return business


def list_business_products(db: Session, slug: str) -> list[Product]:
    business = get_business(db, slug)
    return catalog_repository.list_public_for_business(db, business.id)
