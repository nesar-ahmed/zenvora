from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.dependencies import CurrentUser
from app.users import service
from app.users.schemas import (
    TokenResponse,
    UserLoginRequest,
    UserProfileUpdateRequest,
    UserRegisterRequest,
    UserResponse,
)

router = APIRouter(prefix="/users", tags=["users"])


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a customer account",
)
def register(
    payload: UserRegisterRequest,
    db: Annotated[Session, Depends(get_db)],
) -> UserResponse:
    user = service.register_user(
        db,
        email=str(payload.email),
        password=payload.password,
        full_name=payload.full_name,
    )
    return UserResponse.model_validate(user)


@router.post("/login", response_model=TokenResponse, summary="Log in")
def login(
    payload: UserLoginRequest,
    db: Annotated[Session, Depends(get_db)],
) -> TokenResponse:
    return service.login_user(
        db,
        email=str(payload.email),
        password=payload.password,
    )


@router.get("/me", response_model=UserResponse, summary="Get the current profile")
def get_profile(current_user: CurrentUser) -> UserResponse:
    return UserResponse.model_validate(current_user)


@router.patch(
    "/me",
    response_model=UserResponse,
    summary="Update the current profile",
)
def update_profile(
    payload: UserProfileUpdateRequest,
    current_user: CurrentUser,
    db: Annotated[Session, Depends(get_db)],
) -> UserResponse:
    user = service.update_profile(
        db,
        current_user,
        full_name=payload.full_name,
    )
    return UserResponse.model_validate(user)
