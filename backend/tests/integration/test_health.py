from fastapi.testclient import TestClient


def test_health_endpoint_returns_service_status(client: TestClient) -> None:
    response = client.get("/api/v1/health")

    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "ok"
    assert payload["service"] == "Zenvora API"
    assert payload["version"] == "0.1.0"


def test_health_endpoint_is_documented(client: TestClient) -> None:
    response = client.get("/openapi.json")

    assert response.status_code == 200
    assert "/api/v1/health" in response.json()["paths"]
