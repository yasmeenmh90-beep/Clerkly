import logging

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.agents.paperwork_watch_agent import (
    generate_watch_summary,
)
from app.auth_dependencies import get_current_user
from app.database import get_db
from app.models.paperwork_watch import (
    PaperworkWatchSummary,
)
from app.models.user_record import UserRecord
from app.services.paperwork_watch_service import (
    scan_user_paperwork,
)


logger = logging.getLogger(__name__)


router = APIRouter(
    prefix="/paperwork-watch",
    tags=["Paperwork Watch"],
)


@router.post(
    "/run",
    response_model=PaperworkWatchSummary,
)
def run_paperwork_watch(
    database: Session = Depends(get_db),
    current_user: UserRecord = Depends(
        get_current_user
    ),
) -> PaperworkWatchSummary:
    scan = scan_user_paperwork(
        database=database,
        owner_id=current_user.user_id,
    )

    summary, generated_by = generate_watch_summary(
        scan.alerts
    )

    database.commit()

    logger.info(
        "Paperwork Watch checked %s tasks for user %s "
        "and created %s notifications",
        scan.checked_tasks,
        current_user.user_id,
        scan.notifications_created,
    )

    return PaperworkWatchSummary(
        checked_tasks=scan.checked_tasks,
        attention_required=len(scan.alerts),
        notifications_created=(
            scan.notifications_created
        ),
        generated_by=generated_by,
        summary=summary,
        alerts=scan.alerts,
    )