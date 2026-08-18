from dataclasses import dataclass
from decimal import Decimal, ROUND_HALF_UP

import stripe

from app.config import settings
from app.models.task_record import TaskRecord


SUPPORTED_STRIPE_CURRENCIES = {
    "AED",
}


class PaymentServiceError(Exception):
    """Base error for payment-service failures."""


class PaymentProviderNotConfigured(PaymentServiceError):
    """Raised when Stripe is not configured."""


class InvalidPaymentTask(PaymentServiceError):
    """Raised when a task does not contain valid payment data."""


class PaymentProviderError(PaymentServiceError):
    """Raised when Stripe returns an error."""


@dataclass(frozen=True)
class CheckoutSessionResult:
    session_id: str
    checkout_url: str
    payment_status: str


def validate_payment_task(task: TaskRecord) -> None:
    if not task.requires_payment:
        raise InvalidPaymentTask(
            "Task does not require payment"
        )

    if task.status != "approved":
        raise InvalidPaymentTask(
            "Task must be approved before payment"
        )

    if task.payment_amount is None:
        raise InvalidPaymentTask(
            "Payment amount is required"
        )

    if task.payment_amount <= 0:
        raise InvalidPaymentTask(
            "Payment amount must be greater than zero"
        )

    if not task.currency:
        raise InvalidPaymentTask(
            "Payment currency is required"
        )

    currency = task.currency.upper()

    if currency not in SUPPORTED_STRIPE_CURRENCIES:
        raise InvalidPaymentTask(
            f"Currency {currency} is not supported"
        )


def amount_to_minor_units(amount: Decimal) -> int:
    """
    Convert AED into fils.

    Example:
    AED 450.00 becomes 45000 fils.
    """

    normalized_amount = Decimal(str(amount)).quantize(
        Decimal("0.01"),
        rounding=ROUND_HALF_UP,
    )

    return int(normalized_amount * 100)


def get_stripe_client() -> stripe.StripeClient:
    if not settings.stripe_secret_key:
        raise PaymentProviderNotConfigured(
            "Stripe payment provider is not configured"
        )

    return stripe.StripeClient(
        settings.stripe_secret_key
    )


def retrieve_checkout_session(
    session_id: str,
) -> CheckoutSessionResult:
    client = get_stripe_client()

    try:
        session = client.v1.checkout.sessions.retrieve(
            session_id
        )
    except stripe.StripeError as error:
        raise PaymentProviderError(
            "Unable to retrieve Stripe Checkout Session"
        ) from error

    if not session.url:
        raise PaymentProviderError(
            "Stripe Checkout Session does not have a URL"
        )

    return CheckoutSessionResult(
        session_id=session.id,
        checkout_url=session.url,
        payment_status=(
            session.payment_status or "unpaid"
        ),
    )


def create_checkout_session(
    task: TaskRecord,
) -> CheckoutSessionResult:
    """
    Create or retrieve one Stripe Sandbox Checkout Session
    for an approved Clerkly payment task.
    """

    validate_payment_task(task)

    if task.provider_session_id:
        return retrieve_checkout_session(
            task.provider_session_id
        )

    client = get_stripe_client()

    currency = task.currency.upper()
    amount = Decimal(str(task.payment_amount))
    amount_in_minor_units = amount_to_minor_units(amount)

    task_metadata = {
        "clerkly_task_id": task.task_id,
    }

    try:
        session = client.v1.checkout.sessions.create(
            {
                "mode": "payment",
                "success_url": (
                    f"{settings.frontend_url}/tasks"
                    f"?payment=success"
                    "&session_id={CHECKOUT_SESSION_ID}"
                ),
                "cancel_url": (
                    f"{settings.frontend_url}/tasks"
                    f"?payment=cancelled"
                    f"&task_id={task.task_id}"
                ),
                "line_items": [
                    {
                        "quantity": 1,
                        "price_data": {
                            "currency": currency.lower(),
                            "unit_amount": (
                                amount_in_minor_units
                            ),
                            "product_data": {
                                "name": task.title,
                            },
                        },
                    }
                ],
                "metadata": task_metadata,
                "payment_intent_data": {
                    "metadata": task_metadata,
                },
            },
            options={
                "idempotency_key": (
                    f"clerkly-checkout-{task.task_id}"
                ),
            },
        )
    except stripe.StripeError as error:
        raise PaymentProviderError(
            "Unable to create Stripe Checkout Session"
        ) from error

    if not session.url:
        raise PaymentProviderError(
            "Stripe Checkout Session does not have a URL"
        )

    return CheckoutSessionResult(
        session_id=session.id,
        checkout_url=session.url,
        payment_status=(
            session.payment_status or "unpaid"
        ),
    )