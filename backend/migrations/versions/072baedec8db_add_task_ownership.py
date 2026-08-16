"""add task ownership

Revision ID: 072baedec8db
Revises: 1dd0ccbab45a
Create Date: 2026-08-16 22:47:30.875261
"""

from datetime import datetime, timezone
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "072baedec8db"
down_revision: Union[str, Sequence[str], None] = "1dd0ccbab45a"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


LEGACY_USER_ID = "legacy-system-user"
LEGACY_USER_EMAIL = "legacy@clerkly.local"


def upgrade() -> None:
    # Create an inactive system user for tasks that already exist.
    users_table = sa.table(
        "users",
        sa.column("user_id", sa.String()),
        sa.column("email", sa.String()),
        sa.column("hashed_password", sa.String()),
        sa.column("full_name", sa.String()),
        sa.column("is_active", sa.Boolean()),
        sa.column("created_at", sa.DateTime(timezone=True)),
    )

    op.bulk_insert(
        users_table,
        [
            {
                "user_id": LEGACY_USER_ID,
                "email": LEGACY_USER_EMAIL,
                "hashed_password": "!",
                "full_name": "Legacy System User",
                "is_active": False,
                "created_at": datetime.now(timezone.utc),
            }
        ],
    )

    # Add the column as nullable so existing tasks remain valid.
    with op.batch_alter_table("tasks", schema=None) as batch_op:
        batch_op.add_column(
            sa.Column(
                "owner_id",
                sa.String(),
                nullable=True,
            )
        )

    # Assign all existing tasks to the legacy system user.
    op.execute(
        sa.text(
            """
            UPDATE tasks
            SET owner_id = :owner_id
            WHERE owner_id IS NULL
            """
        ).bindparams(owner_id=LEGACY_USER_ID)
    )

    # Make ownership required after existing tasks are backfilled.
    with op.batch_alter_table("tasks", schema=None) as batch_op:
        batch_op.alter_column(
            "owner_id",
            existing_type=sa.String(),
            nullable=False,
        )

        batch_op.create_index(
            "ix_tasks_owner_id",
            ["owner_id"],
            unique=False,
        )

        batch_op.create_foreign_key(
            "fk_tasks_owner_id_users",
            "users",
            ["owner_id"],
            ["user_id"],
        )


def downgrade() -> None:
    with op.batch_alter_table("tasks", schema=None) as batch_op:
        batch_op.drop_constraint(
            "fk_tasks_owner_id_users",
            type_="foreignkey",
        )

        batch_op.drop_index("ix_tasks_owner_id")
        batch_op.drop_column("owner_id")

    op.execute(
        sa.text(
            """
            DELETE FROM users
            WHERE user_id = :user_id
            """
        ).bindparams(user_id=LEGACY_USER_ID)
    )