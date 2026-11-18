from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.catalog import service
from app.catalog.schemas import ProductFeedItem, ProductSort
from app.database.session import get_db

router = APIRouter(prefix="/products", tags=["products"])


@router.get("", response_model=list[ProductFeedItem], summary="Browse available food")
def list_products(
    db: Annotated[Session, Depends(get_db)],
    country_code: Annotated[str | None, Query(min_length=2, max_length=2)] = None,
    city: Annotated[str | None, Query(max_length=80)] = None,
    category: Annotated[str | None, Query(max_length=64)] = None,
    q: Annotated[str | None, Query(max_length=120)] = None,
    min_price: Annotated[int | None, Query(ge=0, alias="min_price")] = None,
    max_price: Annotated[int | None, Query(ge=0, alias="max_price")] = None,
    sort: ProductSort = ProductSort.RECOMMENDED,
    limit: Annotated[int, Query(ge=1, le=100)] = 24,
    offset: Annotated[int, Query(ge=0)] = 0,
) -> list[ProductFeedItem]:
    return service.list_products(
        db,
        country_code=country_code,
        city=city,
        category=category,
        search=q,
        min_price=min_price,
        max_price=max_price,
        sort=sort,
        limit=limit,
        offset=offset,
    )


@router.get(
    "/categories",
    response_model=list[str],
    summary="List available food categories",
)
def list_categories(
    db: Annotated[Session, Depends(get_db)],
    country_code: Annotated[str | None, Query(min_length=2, max_length=2)] = None,
    city: Annotated[str | None, Query(max_length=80)] = None,
) -> list[str]:
    return service.list_categories(
        db,
        country_code=country_code,
        city=city,
    )
