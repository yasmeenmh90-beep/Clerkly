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

    google_client_id: str | None
    google_client_secret: str | None
    google_redirect_uri: str

    docusign_integration_key: str | None
    docusign_secret_key: str | None
    docusign_account_id: str | None
    docusign_redirect_uri: str
    docusign_auth_base_path: str
    docusign_api_base_path: str
    docusign_connect_hmac_key: str | None

    frontend_url: str
    cors_origins: tuple[str, ...]

    log_level: str

    @property
    def max_upload_size_bytes(self) -> int:
        return self.max_upload_size_mb * 1024 * 1024

    @property
    def stripe_is_configured(self) -> bool:
        return self.stripe_secret_key is not None

    @property
    def google_oauth_is_configured(self) -> bool:
        return (
            self.google_client_id is not None
            and self.google_client_secret is not None
        )

    @property
    def docusign_is_configured(self) -> bool:
        return (
            self.docusign_integration_key is not None
            and self.docusign_secret_key is not None
            and self.docusign_account_id is not None
        )


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
        google_client_id=(
            get_optional_environment_variable(
                "GOOGLE_CLIENT_ID"
            )
        ),
        google_client_secret=(
            get_optional_environment_variable(
                "GOOGLE_CLIENT_SECRET"
            )
        ),
        google_redirect_uri=os.getenv(
            "GOOGLE_REDIRECT_URI",
            "http://localhost:8000/intake/email/callback",
        ),
        docusign_integration_key=(
            get_optional_environment_variable(
                "DOCUSIGN_INTEGRATION_KEY"
            )
        ),
        docusign_secret_key=(
            get_optional_environment_variable(
                "DOCUSIGN_SECRET_KEY"
            )
        ),
        docusign_account_id=(
            get_optional_environment_variable(
                "DOCUSIGN_ACCOUNT_ID"
            )
        ),
        docusign_redirect_uri=os.getenv(
            "DOCUSIGN_REDIRECT_URI",
            "http://localhost:8000/intake/signature/callback",
        ),
        docusign_auth_base_path=os.getenv(
            "DOCUSIGN_AUTH_BASE_PATH",
            "account-d.docusign.com",
        ),
        docusign_api_base_path=os.getenv(
            "DOCUSIGN_API_BASE_PATH",
            "https://demo.docusign.net/restapi",
        ),
        # Set once you configure a Connect webhook in the
        # DocuSign eSignature Admin console (Settings > Connect).
        # Used to verify incoming webhook requests really came
        # from DocuSign, same purpose as STRIPE_WEBHOOK_SECRET.
        docusign_connect_hmac_key=(
            get_optional_environment_variable(
                "DOCUSIGN_CONNECT_HMAC_KEY"
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