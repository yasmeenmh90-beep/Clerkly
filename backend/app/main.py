import logging
from datetime import date

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.paperwork_watch import (
    router as paperwork_watch_router,
)
from app.api.auth import router as auth_router
from app.api.intake import router as intake_router
from app.api.email_intake import router as email_intake_router
from app.api.signature_intake import (
    router as signature_intake_router,
)
from app.api.payments import (
    router as payments_router,
    webhook_router,
)
from app.api.tasks import router as tasks_router
from app.api.organizations import (
    router as organizations_router,
)
from app.config import settings
from app.database import SessionLocal
from app.models.organization_record import OrganizationRecord
from app.models.task_record import TaskRecord

logging.basicConfig(
    level=getattr(
        logging,
        settings.log_level,
        logging.INFO,
    ),
    format=(
        "%(asctime)s | %(levelname)s | "
        "%(name)s | %(message)s"
    ),
)


logger = logging.getLogger(__name__)


def seed_initial_task() -> None:
    database = SessionLocal()

    try:
        existing_task = database.get(
            TaskRecord,
            "task_001",
        )

        if existing_task is not None:
            return

        # Assign the seeded task to the legacy user's
        # organization if one exists (it will, for any database
        # that has run the Phase 1 organizations migration).
        # Falls back to None for a completely fresh database
        # with no users yet — same as this task's prior
        # behavior before organizations existed at all.
        legacy_organization = database.query(
            OrganizationRecord
        ).filter(
            OrganizationRecord.owner_id == "legacy-system-user"
        ).first()

        initial_task = TaskRecord(
            task_id="task_001",
            owner_id="legacy-system-user",
            organization_id=(
                legacy_organization.organization_id
                if legacy_organization
                else None
            ),
            title="Renew vehicle registration",
            description=(
                "Vehicle registration renewal notice detected."
            ),
            source="email",
            status="awaiting_approval",
            deadline=date(2026, 9, 1),
            required_action=(
                "Complete vehicle registration renewal"
            ),
            requires_signature=False,
            requires_payment=True,
            payment_amount=350,
            currency="AED",
            approval_required=True,
        )

        database.add(initial_task)
        database.commit()

        logger.info(
            "Created initial legacy task %s",
            initial_task.task_id,
        )

    except Exception:
        database.rollback()
        logger.exception(
            "Failed to seed the initial task"
        )
        raise

    finally:
        database.close()


seed_initial_task()


app = FastAPI(
    title=settings.app_name,
    description=(
        "Backend API for the Clerkly autonomous "
        "paperwork agent."
    ),
    version=settings.app_version,
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=list(settings.cors_origins),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_router)
app.include_router(organizations_router)
app.include_router(tasks_router)
app.include_router(intake_router)
app.include_router(email_intake_router)
app.include_router(signature_intake_router)
app.include_router(payments_router)
app.include_router(webhook_router)
app.include_router(paperwork_watch_router)

@app.get("/")
def root():
    return {
        "name": settings.app_name,
        "status": "running",
        "environment": settings.app_environment,
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
    }