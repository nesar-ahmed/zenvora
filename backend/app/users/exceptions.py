from fastapi import status

from app.core.exceptions import AppError


class UserAlreadyExistsError(AppError):
    status_code = status.HTTP_409_CONFLICT
    code = "USER_ALREADY_EXISTS"

    def __init__(
        self,
        message: str = "An account with this email already exists.",
    ) -> None:
        super().__init__(message)


class InvalidCredentialsError(AppError):
    status_code = status.HTTP_401_UNAUTHORIZED
    code = "INVALID_CREDENTIALS"

    def __init__(self, message: str = "Invalid email or password.") -> None:
        super().__init__(message)


class InactiveUserError(AppError):
    status_code = status.HTTP_403_FORBIDDEN
    code = "USER_INACTIVE"

    def __init__(self, message: str = "This account is inactive.") -> None:
        super().__init__(message)
