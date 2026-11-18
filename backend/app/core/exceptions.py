from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse


class AppError(Exception):
    """Base error for predictable, client-facing application failures."""

    status_code = status.HTTP_400_BAD_REQUEST
    code = "APPLICATION_ERROR"
    headers: dict[str, str] | None = None

    def __init__(self, message: str = "Application error") -> None:
        self.message = message
        super().__init__(message)


class AuthenticationError(AppError):
    status_code = status.HTTP_401_UNAUTHORIZED
    code = "AUTHENTICATION_REQUIRED"
    headers = {"WWW-Authenticate": "Bearer"}

    def __init__(self, message: str = "Authentication is required.") -> None:
        super().__init__(message)


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppError)
    async def app_error_handler(_: Request, exc: AppError) -> JSONResponse:
        return JSONResponse(
            status_code=exc.status_code,
            content={"error": {"code": exc.code, "message": exc.message}},
            headers=exc.headers,
        )
