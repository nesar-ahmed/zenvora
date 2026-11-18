from fastapi import APIRouter

from app.config import settings
from app.health.schemas import HealthResponse

router = APIRouter()


@router.get("/health", response_model=HealthResponse, summary="Service health check")
def health() -> HealthResponse:
    return HealthResponse(service=settings.app_name, version=settings.app_version)
