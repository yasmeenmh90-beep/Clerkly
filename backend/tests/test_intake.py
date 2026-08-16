from app.models.task import Task
from unittest.mock import patch

from botocore.exceptions import ClientError


def test_bedrock_failure_returns_503(authenticated_client):
    bedrock_error = ClientError(
        error_response={
            "Error": {
                "Code": "ValidationException",
                "Message": "Operation not allowed",
            }
        },
        operation_name="ConverseStream",
    )

    with patch(
        "app.api.intake.extract_task_from_document",
        side_effect=bedrock_error,
    ):
        response = authenticated_client.post(
            "/intake/document",
            files={
                "document": (
                    "sample_renewal.txt",
                    "A renewal fee of AED 350 is required.",
                    "text/plain",
                )
            },
        )

    assert response.status_code == 503

    assert response.json() == {
        "detail": (
            "Document analysis service is temporarily unavailable. "
            "Please try again later."
        )
    }

    assert response.headers["retry-after"] == "60"


def test_empty_document_returns_400(authenticated_client):
    response = authenticated_client.post(
        "/intake/document",
        files={
            "document": (
                "empty.txt",
                "",
                "text/plain",
            )
        },
    )

    assert response.status_code == 400
    assert response.json() == {
        "detail": "Uploaded document is empty"
    }


def test_non_utf8_document_returns_400(authenticated_client):
    response = authenticated_client.post(
        "/intake/document",
        files={
            "document": (
                "invalid.txt",
                b"\xff\xfe\x00\x00",
                "text/plain",
            )
        },
    )

    assert response.status_code == 400
    assert response.json() == {
    "detail": "Text document must use UTF-8 encoding"
}

def test_unsupported_document_type_returns_415(authenticated_client):
    response = authenticated_client.post(
        "/intake/document",
        files={
            "document": (
                "malware.exe",
                b"unsupported content",
                "application/octet-stream",
            )
        },
    )

    assert response.status_code == 415

    assert response.json() == {
        "detail": (
            "Unsupported document type. "
            "Supported types are: .txt, .pdf and .docx"
        )
    }


def test_oversized_document_returns_413(authenticated_client):
    oversized_content = b"x" * ((5 * 1024 * 1024) + 1)

    response = authenticated_client.post(
        "/intake/document",
        files={
            "document": (
                "large.txt",
                oversized_content,
                "text/plain",
            )
        },
    )

    assert response.status_code == 413
    assert response.json() == {
        "detail": "Uploaded document exceeds the 5 MB size limit"
    }


def test_invalid_content_type_returns_415(authenticated_client):
    response = authenticated_client.post(
        "/intake/document",
        files={
            "document": (
                "document.txt",
                b"Valid text content",
                "application/pdf",
            )
        },
    )

    assert response.status_code == 415
    assert response.json() == {
        "detail": "Invalid content type for .txt document"
    }

def test_successful_intake_persists_task_and_audit_event(
    authenticated_client,
):
    extracted_task = Task(
        task_id="document_task_001",
        title="Renew vehicle registration",
        description="Registration renewal notice detected.",
        source="document",
        status="awaiting_approval",
        deadline="2026-09-01",
        required_action="Complete registration renewal",
        requires_signature=False,
        requires_payment=True,
        payment_amount=350,
        currency="AED",
        approval_required=True,
    )

    with patch(
        "app.api.intake.extract_task_from_document",
        return_value=extracted_task,
    ):
        intake_response = authenticated_client.post(
            "/intake/document",
            files={
                "document": (
                    "renewal.txt",
                    "A renewal fee of AED 350 is required.",
                    "text/plain",
                )
            },
        )

    assert intake_response.status_code == 201
    assert intake_response.json()["task_id"] == (
        "document_task_001"
    )
    assert intake_response.json()["status"] == (
        "awaiting_approval"
    )

    task_response = authenticated_client.get(
        "/tasks/document_task_001"
    )

    assert task_response.status_code == 200
    assert task_response.json()["source"] == "document"

    history_response = authenticated_client.get(
        "/tasks/document_task_001/history"
    )

    assert history_response.status_code == 200

    events = history_response.json()

    assert len(events) == 1
    assert events[0]["event_type"] == "task_created"
    assert events[0]["previous_status"] is None
    assert events[0]["new_status"] == "awaiting_approval"
    assert events[0]["message"] == (
        "Task created from document: renewal.txt"
    )