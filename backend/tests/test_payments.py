from unittest.mock import patch

from app.services.payment_service import (
    CheckoutSessionResult,
    PaymentProviderNotConfigured,
)


def payment_task_payload(
    task_id: str = "payment_task_001",
) -> dict:
    return {
        "task_id": task_id,
        "title": "Sandbox payment test",
        "description": "Task used to test Stripe Checkout",
        "source": "manual",
        "status": "awaiting_approval",
        "deadline": "2026-09-01",
        "required_action": "Complete sandbox checkout",
        "requires_signature": False,
        "requires_payment": True,
        "payment_amount": 450,
        "currency": "AED",
        "approval_required": True,
    }


def internal_task_payload(
    task_id: str = "non_payment_task_001",
) -> dict:
    return {
        "task_id": task_id,
        "title": "Review document",
        "description": "Internal task without payment",
        "source": "manual",
        "status": "awaiting_approval",
        "deadline": None,
        "required_action": "Review document",
        "requires_signature": False,
        "requires_payment": False,
        "payment_amount": None,
        "currency": None,
        "approval_required": True,
    }


@patch(
    "app.api.payments.create_checkout_session"
)
def test_checkout_session_is_created_and_reused(
    mock_create_checkout_session,
    authenticated_client,
):
    mock_create_checkout_session.return_value = (
        CheckoutSessionResult(
            session_id="cs_test_clerkly_001",
            checkout_url=(
                "https://checkout.stripe.com/"
                "c/pay/cs_test_clerkly_001"
            ),
            payment_status="unpaid",
        )
    )

    create_response = authenticated_client.post(
        "/tasks/",
        json=payment_task_payload(),
    )

    assert create_response.status_code == 201

    approval_response = authenticated_client.post(
        "/tasks/payment_task_001/approve"
    )

    assert approval_response.status_code == 200
    assert approval_response.json()["status"] == "approved"

    first_checkout_response = authenticated_client.post(
        "/tasks/payment_task_001/checkout-session"
    )

    assert first_checkout_response.status_code == 200
    assert first_checkout_response.json() == {
        "provider": "stripe",
        "session_id": "cs_test_clerkly_001",
        "checkout_url": (
            "https://checkout.stripe.com/"
            "c/pay/cs_test_clerkly_001"
        ),
        "payment_status": "unpaid",
    }

    task_response = authenticated_client.get(
        "/tasks/payment_task_001"
    )

    assert task_response.status_code == 200

    # Creating Checkout must not complete the task.
    assert task_response.json()["status"] == "approved"

    second_checkout_response = authenticated_client.post(
        "/tasks/payment_task_001/checkout-session"
    )

    assert second_checkout_response.status_code == 200
    assert (
        second_checkout_response.json()["session_id"]
        == "cs_test_clerkly_001"
    )

    history_response = authenticated_client.get(
        "/tasks/payment_task_001/history"
    )

    assert history_response.status_code == 200

    checkout_events = [
        event
        for event in history_response.json()
        if event["event_type"]
        == "payment_checkout_created"
    ]

    # Reusing the Checkout Session must not create
    # a duplicate audit event.
    assert len(checkout_events) == 1
    assert checkout_events[0]["previous_status"] == "approved"
    assert checkout_events[0]["new_status"] == "approved"

    assert mock_create_checkout_session.call_count == 2


def test_non_payment_task_cannot_create_checkout(
    authenticated_client,
):
    create_response = authenticated_client.post(
        "/tasks/",
        json=internal_task_payload(),
    )

    assert create_response.status_code == 201

    approval_response = authenticated_client.post(
        "/tasks/non_payment_task_001/approve"
    )

    assert approval_response.status_code == 200

    response = authenticated_client.post(
        "/tasks/non_payment_task_001/checkout-session"
    )

    assert response.status_code == 400
    assert response.json() == {
        "detail": "Task does not require payment"
    }


@patch(
    "app.api.payments.create_checkout_session"
)
def test_checkout_returns_503_when_provider_is_missing(
    mock_create_checkout_session,
    authenticated_client,
):
    mock_create_checkout_session.side_effect = (
        PaymentProviderNotConfigured(
            "Stripe payment provider is not configured"
        )
    )

    authenticated_client.post(
        "/tasks/",
        json=payment_task_payload(
            task_id="missing_provider_task_001"
        ),
    )

    authenticated_client.post(
        "/tasks/missing_provider_task_001/approve"
    )

    response = authenticated_client.post(
        (
            "/tasks/missing_provider_task_001/"
            "checkout-session"
        )
    )

    assert response.status_code == 503
    assert response.json() == {
        "detail": (
            "Stripe payment provider is not configured"
        )
    }