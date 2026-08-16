from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.auth_dependencies import get_current_user
from app.database import get_db
from app.models.user import AccessToken, UserCreate, UserResponse
from app.models.user_record import UserRecord
from app.services.auth_service import (
    create_access_token,
    hash_password,
    verify_password,
)


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=201,
)
def register_user(
    user_data: UserCreate,
    database: Session = Depends(get_db),
):
    normalized_email = str(user_data.email).lower()

    statement = select(UserRecord).where(
        UserRecord.email == normalized_email
    )

    existing_user = database.scalar(statement)

    if existing_user is not None:
        raise HTTPException(
            status_code=409,
            detail="Email is already registered",
        )

    user = UserRecord(
        email=normalized_email,
        hashed_password=hash_password(
            user_data.password
        ),
        full_name=user_data.full_name,
    )

    try:
        database.add(user)
        database.commit()
        database.refresh(user)

    except IntegrityError as error:
        database.rollback()

        raise HTTPException(
            status_code=409,
            detail="Email is already registered",
        ) from error

    return user


@router.post(
    "/token",
    response_model=AccessToken,
)
def login_user(
    form_data: OAuth2PasswordRequestForm = Depends(),
    database: Session = Depends(get_db),
):
    normalized_email = form_data.username.lower()

    statement = select(UserRecord).where(
        UserRecord.email == normalized_email
    )

    user = database.scalar(statement)

    if user is None or not verify_password(
        form_data.password,
        user.hashed_password,
    ):
        raise HTTPException(
            status_code=401,
            detail="Incorrect email or password",
            headers={
                "WWW-Authenticate": "Bearer",
            },
        )

    if not user.is_active:
        raise HTTPException(
            status_code=403,
            detail="User account is inactive",
        )

    return AccessToken(
        access_token=create_access_token(
            user.user_id
        )
    )


@router.get(
    "/me",
    response_model=UserResponse,
)
def get_authenticated_user(
    current_user: UserRecord = Depends(
        get_current_user
    ),
):
    return current_user