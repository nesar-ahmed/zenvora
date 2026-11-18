from typing import Annotated

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.exceptions import AuthenticationError
from app.core.security import decode_access_token
from app.database.session import get_db
from app.users import repository as user_repository
from app.users.models import User

bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: Annotated[
        HTTPAuthorizationCredentials | None,
        Depends(bearer_scheme),
    ],
    db: Annotated[Session, Depends(get_db)],
) -> User:
    if credentials is None:
        raise AuthenticationError()

    user_id = decode_access_token(credentials.credentials)
    user = user_repository.get_by_id(db, user_id)
    if user is None or not user.is_active:
        raise AuthenticationError("Invalid or expired authentication token.")

    return user


CurrentUser = Annotated[User, Depends(get_current_user)]
