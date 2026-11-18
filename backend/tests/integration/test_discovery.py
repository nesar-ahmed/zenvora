from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.database.seed import seed_all


def test_locations_are_built_from_approved_businesses(
    client: TestClient,
    db_session: Session,
) -> None:
    seed_all(db_session)

    response = client.get("/api/v1/locations")

    assert response.status_code == 200
    locations = {country["code"]: country for country in response.json()}
    assert set(locations) == {"IE", "GB", "DE"}
    assert locations["IE"]["name"] == "Ireland"
    assert set(locations["IE"]["cities"]) == {"Dublin", "Cork"}
    assert locations["GB"]["cities"] == ["London", "Manchester"]
    assert locations["DE"]["cities"] == ["Berlin"]


def test_product_feed_filters_by_city(
    client: TestClient,
    db_session: Session,
) -> None:
    seed_all(db_session)

    response = client.get(
        "/api/v1/products",
        params={"country_code": "IE", "city": "Dublin", "limit": 100},
    )

    assert response.status_code == 200
    products = response.json()
    assert len(products) == 16
    assert {product["business_city"] for product in products} == {"Dublin"}
    assert all(product["business_country_code"] == "IE" for product in products)


def test_product_feed_supports_search_category_and_price_filters(
    client: TestClient,
    db_session: Session,
) -> None:
    seed_all(db_session)

    ramen = client.get(
        "/api/v1/products",
        params={"q": "ramen"},
    )
    assert ramen.status_code == 200
    assert [product["name"] for product in ramen.json()] == ["Tonkotsu Ramen"]

    pizza = client.get(
        "/api/v1/products",
        params={"category": "Pizza"},
    )
    assert pizza.status_code == 200
    assert {product["category"] for product in pizza.json()} == {"Pizza"}
    assert len(pizza.json()) == 3

    cheap = client.get("/api/v1/products", params={"max_price": 300})
    assert cheap.status_code == 200
    assert all(product["price_cents"] <= 300 for product in cheap.json())
    assert {product["name"] for product in cheap.json()} == {
        "Organic Bananas",
        "Ayran",
    }


def test_product_feed_sorting(
    client: TestClient,
    db_session: Session,
) -> None:
    seed_all(db_session)

    cheapest = client.get(
        "/api/v1/products",
        params={"sort": "price_asc", "limit": 100},
    )
    assert cheapest.status_code == 200
    prices = [product["price_cents"] for product in cheapest.json()]
    assert prices == sorted(prices)

    top_rated = client.get(
        "/api/v1/products",
        params={"sort": "rating_desc", "limit": 100},
    )
    assert top_rated.status_code == 200
    ratings = [product["business_rating"] for product in top_rated.json()]
    assert ratings == sorted(ratings, reverse=True)


def test_product_categories_are_scoped_by_location(
    client: TestClient,
    db_session: Session,
) -> None:
    seed_all(db_session)

    berlin = client.get(
        "/api/v1/products/categories",
        params={"country_code": "DE", "city": "Berlin"},
    )
    assert berlin.status_code == 200
    assert {"Doner", "Healthy", "Desserts", "Drinks"} <= set(berlin.json())

    dublin = client.get(
        "/api/v1/products/categories",
        params={"country_code": "IE", "city": "Dublin"},
    )
    assert dublin.status_code == 200
    assert "Doner" not in dublin.json()
    assert "Pizza" in dublin.json()
