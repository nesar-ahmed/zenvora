from sqlalchemy import select
from sqlalchemy.orm import Session

from app.businesses.models import Business, BusinessStatus
from app.locations.schemas import CountryResponse


def list_countries_with_cities(db: Session) -> list[CountryResponse]:
    rows = db.execute(
        select(Business.country_code, Business.country_name, Business.city)
        .where(
            Business.status == BusinessStatus.APPROVED.value,
            Business.is_active.is_(True),
        )
        .distinct()
        .order_by(Business.country_name, Business.city)
    ).all()

    countries: dict[str, CountryResponse] = {}
    for code, name, city in rows:
        country = countries.get(code)
        if country is None:
            country = CountryResponse(code=code, name=name, cities=[])
            countries[code] = country
        if city not in country.cities:
            country.cities.append(city)

    return sorted(countries.values(), key=lambda country: country.name)
