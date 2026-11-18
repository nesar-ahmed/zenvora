from app.config import Settings


def test_settings_defaults() -> None:
    settings = Settings(_env_file=None)

    assert settings.app_name == "Zenvora API"
    assert settings.api_v1_prefix == "/api/v1"
    assert settings.environment == "development"
    assert settings.database_url.endswith("data/zenvora.db")


def test_settings_can_be_overridden() -> None:
    settings = Settings(
        _env_file=None,
        environment="test",
        api_v1_prefix="/api/v2",
        cors_origins=["http://localhost:4000"],
    )

    assert settings.environment == "test"
    assert settings.api_v1_prefix == "/api/v2"
    assert settings.cors_origins == ["http://localhost:4000"]
