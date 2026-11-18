from fastapi import APIRouter

from app.businesses.router import router as businesses_router
from app.catalog.router import router as products_router
from app.health.router import router as health_router
from app.locations.router import router as locations_router
from app.users.router import router as users_router

api_router = APIRouter()
api_router.include_router(health_router, tags=["health"])
api_router.include_router(users_router)
api_router.include_router(locations_router)
api_router.include_router(businesses_router)
api_router.include_router(products_router)
