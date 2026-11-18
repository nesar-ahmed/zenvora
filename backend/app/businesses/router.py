from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.businesses import service
from app.businesses.models import BusinessCategory
from app.businesses.schemas import BusinessSummary
from app.catalog.schemas import ProductResponse
from app.database.session import get_db

router = APIRouter(prefix="/businesses", tags=["businesses"])


@router.get("", response_model=list[BusinessSummary], summary="List approved businesses")
def list_businesses(
    db: Annotated[Session, Depends(get_db)],
    country_code: Annotated[str | None, Query(min_length=2, max_length=2)] = None,
    city: Annotated[str | None, Query(max_length=80)] = None,
    category: BusinessCategory | None = None,
    q: Annotated[str | None, Query(max_length=120)] = None,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    offset: Annotated[int, Query(ge=0)] = 0,
) -> list[BusinessSummary]:
    businesses = service.list_businesses(
        db,
        country_code=country_code,
        city=city,
        category=category.value if category is not None else None,
        search=q,
        limit=limit,
        offset=offset,
    )
    return [BusinessSummary.model_validate(business) for business in businesses]


@router.get(
    "/{slug}",
    response_model=BusinessSummary,
    summary="Get an approved business",
)
def get_business(
    slug: str,
    db: Annotated[Session, Depends(get_db)],
) -> BusinessSummary:
    business = service.get_business(db, slug)
    return BusinessSummary.model_validate(business)


@router.get(
    "/{slug}/products",
    response_model=list[ProductResponse],
    summary="List a business's available products",
)
def list_business_products(
    slug: str,
    db: Annotated[Session, Depends(get_db)],
) -> list[ProductResponse]:
    products = service.list_business_products(db, slug)
    return [ProductResponse.model_validate(product) for product in products]
