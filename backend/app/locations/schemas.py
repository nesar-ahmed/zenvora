from pydantic import BaseModel


class CountryResponse(BaseModel):
    code: str
    name: str
    cities: list[str]
