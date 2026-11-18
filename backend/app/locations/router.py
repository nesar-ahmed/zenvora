from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.locations import repository
from app.locations.schemas import CountryResponse

router = APIRouter(prefix="/locations", tags=["locations"])


@router.get("", response_model=list[CountryResponse], summary="List delivery locations")
def list_locations(
    db: Annotated[Session, Depends(get_db)],
) -> list[CountryResponse]:
    return repository.list_countries_with_cities(db)
