from unittest.mock import patch

from app.services.execution_service import TaskExecutionError



def sample_task_payload(
    task_id: str = "test_task_001",
) -> dict:
    return {
        "task_id": task_id,
        "title": "Renew vehicle registration",
        "description": "Test renewal task",
        "source": "manual",
        "status": "awaiting_approval",
        "deadline": "2026-09-01",
        "required_action": "Complete registration renewal",
        "requires_signature": False,
        "requires_payment": True,
        "payment_amount": 350,
        "currency": "AED",
        "approval_required": True,
    }


def test_create_and_get_task(authenticated_client):
    response = authenticated_client.post(
        "/tasks/",
        json=sample_task_payload(),
    )

    assert response.status_code == 201
    assert response.json()["task_id"] == "test_task_001"
    assert response.json()["status"] == "awaiting_approval"

    response = authenticated_client.get(
        "/tasks/test_task_001"
    )

    assert response.status_code == 200
    assert response.json()["title"] == "Renew vehicle registration"


def test_duplicate_task_id_returns_409(authenticated_client):
    payload = sample_task_payload()

    first_response = authenticated_client.post(
        "/tasks/",
        json=payload,
    )

    second_response = authenticated_client.post(
        "/tasks/",
        json=payload,
    )

    assert first_response.status_code == 201
    assert second_response.status_code == 409
    assert second_response.json() == {
        "detail": "Task ID already exists"
    }


def test_approval_and_execution_flow(authenticated_client):
    authenticated_client.post(
        "/tasks/",
        json=sample_task_payload(),
    )

    approval_response = authenticated_client.post(
        "/tasks/test_task_001/approve"
    )

    assert approval_response.status_code == 200
    assert approval_response.json()["status"] == "approved"
    assert approval_response.json()["approval_required"] is False

    execution_response = authenticated_client.post(
        "/tasks/test_task_001/execute"
    )

    assert execution_response.status_code == 200
    assert execution_response.json()["status"] == "completed"


def test_rejection_flow(authenticated_client):
    authenticated_client.post(
        "/tasks/",
        json=sample_task_payload(),
    )

    response = authenticated_client.post(
        "/tasks/test_task_001/reject"
    )

    assert response.status_code == 200
    assert response.json()["status"] == "rejected"
    assert response.json()["approval_required"] is False


def test_execute_without_approval_returns_400(authenticated_client):
    authenticated_client.post(
        "/tasks/",
        json=sample_task_payload(),
    )

    response = authenticated_client.post(
        "/tasks/test_task_001/execute"
    )

    assert response.status_code == 400
    assert response.json() == {
        "detail": "Task must be approved before execution"
    }


def test_reject_completed_task_returns_400(authenticated_client):
    authenticated_client.post(
        "/tasks/",
        json=sample_task_payload(),
    )

    authenticated_client.post(
        "/tasks/test_task_001/approve"
    )

    authenticated_client.post(
        "/tasks/test_task_001/execute"
    )

    response = authenticated_client.post(
        "/tasks/test_task_001/reject"
    )

    assert response.status_code == 400
    assert response.json() == {
        "detail": "Task is not awaiting approval"
    }


def test_missing_task_returns_404(authenticated_client):
    response = authenticated_client.get(
        "/tasks/does_not_exist"
    )

    assert response.status_code == 404
    assert response.json() == {
        "detail": "Task not found"
    }


def test_audit_history(authenticated_client):
    authenticated_client.post(
        "/tasks/",
        json=sample_task_payload(),
    )

    authenticated_client.post(
        "/tasks/test_task_001/approve"
    )

    authenticated_client.post(
        "/tasks/test_task_001/execute"
    )

    response = authenticated_client.get(
        "/tasks/test_task_001/history"
    )

    assert response.status_code == 200

    events = response.json()

    assert len(events) == 4

    assert events[0]["event_type"] == "task_created"
    assert events[0]["new_status"] == "awaiting_approval"

    assert events[1]["event_type"] == "task_approved"
    assert events[1]["previous_status"] == "awaiting_approval"
    assert events[1]["new_status"] == "approved"

    assert events[2]["event_type"] == "execution_started"
    assert events[2]["previous_status"] == "approved"
    assert events[2]["new_status"] == "in_progress"

    assert events[3]["event_type"] == "execution_completed"
    assert events[3]["previous_status"] == "in_progress"
    assert events[3]["new_status"] == "completed"


def test_task_filtering(authenticated_client):
    task_data = {
        "task_id": "filter_task_001",
        "title": "Filtered payment task",
        "description": "Task used for filter testing",
        "source": "manual",
        "status": "pending",
        "deadline": "2026-10-15",
        "required_action": "Complete payment",
        "requires_signature": False,
        "requires_payment": True,
        "payment_amount": 100,
        "currency": "AED",
        "approval_required": False,
    }

    create_response = authenticated_client.post(
        "/tasks/",
        json=task_data,
    )

    assert create_response.status_code == 201

    response = authenticated_client.get(
        "/tasks/",
        params={
            "status": "pending",
            "source": "manual",
            "deadline": "2026-10-15",
            "requires_payment": True,
        },
    )

    assert response.status_code == 200

    tasks = response.json()

    assert len(tasks) == 1
    assert tasks[0]["task_id"] == "filter_task_001"
    assert tasks[0]["status"] == "pending"
    assert tasks[0]["source"] == "manual"
    assert tasks[0]["deadline"] == "2026-10-15"
    assert tasks[0]["requires_payment"] is True

def test_task_pagination(authenticated_client):
    for number in range(1, 4):
        response = authenticated_client.post(
            "/tasks/",
            json={
                "task_id": f"pagination_task_{number:03}",
                "title": f"Pagination task {number}",
                "description": "Task used for pagination testing",
                "source": "manual",
                "status": "pending",
                "deadline": None,
                "required_action": None,
                "requires_signature": False,
                "requires_payment": False,
                "payment_amount": None,
                "currency": None,
                "approval_required": False,
            },
        )

        assert response.status_code == 201

    first_page = authenticated_client.get(
        "/tasks/",
        params={
            "source": "manual",
            "page": 1,
            "page_size": 2,
        },
    )

    assert first_page.status_code == 200
    assert len(first_page.json()) == 2

    assert first_page.headers["X-Total-Count"] == "3"
    assert first_page.headers["X-Total-Pages"] == "2"
    assert first_page.headers["X-Current-Page"] == "1"
    assert first_page.headers["X-Page-Size"] == "2"

    second_page = authenticated_client.get(
        "/tasks/",
        params={
            "source": "manual",
            "page": 2,
            "page_size": 2,
        },
    )

    assert second_page.status_code == 200
    assert len(second_page.json()) == 1
    assert second_page.json()[0]["task_id"] == "pagination_task_003"


def test_execution_failure_records_failed_status(authenticated_client):
    task_data = {
        "task_id": "execution_failure_001",
        "title": "Execution failure test",
        "description": "Task used to test execution failure",
        "source": "manual",
        "status": "awaiting_approval",
        "deadline": None,
        "required_action": "Perform external action",
        "requires_signature": False,
        "requires_payment": False,
        "payment_amount": None,
        "currency": None,
        "approval_required": True,
    }

    create_response = authenticated_client.post(
        "/tasks/",
        json=task_data,
    )
    assert create_response.status_code == 201

    approve_response = authenticated_client.post(
        "/tasks/execution_failure_001/approve"
    )
    assert approve_response.status_code == 200

    with patch(
        "app.api.tasks.execute_task_action",
        side_effect=TaskExecutionError(
            "External execution service unavailable"
        ),
    ):
        execute_response = authenticated_client.post(
            "/tasks/execution_failure_001/execute"
        )

    assert execute_response.status_code == 500
    assert execute_response.json() == {
        "detail": "Task execution failed"
    }

    task_response = authenticated_client.get(
        "/tasks/execution_failure_001"
    )

    assert task_response.status_code == 200
    assert task_response.json()["status"] == "failed"

    history_response = authenticated_client.get(
        "/tasks/execution_failure_001/history"
    )

    assert history_response.status_code == 200

    event_types = [
        event["event_type"]
        for event in history_response.json()
    ]

    assert "execution_started" in event_types
    assert "execution_failed" in event_types

    failed_event = history_response.json()[-1]

    assert failed_event["previous_status"] == "in_progress"
    assert failed_event["new_status"] == "failed"
    assert (
        failed_event["message"]
        == "External execution service unavailable"
    )


def test_users_cannot_access_each_others_tasks(client):
    def register_and_login(
        email: str,
        password: str,
        full_name: str,
    ) -> dict[str, str]:
        register_response = client.post(
            "/auth/register",
            json={
                "email": email,
                "password": password,
                "full_name": full_name,
            },
        )

        assert register_response.status_code == 201

        login_response = client.post(
            "/auth/token",
            data={
                "username": email,
                "password": password,
            },
        )

        assert login_response.status_code == 200

        token = login_response.json()["access_token"]

        return {
            "Authorization": f"Bearer {token}",
        }

    first_user_headers = register_and_login(
        email="first-owner@example.com",
        password="FirstPassword123!",
        full_name="First Owner",
    )

    second_user_headers = register_and_login(
        email="second-owner@example.com",
        password="SecondPassword123!",
        full_name="Second Owner",
    )

    create_response = client.post(
        "/tasks/",
        json=sample_task_payload(
            task_id="private_task_001",
        ),
        headers=first_user_headers,
    )

    assert create_response.status_code == 201

    first_user_response = client.get(
        "/tasks/private_task_001",
        headers=first_user_headers,
    )

    assert first_user_response.status_code == 200

    second_user_list = client.get(
        "/tasks/",
        headers=second_user_headers,
    )

    assert second_user_list.status_code == 200
    assert second_user_list.json() == []

    second_user_get = client.get(
        "/tasks/private_task_001",
        headers=second_user_headers,
    )

    assert second_user_get.status_code == 404
    assert second_user_get.json() == {
        "detail": "Task not found"
    }

    second_user_approve = client.post(
        "/tasks/private_task_001/approve",
        headers=second_user_headers,
    )

    assert second_user_approve.status_code == 404

    second_user_history = client.get(
        "/tasks/private_task_001/history",
        headers=second_user_headers,
    )

    assert second_user_history.status_code == 404