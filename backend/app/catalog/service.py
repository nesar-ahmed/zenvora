from sqlalchemy.orm import Session

from app.catalog import repository
from app.catalog.schemas import ProductFeedItem, ProductSort, product_to_feed_item


def list_products(
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
) -> list[ProductFeedItem]:
    rows = repository.search_public(
        db,
        country_code=country_code,
        city=city,
        category=category,
        search=search,
        min_price=min_price,
        max_price=max_price,
        sort=sort,
        limit=limit,
        offset=offset,
    )
    return [product_to_feed_item(product, business) for product, business in rows]


def list_categories(
    db: Session,
    *,
    country_code: str | None = None,
    city: str | None = None,
) -> list[str]:
    return repository.list_categories(
        db,
        country_code=country_code,
        city=city,
    )
