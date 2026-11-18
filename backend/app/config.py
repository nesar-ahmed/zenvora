from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    """Application settings loaded from ``backend/.env``.

    Values can also be overridden with ``ZENVORA_``-prefixed environment
    variables.
    """

    model_config = SettingsConfigDict(
        env_file=BACKEND_DIR / ".env",
        env_prefix="ZENVORA_",
        extra="ignore",
    )

    app_name: str = "Zenvora API"
    app_version: str = "0.1.0"
    environment: str = "development"
    debug: bool = False
    api_v1_prefix: str = "/api/v1"
    database_url: str = f"sqlite:///{(BACKEND_DIR / 'data' / 'zenvora.db').as_posix()}"
    cors_origins: list[str] = ["http://localhost:3000"]

    jwt_secret_key: str = "dev-only-change-me-use-a-long-random-secret"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
