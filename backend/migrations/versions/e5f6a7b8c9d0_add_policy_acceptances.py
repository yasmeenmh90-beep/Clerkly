"""add policy_acceptances table

Revision ID: e5f6a7b8c9d0
Revises: d4e5f6a7b8c9
Create Date: 2026-08-24

"""
from alembic import op
import sqlalchemy as sa


revision = "e5f6a7b8c9d0"
down_revision = "d4e5f6a7b8c9"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "policy_acceptances",
        sa.Column(
            "acceptance_id", sa.String(), primary_key=True
        ),
        sa.Column(
            "user_id",
            sa.String(),
            sa.ForeignKey(
                "users.user_id",
                name="fk_policy_acceptances_user_id",
            ),
            nullable=False,
        ),
        sa.Column(
            "policy_version",
            sa.String(length=20),
            nullable=False,
        ),
        sa.Column(
            "accepted_at",
            sa.DateTime(timezone=True),
            nullable=False,
        ),
    )
    op.create_index(
        "ix_policy_acceptances_user_id",
        "policy_acceptances",
        ["user_id"],
    )


def downgrade() -> None:
    op.drop_index(
        "ix_policy_acceptances_user_id",
        "policy_acceptances",
    )
    op.drop_table("policy_acceptances")
