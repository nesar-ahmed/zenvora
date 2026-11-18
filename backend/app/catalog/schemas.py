from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel, ConfigDict

from app.catalog.models import Product


class ProductResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    business_id: str
    name: str
    description: str
    category: str
    price_cents: int
    is_available: bool
    is_active: bool
    created_at: datetime
    updated_at: datetime


class ProductSort(StrEnum):
    RECOMMENDED = "recommended"
    PRICE_ASC = "price_asc"
    PRICE_DESC = "price_desc"
    RATING_DESC = "rating_desc"
    NEWEST = "newest"


class ProductFeedItem(BaseModel):
    id: str
    name: str
    description: str
    category: str
    price_cents: int
    business_id: str
    business_name: str
    business_slug: str
    business_rating: float
    business_delivery_fee_cents: int
    business_delivery_time_minutes: int
    business_city: str
    business_country_code: str


def product_to_feed_item(product: Product, business) -> ProductFeedItem:
    return ProductFeedItem(
        id=product.id,
        name=product.name,
        description=product.description,
        category=product.category,
        price_cents=product.price_cents,
        business_id=business.id,
        business_name=business.name,
        business_slug=business.slug,
        business_rating=business.rating,
        business_delivery_fee_cents=business.delivery_fee_cents,
        business_delivery_time_minutes=business.delivery_time_minutes,
        business_city=business.city,
        business_country_code=business.country_code,
    )
