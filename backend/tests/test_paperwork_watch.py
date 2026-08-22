from datetime import date
from unittest.mock import patch

from app.agents.paperwork_watch_agent import (
    create_fallback_summary,
)
from app.models.paperwork_watch import PaperworkAlert


def watch_task_payload(
    task_id: str = "watch_task_001",
    *,
    status: str = "awaiting_approval",
    deadline: str | None = None,
) -> dict:
    return {
        "task_id": task_id,
        "title": "Pay urgent electricity bill",
        "description": (
            "The electricity bill requires attention."
        ),
        "source": "manual",
        "status": status,
        "deadline": deadline or date.today().isoformat(),
        "required_action": (
            "Approve and pay the electricity bill"
        ),
        "requires_signature": False,
        "requires_payment": True,
        "payment_amount": 350,
        "currency": "AED",
        "approval_required": True,
    }


@patch(
    "app.api.paperwork_watch.generate_watch_summary"
)
def test_paperwork_watch_detects_urgent_task(
    mock_generate_summary,
    authenticated_client,
):
    mock_generate_summary.return_value = (
        "One urgent electricity bill requires attention.",
        "strands",
    )

    create_response = authenticated_client.post(
        "/tasks/",
        json=watch_task_payload(),
    )

    assert create_response.status_code == 201

    response = authenticated_client.post(
        "/paperwork-watch/run"
    )

    assert response.status_code == 200

    body = response.json()

    assert body["checked_tasks"] == 1
    assert body["attention_required"] == 1
    assert body["notifications_created"] == 1
    assert body["generated_by"] == "strands"
    assert body["summary"] == (
        "One urgent electricity bill requires attention."
    )

    assert len(body["alerts"]) == 1

    alert = body["alerts"][0]

    assert alert["task_id"] == "watch_task_001"
    assert alert["severity"] == "urgent"
    assert "due_today" in alert["reasons"]
    assert "approval_required" in alert["reasons"]
    assert "payment_required" not in alert["reasons"]

    mock_generate_summary.assert_called_once()


@patch(
    "app.api.paperwork_watch.generate_watch_summary"
)
def test_paperwork_watch_does_not_duplicate_reminder(
    mock_generate_summary,
    authenticated_client,
):
    mock_generate_summary.return_value = (
        "One task requires attention.",
        "deterministic_fallback",
    )

    create_response = authenticated_client.post(
        "/tasks/",
        json=watch_task_payload(
            task_id="duplicate_watch_task"
        ),
    )

    assert create_response.status_code == 201

    first_response = authenticated_client.post(
        "/paperwork-watch/run"
    )

    assert first_response.status_code == 200
    assert (
        first_response.json()["notifications_created"]
        == 1
    )

    second_response = authenticated_client.post(
        "/paperwork-watch/run"
    )

    assert second_response.status_code == 200
    assert (
        second_response.json()["notifications_created"]
        == 0
    )

    history_response = authenticated_client.get(
        "/tasks/duplicate_watch_task/history"
    )

    assert history_response.status_code == 200

    reminder_events = [
        event
        for event in history_response.json()
        if event["event_type"].startswith(
            "paperwork_watch_"
        )
    ]

    assert len(reminder_events) == 1


@patch(
    "app.api.paperwork_watch.generate_watch_summary"
)
def test_completed_and_rejected_tasks_are_ignored(
    mock_generate_summary,
    authenticated_client,
):
    mock_generate_summary.return_value = (
        "No unfinished paperwork requires attention.",
        "deterministic_fallback",
    )

    completed_response = authenticated_client.post(
        "/tasks/",
        json=watch_task_payload(
            task_id="completed_watch_task",
            status="completed",
        ),
    )

    rejected_response = authenticated_client.post(
        "/tasks/",
        json=watch_task_payload(
            task_id="rejected_watch_task",
            status="rejected",
        ),
    )

    assert completed_response.status_code == 201
    assert rejected_response.status_code == 201

    response = authenticated_client.post(
        "/paperwork-watch/run"
    )

    assert response.status_code == 200

    body = response.json()

    assert body["checked_tasks"] == 0
    assert body["attention_required"] == 0
    assert body["notifications_created"] == 0
    assert body["alerts"] == []


def test_fallback_summary_has_correct_grammar():
    alert = PaperworkAlert(
        task_id="fallback_task",
        title="Pay electricity bill",
        deadline=date.today(),
        days_remaining=0,
        severity="urgent",
        reasons=[
            "due_today",
            "payment_required",
        ],
        message=(
            "This task is due today. "
            "A payment is waiting."
        ),
    )

    summary = create_fallback_summary([alert])

    assert summary == (
        "1 urgent paperwork item requires your "
        "attention. Highest priority: "
        "Pay electricity bill. This task is due today. "
        "A payment is waiting."
    )


def test_paperwork_watch_requires_authentication(
    client,
):
    response = client.post("/paperwork-watch/run")

    assert response.status_code == 401