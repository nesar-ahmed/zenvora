import json
from collections.abc import Sequence
from typing import Any

from pydantic import (
    BaseModel,
    ConfigDict,
    EmailStr,
    Field,
    TypeAdapter,
    ValidationError,
    field_validator,
)
from sqlalchemy.orm import Session

from app.businesses.models import Business, BusinessCategory, BusinessStatus
from app.businesses.repository import get_by_slug
from app.catalog.models import Product
from app.catalog.repository import get_by_business_and_name
from app.config import BACKEND_DIR
from app.core.security import hash_password
from app.database.session import SessionLocal
from app.users import repository as user_repository
from app.users.models import User, UserRole

SEED_DIR = BACKEND_DIR / "data" / "seeds"
USERS_SEED_FILE = "users.json"
BUSINESSES_SEED_FILE = "businesses.json"
PRODUCTS_SEED_FILE = "products.json"


class SeedUser(BaseModel):
    """Validated shape of one record in ``data/seeds/users.json``."""

    model_config = ConfigDict(extra="forbid")

    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    full_name: str = Field(min_length=2, max_length=120)
    role: UserRole = UserRole.CUSTOMER
    is_active: bool = True

    @field_validator("full_name")
    @classmethod
    def strip_full_name(cls, value: str) -> str:
        value = value.strip()
        if len(value) < 2:
            raise ValueError("Full name must be at least 2 characters.")
        return value


class SeedBusiness(BaseModel):
    """Validated shape of one record in ``data/seeds/businesses.json``."""

    model_config = ConfigDict(extra="forbid")

    owner_email: EmailStr
    name: str = Field(min_length=2, max_length=120)
    slug: str = Field(
        min_length=2,
        max_length=140,
        pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$",
    )
    description: str = ""
    category: BusinessCategory = BusinessCategory.RESTAURANT
    status: BusinessStatus = BusinessStatus.APPROVED
    address: str = Field(default="", max_length=255)
    phone: str | None = Field(default=None, max_length=40)
    email: EmailStr | None = None
    country_code: str = Field(default="IE", pattern=r"^[A-Z]{2}$")
    country_name: str = Field(default="Ireland", min_length=2, max_length=80)
    city: str = Field(default="Dublin", min_length=2, max_length=80)
    rating: float = Field(default=4.5, ge=0, le=5)
    delivery_fee_cents: int = Field(default=0, ge=0)
    delivery_time_minutes: int = Field(default=30, ge=1)
    is_active: bool = True


class SeedProduct(BaseModel):
    """Validated shape of one record in ``data/seeds/products.json``."""

    model_config = ConfigDict(extra="forbid")

    business_slug: str = Field(min_length=2, max_length=140)
    name: str = Field(min_length=1, max_length=140)
    description: str = ""
    category: str = Field(default="general", max_length=64)
    price_cents: int = Field(ge=0)
    is_available: bool = True
    is_active: bool = True


_seed_users_adapter = TypeAdapter(list[SeedUser])
_seed_businesses_adapter = TypeAdapter(list[SeedBusiness])
_seed_products_adapter = TypeAdapter(list[SeedProduct])


def load_seed_records(filename: str) -> list[dict[str, Any]]:
    """Load a JSON array of records from the seed directory."""
    path = SEED_DIR / filename
    if not path.exists():
        raise FileNotFoundError(f"Seed file not found: {path}")

    records = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(records, list):
        raise ValueError(f"Seed file must contain a JSON array: {path}")

    return records


def _load_validated(
    filename: str,
    adapter: TypeAdapter[list[Any]],
    label: str,
) -> list[Any]:
    try:
        return adapter.validate_python(load_seed_records(filename))
    except ValidationError as exc:
        raise ValueError(f"Invalid {label} seed data in {SEED_DIR / filename}:\n{exc}") from exc


def load_seed_users(filename: str = USERS_SEED_FILE) -> list[SeedUser]:
    return _load_validated(filename, _seed_users_adapter, "user")


def load_seed_businesses(filename: str = BUSINESSES_SEED_FILE) -> list[SeedBusiness]:
    return _load_validated(filename, _seed_businesses_adapter, "business")


def load_seed_products(filename: str = PRODUCTS_SEED_FILE) -> list[SeedProduct]:
    return _load_validated(filename, _seed_products_adapter, "product")


def seed_users(
    db: Session,
    records: Sequence[SeedUser] | None = None,
) -> list[User]:
    """Create seed users that do not exist yet. Safe to run repeatedly."""
    seed_records = list(records) if records is not None else load_seed_users()
    created: list[User] = []
    seen_emails: set[str] = set()

    for record in seed_records:
        email = str(record.email).strip().lower()
        if email in seen_emails:
            continue
        seen_emails.add(email)

        if user_repository.get_by_email(db, email) is not None:
            continue

        user = User(
            email=email,
            full_name=record.full_name,
            hashed_password=hash_password(record.password),
            role=record.role.value,
            is_active=record.is_active,
        )
        db.add(user)
        created.append(user)

    db.commit()

    for user in created:
        db.refresh(user)

    return created


def seed_businesses(
    db: Session,
    records: Sequence[SeedBusiness] | None = None,
) -> list[Business]:
    """Create seed businesses that do not exist yet. Safe to run repeatedly."""
    seed_records = list(records) if records is not None else load_seed_businesses()
    created: list[Business] = []
    seen_slugs: set[str] = set()

    for record in seed_records:
        if record.slug in seen_slugs:
            continue
        seen_slugs.add(record.slug)

        if get_by_slug(db, record.slug) is not None:
            continue

        owner = user_repository.get_by_email(db, str(record.owner_email).strip().lower())
        if owner is None:
            raise ValueError(
                f"Business '{record.slug}' references an unknown owner: "
                f"{record.owner_email}. Seed users first."
            )

        business = Business(
            owner_id=owner.id,
            name=record.name,
            slug=record.slug,
            description=record.description,
            category=record.category.value,
            status=record.status.value,
            address=record.address,
            phone=record.phone,
            email=str(record.email) if record.email else None,
            country_code=record.country_code,
            country_name=record.country_name,
            city=record.city,
            rating=record.rating,
            delivery_fee_cents=record.delivery_fee_cents,
            delivery_time_minutes=record.delivery_time_minutes,
            is_active=record.is_active,
        )
        db.add(business)
        created.append(business)

    db.commit()

    for business in created:
        db.refresh(business)

    return created


def seed_products(
    db: Session,
    records: Sequence[SeedProduct] | None = None,
) -> list[Product]:
    """Create seed products that do not exist yet. Safe to run repeatedly."""
    seed_records = list(records) if records is not None else load_seed_products()
    created: list[Product] = []
    seen_keys: set[tuple[str, str]] = set()

    for record in seed_records:
        key = (record.business_slug, record.name)
        if key in seen_keys:
            continue
        seen_keys.add(key)

        business = get_by_slug(db, record.business_slug)
        if business is None:
            raise ValueError(
                f"Product '{record.name}' references an unknown business: "
                f"{record.business_slug}. Seed businesses first."
            )

        if (
            get_by_business_and_name(
                db,
                business_id=business.id,
                name=record.name,
            )
            is not None
        ):
            continue

        product = Product(
            business_id=business.id,
            name=record.name,
            description=record.description,
            category=record.category,
            price_cents=record.price_cents,
            is_available=record.is_available,
            is_active=record.is_active,
        )
        db.add(product)
        created.append(product)

    db.commit()

    for product in created:
        db.refresh(product)

    return created


def seed_all(db: Session) -> dict[str, int]:
    """Run every dataset seeder in dependency order."""
    return {
        "users": len(seed_users(db)),
        "businesses": len(seed_businesses(db)),
        "products": len(seed_products(db)),
    }


def main() -> None:
    with SessionLocal() as db:
        results = seed_all(db)

    print(f"Seed files loaded from {SEED_DIR}")
    for dataset, created in results.items():
        print(f"  {dataset}: {created} new record(s)")


if __name__ == "__main__":
    main()
