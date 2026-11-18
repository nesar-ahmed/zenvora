from fastapi.testclient import TestClient
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.businesses.models import Business, BusinessStatus
from app.catalog.models import Product
from app.database.seed import seed_all


def test_list_businesses_returns_approved_seed_data(
    client: TestClient,
    db_session: Session,
) -> None:
    seed_all(db_session)

    response = client.get("/api/v1/businesses")

    assert response.status_code == 200
    businesses = response.json()
    assert len(businesses) == 12
    assert {business["slug"] for business in businesses} >= {
        "bellas-kitchen",
        "fresh-basket",
        "corner-and-co",
        "shoreditch-pizza-co",
        "berlin-doner-house",
    }

    dublin = client.get(
        "/api/v1/businesses",
        params={"country_code": "IE", "city": "Dublin"},
    )
    assert dublin.status_code == 200
    assert len(dublin.json()) == 5
    assert {business["city"] for business in dublin.json()} == {"Dublin"}

    filtered = client.get(
        "/api/v1/businesses",
        params={"category": "grocery"},
    )
    assert filtered.status_code == 200
    assert [business["slug"] for business in filtered.json()] == ["fresh-basket"]

    searched = client.get("/api/v1/businesses", params={"q": "basket"})
    assert searched.status_code == 200
    assert [business["slug"] for business in searched.json()] == ["fresh-basket"]


def test_business_detail_and_products(
    client: TestClient,
    db_session: Session,
) -> None:
    seed_all(db_session)

    detail = client.get("/api/v1/businesses/bellas-kitchen")
    assert detail.status_code == 200
    payload = detail.json()
    assert payload["name"] == "Bella's Kitchen"
    assert payload["category"] == "restaurant"
    assert payload["city"] == "Dublin"
    assert payload["country_code"] == "IE"
    assert payload["rating"] == 4.8
    assert payload["delivery_fee_cents"] == 199

    products = client.get("/api/v1/businesses/bellas-kitchen/products")
    assert products.status_code == 200
    product_payload = products.json()
    assert len(product_payload) == 4
    assert {product["name"] for product in product_payload} == {
        "Margherita Pizza",
        "Chicken Burger",
        "Caesar Salad",
        "Tiramisu",
    }
    assert all(isinstance(product["price_cents"], int) for product in product_payload)


def test_unapproved_business_is_hidden(
    client: TestClient,
    db_session: Session,
) -> None:
    seed_all(db_session)
    business = db_session.scalar(select(Business).where(Business.slug == "corner-and-co"))
    assert business is not None
    business.status = BusinessStatus.PENDING.value
    db_session.commit()

    listing = client.get("/api/v1/businesses")
    assert listing.status_code == 200
    assert len(listing.json()) == 11

    detail = client.get("/api/v1/businesses/corner-and-co")
    assert detail.status_code == 404
    assert detail.json()["error"]["code"] == "BUSINESS_NOT_FOUND"


def test_unavailable_product_is_hidden(
    client: TestClient,
    db_session: Session,
) -> None:
    seed_all(db_session)
    product = db_session.scalar(select(Product).where(Product.name == "Margherita Pizza"))
    assert product is not None
    product.is_available = False
    db_session.commit()

    response = client.get("/api/v1/businesses/bellas-kitchen/products")

    assert response.status_code == 200
    assert len(response.json()) == 3
    assert "Margherita Pizza" not in {item["name"] for item in response.json()}


def test_seed_all_is_idempotent(
    client: TestClient,
    db_session: Session,
) -> None:
    first_run = seed_all(db_session)
    assert first_run == {"users": 5, "businesses": 12, "products": 37}

    second_run = seed_all(db_session)
    assert second_run == {"users": 0, "businesses": 0, "products": 0}

    assert db_session.scalar(select(func.count()).select_from(Business)) == 12
    assert db_session.scalar(select(func.count()).select_from(Product)) == 37
