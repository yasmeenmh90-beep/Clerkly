import logging
from pathlib import Path

from botocore.exceptions import BotoCoreError, ClientError
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.auth_dependencies import (
    CurrentOrganization,
    get_current_organization,
    get_current_user,
)
from app.config import BASE_DIR, settings
from app.database import get_db
from app.models.task import Task
from app.models.task_record import TaskRecord
from app.models.user_record import UserRecord
from app.services.audit_service import record_task_event
from app.services.document_text_service import extract_text_from_file
from app.services.intake_service import extract_task_from_document

logger = logging.getLogger(__name__)


MAX_UPLOAD_SIZE = settings.max_upload_size_bytes

UPLOAD_STORAGE_DIR = BASE_DIR / "uploaded_documents"


ALLOWED_CONTENT_TYPES = {
    ".txt": {
        "text/plain",
        "application/octet-stream",
    },
    ".pdf": {
        "application/pdf",
        "application/octet-stream",
    },
    ".docx": {
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/octet-stream",
    },
}


router = APIRouter(
    prefix="/intake",
    tags=["Intake"],
)


def _save_original_file(
    task_id: str,
    filename: str,
    raw_content: bytes,
) -> str:
    task_folder = UPLOAD_STORAGE_DIR / task_id
    task_folder.mkdir(parents=True, exist_ok=True)

    file_path = task_folder / filename
    file_path.write_bytes(raw_content)

    return str(file_path)


@router.post(
    "/document",
    response_model=Task,
    status_code=201,
    responses={
        503: {
            "description": "Document analysis service unavailable",
        },
    },
)
async def intake_document(
    document: UploadFile = File(...),
    database: Session = Depends(get_db),
    current_user: UserRecord = Depends(get_current_user),
    current_organization: CurrentOrganization = Depends(
        get_current_organization
    ),
):
    if not document.filename:
        raise HTTPException(
            status_code=400,
            detail=(
                "Uploaded document exceeds the "
                f"{settings.max_upload_size_mb} MB size limit"
            ),
        )

    file_extension = Path(document.filename).suffix.lower()

    if file_extension not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=415,
            detail=(
                "Unsupported document type. "
                "Supported types are: .txt, .pdf and .docx"
            ),
        )

    allowed_types = ALLOWED_CONTENT_TYPES[file_extension]

    if document.content_type not in allowed_types:
        raise HTTPException(
            status_code=415,
            detail=f"Invalid content type for {file_extension} document",
        )

    raw_content = await document.read(MAX_UPLOAD_SIZE + 1)

    if not raw_content:
        raise HTTPException(
            status_code=400,
            detail="Uploaded document is empty",
        )

    if len(raw_content) > MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=413,
            detail="Uploaded document exceeds the 5 MB size limit",
        )

    content = extract_text_from_file(
        filename=document.filename,
        raw_content=raw_content,
    )

    try:
        task = extract_task_from_document(
            filename=document.filename,
            content=content,
        )

    except (BotoCoreError, ClientError) as error:
        logger.error(
            "Document analysis failed for %s: %s",
            document.filename,
            error,
        )

        raise HTTPException(
            status_code=503,
            detail=(
                "Document analysis service is temporarily unavailable. "
                "Please try again later."
            ),
            headers={
                "Retry-After": "60",
            },
        ) from error

    if file_extension in (".pdf", ".docx"):
        try:
            task.original_filename = document.filename
            task.original_file_path = _save_original_file(
                task_id=task.task_id,
                filename=document.filename,
                raw_content=raw_content,
            )
        except OSError as error:
            logger.warning(
                "Could not save original file for task %s: %s",
                task.task_id,
                error,
            )

    task_record = TaskRecord(
        owner_id=current_user.user_id,
        organization_id=(
            current_organization.organization.organization_id
        ),
        **task.model_dump(
            exclude={
                "owner_name",
                "owner_email",
                "approved_by_name",
                "approved_by_email",
            }
        ),
    )

    try:
        database.add(task_record)

        record_task_event(
            database=database,
            task_id=task_record.task_id,
            event_type="task_created",
            previous_status=None,
            new_status=task_record.status,
            message=f"Task created from document: {document.filename}",
        )

        database.commit()
        database.refresh(task_record)

    except IntegrityError as error:
        database.rollback()

        raise HTTPException(
            status_code=409,
            detail="Task ID already exists",
        ) from error

    return task_record