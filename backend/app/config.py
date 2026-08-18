import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv


BASE_DIR = Path(__file__).resolve().parent.parent

load_dotenv(BASE_DIR / ".env")


DEVELOPMENT_SECRET = (
    "development-only-secret-change-before-deployment"
)


def get_optional_environment_variable(
    variable_name: str,
) -> str | None:
    value = os.getenv(variable_name)

    if value is None:
        return None

    cleaned_value = value.strip()

    return cleaned_value or None


def get_positive_int(
    variable_name: str,
    default: int,
) -> int:
    raw_value = os.getenv(
        variable_name,
        str(default),
    )

    try:
        value = int(raw_value)
    except ValueError as error:
        raise RuntimeError(
            f"{variable_name} must be an integer"
        ) from error

    if value <= 0:
        raise RuntimeError(
            f"{variable_name} must be greater than zero"
        )

    return value


def get_float(
    variable_name: str,
    default: float,
) -> float:
    raw_value = os.getenv(
        variable_name,
        str(default),
    )

    try:
        return float(raw_value)
    except ValueError as error:
        raise RuntimeError(
            f"{variable_name} must be a number"
        ) from error


def get_cors_origins() -> tuple[str, ...]:
    raw_value = os.getenv(
        "CORS_ORIGINS",
        "http://localhost:3000,http://localhost:5173",
    )

    return tuple(
        origin.strip()
        for origin in raw_value.split(",")
        if origin.strip()
    )


@dataclass(frozen=True)
class Settings:
    app_name: str
    app_version: str
    app_environment: str

    database_url: str

    jwt_secret_key: str
    jwt_algorithm: str
    access_token_expire_minutes: int

    max_upload_size_mb: int

    bedrock_model_id: str
    bedrock_region: str
    bedrock_temperature: float

    stripe_secret_key: str | None
    stripe_webhook_secret: str | None

    frontend_url: str
    cors_origins: tuple[str, ...]

    log_level: str

    @property
    def max_upload_size_bytes(self) -> int:
        return self.max_upload_size_mb * 1024 * 1024

    @property
    def stripe_is_configured(self) -> bool:
        return self.stripe_secret_key is not None


def load_settings() -> Settings:
    environment = os.getenv(
        "APP_ENVIRONMENT",
        "development",
    ).lower()

    jwt_secret_key = os.getenv(
        "JWT_SECRET_KEY",
        DEVELOPMENT_SECRET,
    )

    if (
        environment == "production"
        and jwt_secret_key == DEVELOPMENT_SECRET
    ):
        raise RuntimeError(
            "JWT_SECRET_KEY must be configured in production"
        )

    return Settings(
        app_name=os.getenv(
            "APP_NAME",
            "Clerkly API",
        ),
        app_version=os.getenv(
            "APP_VERSION",
            "0.1.0",
        ),
        app_environment=environment,
        database_url=os.getenv(
            "DATABASE_URL",
            "sqlite:///./clerkly.db",
        ),
        jwt_secret_key=jwt_secret_key,
        jwt_algorithm=os.getenv(
            "JWT_ALGORITHM",
            "HS256",
        ),
        access_token_expire_minutes=get_positive_int(
            "ACCESS_TOKEN_EXPIRE_MINUTES",
            30,
        ),
        max_upload_size_mb=get_positive_int(
            "MAX_UPLOAD_SIZE_MB",
            5,
        ),
        bedrock_model_id=os.getenv(
            "BEDROCK_MODEL_ID",
            "us.amazon.nova-lite-v1:0",
        ),
        bedrock_region=os.getenv(
            "BEDROCK_REGION",
            "us-west-2",
        ),
        bedrock_temperature=get_float(
            "BEDROCK_TEMPERATURE",
            0.1,
        ),
        stripe_secret_key=(
            get_optional_environment_variable(
                "STRIPE_SECRET_KEY"
            )
        ),
        stripe_webhook_secret=(
            get_optional_environment_variable(
                "STRIPE_WEBHOOK_SECRET"
            )
        ),
        frontend_url=os.getenv(
            "FRONTEND_URL",
            "http://localhost:3000",
        ).rstrip("/"),
        cors_origins=get_cors_origins(),
        log_level=os.getenv(
            "LOG_LEVEL",
            "INFO",
        ).upper(),
    )


settings = load_settings()