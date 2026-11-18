from fastapi import status

from app.core.exceptions import AppError


class BusinessNotFoundError(AppError):
    status_code = status.HTTP_404_NOT_FOUND
    code = "BUSINESS_NOT_FOUND"

    def __init__(self, message: str = "Business not found.") -> None:
        super().__init__(message)
