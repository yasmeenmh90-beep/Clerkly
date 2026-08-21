import base64
import logging
import secrets
from datetime import datetime, timezone

import jwt
from google.auth.transport.requests import Request as GoogleRequest
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from sqlalchemy.orm import Session

from app.config import settings
from app.models.task import Task
from app.models.user_record import UserRecord
from app.services.intake_service import extract_task_from_document


logger = logging.getLogger(__name__)

GMAIL_READONLY_SCOPE = (
    "https://www.googleapis.com/auth/gmail.readonly"
)

# Short-lived, signed state token so the OAuth callback (a plain
# browser redirect, no Authorization header) can be tied back to
# the user who started the flow. It also now carries the PKCE
# code_verifier, since authorization_url() and fetch_token() run
# in two separate HTTP requests with no shared memory between
# them — nothing else survives across that gap.
OAUTH_STATE_PURPOSE = "gmail_oauth_state"
OAUTH_STATE_EXPIRY_MINUTES = 10


class GoogleOAuthNotConfigured(Exception):
    """Raised when GOOGLE_CLIENT_ID/SECRET are not set."""


class InvalidOAuthState(Exception):
    """Raised when the state token is missing, expired, or forged."""


def _require_google_oauth_configured() -> None:
    if not settings.google_oauth_is_configured:
        raise GoogleOAuthNotConfigured(
            "GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be "
            "set to use Gmail intake"
        )


def _build_flow() -> Flow:
    _require_google_oauth_configured()

    client_config = {
        "web": {
            "client_id": settings.google_client_id,
            "client_secret": settings.google_client_secret,
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "redirect_uris": [settings.google_redirect_uri],
        }
    }

    return Flow.from_client_config(
        client_config,
        scopes=[GMAIL_READONLY_SCOPE],
        redirect_uri=settings.google_redirect_uri,
    )


def _generate_code_verifier() -> str:
    # PKCE spec requires 43-128 characters from an unreserved
    # character set. token_urlsafe(64) produces ~86 characters,
    # comfortably inside that range.
    return secrets.token_urlsafe(64)


def _create_state_token(
    user_id: str,
    code_verifier: str,
) -> str:
    now = datetime.now(timezone.utc)

    payload = {
        "purpose": OAUTH_STATE_PURPOSE,
        "user_id": user_id,
        "code_verifier": code_verifier,
        "iat": now,
        "exp": now.timestamp() + (
            OAUTH_STATE_EXPIRY_MINUTES * 60
        ),
    }

    return jwt.encode(
        payload,
        settings.jwt_secret_key,
        algorithm=settings.jwt_algorithm,
    )


def _decode_state_token(state: str) -> tuple[str, str]:
    try:
        payload = jwt.decode(
            state,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm],
        )
    except jwt.PyJWTError as error:
        raise InvalidOAuthState(
            "OAuth state token is invalid or expired"
        ) from error

    if payload.get("purpose") != OAUTH_STATE_PURPOSE:
        raise InvalidOAuthState(
            "OAuth state token has the wrong purpose"
        )

    user_id = payload.get("user_id")
    code_verifier = payload.get("code_verifier")

    if not user_id or not code_verifier:
        raise InvalidOAuthState(
            "OAuth state token is missing required fields"
        )

    return user_id, code_verifier


def build_authorization_url(user_id: str) -> str:
    """
    Build the Google consent screen URL for the given user.
    The returned URL already has a signed state parameter
    embedded (including the PKCE code_verifier), so no separate
    server-side state storage is needed.
    """

    flow = _build_flow()

    code_verifier = _generate_code_verifier()

    # Setting this explicitly, rather than relying on the
    # library's own autogeneration, is what lets the same
    # verifier survive into handle_oauth_callback() below —
    # that function builds a brand new Flow object in a
    # completely separate HTTP request, so nothing generated
    # automatically here would otherwise be visible there.
    flow.code_verifier = code_verifier

    state = _create_state_token(user_id, code_verifier)

    authorization_url, _ = flow.authorization_url(
        access_type="offline",
        include_granted_scopes="true",
        prompt="consent",
        state=state,
    )

    return authorization_url


def handle_oauth_callback(
    code: str,
    state: str,
    database: Session,
) -> UserRecord:
    """
    Exchange the authorization code for tokens, verify the state
    token identifies a real user, and save the tokens to that
    user's record.
    """

    user_id, code_verifier = _decode_state_token(state)

    user = database.get(UserRecord, user_id)

    if user is None:
        raise InvalidOAuthState(
            "No user found for this OAuth state token"
        )

    flow = _build_flow()

    # Must match the verifier used when building the
    # authorization URL, or Google rejects the token exchange
    # with "Missing code verifier" / invalid_grant.
    flow.code_verifier = code_verifier

    flow.fetch_token(code=code)

    credentials = flow.credentials

    user.google_access_token = credentials.token
    user.google_refresh_token = (
        credentials.refresh_token or user.google_refresh_token
    )

    if credentials.expiry is not None:
        user.google_token_expiry = credentials.expiry.replace(
            tzinfo=timezone.utc
        )

    user.gmail_connected = True

    database.add(user)
    database.commit()
    database.refresh(user)

    return user


def _credentials_from_user(user: UserRecord) -> Credentials:
    return Credentials(
        token=user.google_access_token,
        refresh_token=user.google_refresh_token,
        token_uri="https://oauth2.googleapis.com/token",
        client_id=settings.google_client_id,
        client_secret=settings.google_client_secret,
        scopes=[GMAIL_READONLY_SCOPE],
    )


def get_valid_credentials(
    user: UserRecord,
    database: Session,
) -> Credentials:
    """
    Return valid Gmail API credentials for this user, refreshing
    the access token first if it has expired. Persists the
    refreshed token back to the user record.
    """

    _require_google_oauth_configured()

    if not user.gmail_connected or not user.google_refresh_token:
        raise GoogleOAuthNotConfigured(
            "This user has not connected Gmail yet"
        )

    credentials = _credentials_from_user(user)

    if credentials.expired or not credentials.valid:
        credentials.refresh(GoogleRequest())

        user.google_access_token = credentials.token

        if credentials.expiry is not None:
            user.google_token_expiry = (
                credentials.expiry.replace(tzinfo=timezone.utc)
            )

        database.add(user)
        database.commit()

    return credentials


def _decode_message_body(payload: dict) -> str:
    """
    Extract plain-text content from a Gmail message payload.
    Only reads text/plain parts — does not fetch or parse
    binary attachments in this first version.
    """

    if payload.get("mimeType") == "text/plain":
        body_data = payload.get("body", {}).get("data")

        if body_data:
            return base64.urlsafe_b64decode(
                body_data.encode("utf-8")
            ).decode("utf-8", errors="replace")

    for part in payload.get("parts", []):
        text = _decode_message_body(part)

        if text:
            return text

    return ""


def fetch_recent_email_documents(
    credentials: Credentials,
    max_results: int = 10,
) -> list[tuple[str, str]]:
    """
    Fetch recent Gmail messages and return them as
    (filename, content) pairs, ready to pass into
    extract_task_from_document(). Read-only — never modifies
    or sends anything in the user's mailbox.
    """

    service = build(
        "gmail",
        "v1",
        credentials=credentials,
        cache_discovery=False,
    )

    message_list = (
        service.users()
        .messages()
        .list(
            userId="me",
            maxResults=max_results,
            labelIds=["INBOX"],
        )
        .execute()
    )

    documents: list[tuple[str, str]] = []

    for message_summary in message_list.get("messages", []):
        message = (
            service.users()
            .messages()
            .get(
                userId="me",
                id=message_summary["id"],
                format="full",
            )
            .execute()
        )

        headers = {
            header["name"]: header["value"]
            for header in message["payload"].get("headers", [])
        }

        subject = headers.get("Subject", "(no subject)")
        body_text = _decode_message_body(message["payload"])

        if not body_text.strip():
            # Nothing readable in this message — skip it rather
            # than creating an empty/junk task.
            continue

        filename = f"email_{message_summary['id']}.txt"
        content = f"Subject: {subject}\n\n{body_text}"

        documents.append((filename, content))

    return documents


def sync_gmail_for_user(
    user: UserRecord,
    database: Session,
    max_results: int = 10,
) -> list[Task]:
    """
    Fetch recent emails for this user and run each one through
    the existing document intake pipeline (Document Analyzer ->
    Planner -> Task). Returns the list of created Task objects.
    Callers are responsible for persisting these Tasks the same
    way a document upload would be persisted.
    """

    credentials = get_valid_credentials(user, database)

    documents = fetch_recent_email_documents(
        credentials,
        max_results=max_results,
    )

    created_tasks: list[Task] = []

    for filename, content in documents:
        try:
            task = extract_task_from_document(filename, content)
            task.source = "email"
            created_tasks.append(task)
        except Exception as error:
            # One bad email should not stop the rest of the
            # sync from completing.
            logger.warning(
                "Failed to extract a task from %s: %s",
                filename,
                error,
            )

    return created_tasks