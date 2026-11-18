from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.businesses.models import BusinessCategory


class BusinessSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    slug: str
    description: str
    category: BusinessCategory
    address: str
    phone: str | None
    email: str | None
    country_code: str
    country_name: str
    city: str
    rating: float
    delivery_fee_cents: int
    delivery_time_minutes: int
    created_at: datetime
