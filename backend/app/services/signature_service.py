import base64
import hashlib
import logging
import secrets
from datetime import datetime, timezone

import jwt
import requests
from docusign_esign import (
    ApiClient,
    Document,
    EnvelopeDefinition,
    EnvelopesApi,
    Recipients,
    SignHere,
    Signer,
    Tabs,
)
from sqlalchemy.orm import Session

from app.config import settings
from app.models.task_record import TaskRecord
from app.models.user_record import UserRecord
from app.services.audit_service import record_task_event


logger = logging.getLogger(__name__)

DOCUSIGN_SIGNATURE_SCOPE = "signature"

OAUTH_STATE_PURPOSE = "docusign_oauth_state"
OAUTH_STATE_EXPIRY_MINUTES = 10


class DocuSignNotConfigured(Exception):
    """Raised when DocuSign integration key/secret/account are
    not set, or the user hasn't connected DocuSign yet."""


class InvalidOAuthState(Exception):
    """Raised when the state token is missing, expired, or forged."""


class SignatureTaskError(Exception):
    """Raised when a task is not in a valid state to send for
    signature."""


def _require_docusign_configured() -> None:
    if not settings.docusign_is_configured:
        raise DocuSignNotConfigured(
            "DOCUSIGN_INTEGRATION_KEY, DOCUSIGN_SECRET_KEY, "
            "and DOCUSIGN_ACCOUNT_ID must be set to use "
            "signature intake"
        )


def _generate_code_verifier() -> str:
    return secrets.token_urlsafe(64)


def _code_challenge_from_verifier(code_verifier: str) -> str:
    digest = hashlib.sha256(
        code_verifier.encode("utf-8")
    ).digest()

    return (
        base64.urlsafe_b64encode(digest)
        .decode("utf-8")
        .rstrip("=")
    )


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
    _require_docusign_configured()

    code_verifier = _generate_code_verifier()
    code_challenge = _code_challenge_from_verifier(
        code_verifier
    )

    state = _create_state_token(user_id, code_verifier)

    return (
        f"https://{settings.docusign_auth_base_path}"
        "/oauth/auth"
        "?response_type=code"
        f"&scope={DOCUSIGN_SIGNATURE_SCOPE}"
        f"&client_id={settings.docusign_integration_key}"
        f"&redirect_uri={settings.docusign_redirect_uri}"
        f"&state={state}"
        f"&code_challenge={code_challenge}"
        "&code_challenge_method=S256"
    )


def _exchange_code_for_tokens(
    code: str,
    code_verifier: str,
) -> dict:
    credentials = (
        f"{settings.docusign_integration_key}:"
        f"{settings.docusign_secret_key}"
    )

    basic_auth = base64.b64encode(
        credentials.encode("utf-8")
    ).decode("utf-8")

    response = requests.post(
        f"https://{settings.docusign_auth_base_path}"
        "/oauth/token",
        headers={
            "Authorization": f"Basic {basic_auth}",
            "Content-Type": (
                "application/x-www-form-urlencoded"
            ),
        },
        data={
            "grant_type": "authorization_code",
            "code": code,
            "code_verifier": code_verifier,
        },
        timeout=15,
    )

    if not response.ok:
        logger.error(
            "DocuSign token exchange failed (%s): %s",
            response.status_code,
            response.text,
        )

    response.raise_for_status()

    return response.json()


def handle_oauth_callback(
    code: str,
    state: str,
    database: Session,
) -> UserRecord:
    user_id, code_verifier = _decode_state_token(state)

    user = database.get(UserRecord, user_id)

    if user is None:
        raise InvalidOAuthState(
            "No user found for this OAuth state token"
        )

    token_response = _exchange_code_for_tokens(
        code, code_verifier
    )

    expires_in_seconds = token_response.get(
        "expires_in", 0
    )

    user.docusign_access_token = token_response.get(
        "access_token"
    )
    user.docusign_refresh_token = token_response.get(
        "refresh_token",
        user.docusign_refresh_token,
    )
    user.docusign_token_expiry = datetime.fromtimestamp(
        datetime.now(timezone.utc).timestamp()
        + expires_in_seconds,
        tz=timezone.utc,
    )
    user.docusign_connected = True

    database.add(user)
    database.commit()
    database.refresh(user)

    return user


def _refresh_access_token(
    user: UserRecord,
    database: Session,
) -> None:
    credentials = (
        f"{settings.docusign_integration_key}:"
        f"{settings.docusign_secret_key}"
    )

    basic_auth = base64.b64encode(
        credentials.encode("utf-8")
    ).decode("utf-8")

    response = requests.post(
        f"https://{settings.docusign_auth_base_path}"
        "/oauth/token",
        headers={
            "Authorization": f"Basic {basic_auth}",
            "Content-Type": (
                "application/x-www-form-urlencoded"
            ),
        },
        data={
            "grant_type": "refresh_token",
            "refresh_token": user.docusign_refresh_token,
        },
        timeout=15,
    )

    if not response.ok:
        logger.error(
            "DocuSign token refresh failed (%s): %s",
            response.status_code,
            response.text,
        )

    response.raise_for_status()

    token_response = response.json()

    user.docusign_access_token = token_response.get(
        "access_token"
    )
    user.docusign_refresh_token = token_response.get(
        "refresh_token",
        user.docusign_refresh_token,
    )

    expires_in_seconds = token_response.get(
        "expires_in", 0
    )

    user.docusign_token_expiry = datetime.fromtimestamp(
        datetime.now(timezone.utc).timestamp()
        + expires_in_seconds,
        tz=timezone.utc,
    )

    database.add(user)
    database.commit()


def get_valid_access_token(
    user: UserRecord,
    database: Session,
) -> str:
    """
    Return a valid DocuSign access token for this user,
    refreshing it first if expired.
    """

    _require_docusign_configured()

    if (
        not user.docusign_connected
        or not user.docusign_refresh_token
    ):
        raise DocuSignNotConfigured(
            "This user has not connected DocuSign yet"
        )

    expiry = user.docusign_token_expiry

    # SQLite does not reliably preserve timezone info on
    # stored datetimes — a value saved as timezone-aware can
    # come back naive on read. Normalize before comparing, or
    # this raises "can't compare offset-naive and
    # offset-aware datetimes".
    if expiry is not None and expiry.tzinfo is None:
        expiry = expiry.replace(tzinfo=timezone.utc)

    is_expired = (
        expiry is None
        or expiry <= datetime.now(timezone.utc)
    )

    if is_expired:
        _refresh_access_token(user, database)

    return user.docusign_access_token


def _build_envelope_definition(
    task: TaskRecord,
    user: UserRecord,
) -> EnvelopeDefinition:
    document_text = (
        f"CLERKLY SIGNATURE REQUEST\n\n"
        f"Task: {task.title}\n\n"
        f"Description: {task.description or 'N/A'}\n\n"
        f"Required action: {task.required_action or 'N/A'}\n\n"
        "By signing below, you confirm this action has been "
        "reviewed and approved.\n\n\nSignature: "
    )

    document_base64 = base64.b64encode(
        document_text.encode("utf-8")
    ).decode("utf-8")

    document = Document(
        document_base64=document_base64,
        name=f"Clerkly Task {task.task_id}",
        file_extension="txt",
        document_id="1",
    )

    # task.owner_id is the user's internal UUID, not an email
    # address — DocuSign requires a real email here. Use the
    # actual user record instead.
    #
    # Deliberately NOT setting client_user_id: that field marks
    # a recipient as "embedded" in DocuSign's API, which
    # suppresses the email entirely and expects the app to
    # generate a signing URL directly instead. We want the
    # normal remote/email signing flow, so this stays unset.
    signer = Signer(
        email=user.email,
        name=user.full_name or user.email,
        recipient_id="1",
        routing_order="1",
    )

    sign_here = SignHere(
        document_id="1",
        page_number="1",
        recipient_id="1",
        tab_label="SignHereTab",
        x_position="200",
        y_position="300",
    )

    signer.tabs = Tabs(sign_here_tabs=[sign_here])

    return EnvelopeDefinition(
        email_subject=f"Please sign: {task.title}",
        documents=[document],
        recipients=Recipients(signers=[signer]),
        status="sent",
    )


def create_signature_envelope(
    task: TaskRecord,
    user: UserRecord,
    database: Session,
) -> str:
    if not task.requires_signature:
        raise SignatureTaskError(
            "This task does not require a signature"
        )

    if task.status != "approved":
        raise SignatureTaskError(
            "Only approved tasks can be sent for signature"
        )

    access_token = get_valid_access_token(user, database)

    api_client = ApiClient()
    api_client.host = settings.docusign_api_base_path
    api_client.set_default_header(
        "Authorization",
        f"Bearer {access_token}",
    )

    envelopes_api = EnvelopesApi(api_client)

    envelope_definition = _build_envelope_definition(task, user)

    results = envelopes_api.create_envelope(
        settings.docusign_account_id,
        envelope_definition=envelope_definition,
    )

    task.signature_provider = "docusign"
    task.signature_envelope_id = results.envelope_id
    task.signature_status = "sent"

    record_task_event(
        database=database,
        task_id=task.task_id,
        event_type="signature_requested",
        previous_status=task.status,
        new_status=task.status,
        message="DocuSign (sandbox) envelope sent for signature",
    )

    database.add(task)
    database.commit()
    database.refresh(task)

    return results.envelope_id


def handle_envelope_completed(
    database: Session,
    envelope_id: str,
    envelope_status: str,
) -> None:
    task = database.query(TaskRecord).filter(
        TaskRecord.signature_envelope_id == envelope_id
    ).first()

    if task is None:
        logger.warning(
            "No Clerkly task found for DocuSign envelope %s",
            envelope_id,
        )
        return

    if envelope_status not in {
        "completed",
        "declined",
        "voided",
    }:
        return

    status_map = {
        "completed": "signed",
        "declined": "declined",
        "voided": "voided",
    }

    task.signature_status = status_map[envelope_status]

    if envelope_status != "completed":
        record_task_event(
            database=database,
            task_id=task.task_id,
            event_type="signature_failed",
            previous_status=task.status,
            new_status=task.status,
            message=(
                f"DocuSign envelope {envelope_status}"
            ),
        )
        database.commit()
        return

    previous_task_status = task.status

    payment_satisfied = (
        not task.requires_payment
        or task.payment_status == "paid"
    )

    if payment_satisfied:
        task.status = "completed"
        task.approval_required = False
        new_status = "completed"
        message = "Signature confirmed and task completed"
    else:
        new_status = previous_task_status
        message = (
            "Signature confirmed; payment is still required"
        )

    record_task_event(
        database=database,
        task_id=task.task_id,
        event_type="signature_completed",
        previous_status=previous_task_status,
        new_status=new_status,
        message=message,
    )

    database.add(task)
    database.commit()

    logger.info(
        "DocuSign signature confirmed for task %s",
        task.task_id,
    )