from sqlalchemy import Select, select
from sqlalchemy.orm import Session

from app.businesses.models import Business, BusinessStatus
from app.catalog.models import Product
from app.catalog.schemas import ProductSort


def _public_products_query() -> Select:
    return (
        select(Product, Business)
        .join(Business, Product.business_id == Business.id)
        .where(
            Business.status == BusinessStatus.APPROVED.value,
            Business.is_active.is_(True),
            Product.is_active.is_(True),
            Product.is_available.is_(True),
        )
    )


def search_public(
    db: Session,
    *,
    country_code: str | None = None,
    city: str | None = None,
    category: str | None = None,
    search: str | None = None,
    min_price: int | None = None,
    max_price: int | None = None,
    sort: ProductSort = ProductSort.RECOMMENDED,
    limit: int = 24,
    offset: int = 0,
) -> list[tuple[Product, Business]]:
    statement = _public_products_query()

    if country_code is not None:
        statement = statement.where(Business.country_code == country_code.upper())

    if city is not None:
        statement = statement.where(Business.city == city)

    if category is not None:
        statement = statement.where(Product.category == category)

    if search:
        pattern = f"%{search.strip()}%"
        statement = statement.where(
            Product.name.ilike(pattern)
            | Product.description.ilike(pattern)
            | Business.name.ilike(pattern)
        )

    if min_price is not None:
        statement = statement.where(Product.price_cents >= min_price)

    if max_price is not None:
        statement = statement.where(Product.price_cents <= max_price)

    match sort:
        case ProductSort.PRICE_ASC:
            statement = statement.order_by(Product.price_cents.asc(), Product.name)
        case ProductSort.PRICE_DESC:
            statement = statement.order_by(Product.price_cents.desc(), Product.name)
        case ProductSort.RATING_DESC:
            statement = statement.order_by(
                Business.rating.desc(),
                Business.name,
                Product.name,
            )
        case ProductSort.NEWEST:
            statement = statement.order_by(
                Product.created_at.desc(),
                Product.name,
            )
        case _:
            statement = statement.order_by(
                Business.rating.desc(),
                Product.name,
            )

    statement = statement.limit(limit).offset(offset)
    return list(db.execute(statement).all())


def list_categories(
    db: Session,
    *,
    country_code: str | None = None,
    city: str | None = None,
) -> list[str]:
    statement = (
        select(Product.category)
        .join(Business, Product.business_id == Business.id)
        .where(
            Business.status == BusinessStatus.APPROVED.value,
            Business.is_active.is_(True),
            Product.is_active.is_(True),
            Product.is_available.is_(True),
        )
        .distinct()
        .order_by(Product.category)
    )

    if country_code is not None:
        statement = statement.where(Business.country_code == country_code.upper())

    if city is not None:
        statement = statement.where(Business.city == city)

    return list(db.scalars(statement).all())


def list_public_for_business(
    db: Session,
    business_id: str,
    *,
    limit: int = 100,
) -> list[Product]:
    statement = (
        select(Product)
        .where(
            Product.business_id == business_id,
            Product.is_active.is_(True),
            Product.is_available.is_(True),
        )
        .order_by(Product.category, Product.name)
        .limit(limit)
    )
    return list(db.scalars(statement).all())


def get_by_business_and_name(
    db: Session,
    *,
    business_id: str,
    name: str,
) -> Product | None:
    return db.scalar(
        select(Product).where(
            Product.business_id == business_id,
            Product.name == name,
        )
    )
