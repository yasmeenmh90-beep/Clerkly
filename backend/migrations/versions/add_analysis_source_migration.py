"""add analysis_source to tasks

Revision ID: a1b2c3d4e5f6
Revises: <PUT_YOUR_LATEST_REVISION_ID_HERE>
Create Date: 2026-08-22

"""
from alembic import op
import sqlalchemy as sa


revision = "a1b2c3d4e5f6"
down_revision = "549edc8909f6"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "tasks",
        sa.Column(
            "analysis_source",
            sa.String(length=30),
            nullable=True,
        ),
    )


def downgrade() -> None:
    op.drop_column("tasks", "analysis_source")