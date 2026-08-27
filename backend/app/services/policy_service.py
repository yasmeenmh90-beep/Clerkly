from datetime import datetime, timezone
from uuid import uuid4

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import settings
from app.models.policy_acceptance_record import (
    PolicyAcceptanceRecord,
)


def get_latest_acceptance(
    database: Session,
    user_id: str,
) -> PolicyAcceptanceRecord | None:
    statement = (
        select(PolicyAcceptanceRecord)
        .where(PolicyAcceptanceRecord.user_id == user_id)
        .order_by(
            PolicyAcceptanceRecord.accepted_at.desc()
        )
    )

    return database.scalar(statement)


def has_accepted_current_version(
    database: Session,
    user_id: str,
) -> bool:
    latest = get_latest_acceptance(database, user_id)

    if latest is None:
        return False

    return (
        latest.policy_version
        == settings.current_policy_version
    )


def record_acceptance(
    database: Session,
    user_id: str,
    policy_version: str,
) -> PolicyAcceptanceRecord:
    """
    Records a new acceptance every time this is called — even
    if the version matches an existing one. This keeps a full
    history rather than upserting a single row, which is useful
    if it's ever needed for a compliance record (e.g. "prove
    this user accepted version 2.0 on this exact date").
    """

    acceptance = PolicyAcceptanceRecord(
        acceptance_id=str(uuid4()),
        user_id=user_id,
        policy_version=policy_version,
        accepted_at=datetime.now(timezone.utc),
    )

    database.add(acceptance)
    database.commit()
    database.refresh(acceptance)

    return acceptance
    