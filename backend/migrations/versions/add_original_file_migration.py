"""add original_filename and original_file_path to tasks

Revision ID: b2c3d4e5f6a7
Revises: a1b2c3d4e5f6
Create Date: 2026-08-22

"""
from alembic import op
import sqlalchemy as sa


revision = "b2c3d4e5f6a7"
down_revision = "a1b2c3d4e5f6"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "tasks",
        sa.Column(
            "original_filename",
            sa.String(length=255),
            nullable=True,
        ),
    )
    op.add_column(
        "tasks",
        sa.Column(
            "original_file_path",
            sa.String(length=500),
            nullable=True,
        ),
    )


def downgrade() -> None:
    op.drop_column("tasks", "original_file_path")
    op.drop_column("tasks", "original_filename")