import logging
import smtplib
from email.mime.text import MIMEText

from app.config import settings


logger = logging.getLogger(__name__)


class NotificationNotConfigured(Exception):
    """Raised when SMTP settings are not set — mirrors the
    same pattern as DocuSignNotConfigured and Stripe's
    stripe_is_configured check."""


def send_paperwork_watch_email(
    to_email: str,
    summary: str,
) -> None:
    """
    Sends the Paperwork Watch Agent's summary to the given
    email address via plain SMTP. Raises
    NotificationNotConfigured if SMTP isn't set up, so the
    caller can return a clean 503, same as the DocuSign and
    Stripe "not configured" paths.
    """

    if not settings.smtp_is_configured:
        raise NotificationNotConfigured(
            "SMTP_HOST, SMTP_USERNAME, and SMTP_PASSWORD must "
            "be set to send paperwork watch email notifications"
        )

    message = MIMEText(summary)
    message["Subject"] = "Your Clerkly paperwork summary"
    message["From"] = (
        settings.smtp_from_email or settings.smtp_username
    )
    message["To"] = to_email

    with smtplib.SMTP(
        settings.smtp_host, settings.smtp_port
    ) as server:
        server.starttls()
        server.login(
            settings.smtp_username, settings.smtp_password
        )
        server.send_message(message)

    logger.info(
        "Sent paperwork watch summary email to %s", to_email
    )


def send_organization_invite_email(
    to_email: str,
    organization_name: str,
    invited_by_name: str,
    token: str,
) -> None:
    """
    Sends an organization invite email with a link the
    recipient can use to accept it. Same SMTP setup as the
    Paperwork Watch email — if it's not configured, the invite
    record still gets created (see organization_service.py),
    it just isn't automatically emailed.
    """

    if not settings.smtp_is_configured:
        raise NotificationNotConfigured(
            "SMTP_HOST, SMTP_USERNAME, and SMTP_PASSWORD must "
            "be set to send organization invite emails"
        )

    accept_url = (
        f"{settings.frontend_url}/invite/{token}"
    )

    body = (
        f"{invited_by_name} has invited you to join "
        f"\"{organization_name}\" on Clerkly.\n\n"
        f"Accept the invite here:\n{accept_url}\n\n"
        "This link expires in 7 days."
    )

    message = MIMEText(body)
    message["Subject"] = (
        f"You've been invited to join {organization_name} "
        "on Clerkly"
    )
    message["From"] = (
        settings.smtp_from_email or settings.smtp_username
    )
    message["To"] = to_email

    with smtplib.SMTP(
        settings.smtp_host, settings.smtp_port
    ) as server:
        server.starttls()
        server.login(
            settings.smtp_username, settings.smtp_password
        )
        server.send_message(message)

    logger.info(
        "Sent organization invite email to %s", to_email
    )
