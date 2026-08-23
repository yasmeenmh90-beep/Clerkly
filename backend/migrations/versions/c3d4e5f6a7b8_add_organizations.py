"""add organizations, organization_members, organization_invites,
and organization_id on tasks

Revision ID: c3d4e5f6a7b8
Revises: b2c3d4e5f6a7
Create Date: 2026-08-23

"""
from datetime import datetime, timezone
from uuid import uuid4

from alembic import op
import sqlalchemy as sa
from sqlalchemy import orm


revision = "c3d4e5f6a7b8"
down_revision = "b2c3d4e5f6a7"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "organizations",
        sa.Column(
            "organization_id", sa.String(), primary_key=True
        ),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column(
            "owner_id",
            sa.String(),
            sa.ForeignKey(
                "users.user_id",
                name="fk_organizations_owner_id_users",
            ),
            nullable=False,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
        ),
    )
    op.create_index(
        "ix_organizations_owner_id",
        "organizations",
        ["owner_id"],
    )

    op.create_table(
        "organization_members",
        sa.Column(
            "membership_id", sa.String(), primary_key=True
        ),
        sa.Column(
            "organization_id",
            sa.String(),
            sa.ForeignKey(
                "organizations.organization_id",
                name="fk_org_members_organization_id",
            ),
            nullable=False,
        ),
        sa.Column(
            "user_id",
            sa.String(),
            sa.ForeignKey(
                "users.user_id",
                name="fk_org_members_user_id",
            ),
            nullable=False,
        ),
        sa.Column(
            "role",
            sa.String(length=20),
            nullable=False,
            server_default="member",
        ),
        sa.Column(
            "joined_at",
            sa.DateTime(timezone=True),
            nullable=False,
        ),
        sa.UniqueConstraint(
            "organization_id",
            "user_id",
            name="uq_org_members_org_user",
        ),
    )
    op.create_index(
        "ix_org_members_organization_id",
        "organization_members",
        ["organization_id"],
    )
    op.create_index(
        "ix_org_members_user_id",
        "organization_members",
        ["user_id"],
    )

    op.create_table(
        "organization_invites",
        sa.Column("invite_id", sa.String(), primary_key=True),
        sa.Column(
            "organization_id",
            sa.String(),
            sa.ForeignKey(
                "organizations.organization_id",
                name="fk_org_invites_organization_id",
            ),
            nullable=False,
        ),
        sa.Column(
            "invited_email", sa.String(), nullable=False
        ),
        sa.Column(
            "role",
            sa.String(length=20),
            nullable=False,
            server_default="member",
        ),
        sa.Column(
            "invited_by",
            sa.String(),
            sa.ForeignKey(
                "users.user_id",
                name="fk_org_invites_invited_by_users",
            ),
            nullable=False,
        ),
        sa.Column(
            "token", sa.String(), nullable=False, unique=True
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
        ),
        sa.Column(
            "expires_at",
            sa.DateTime(timezone=True),
            nullable=False,
        ),
        sa.Column(
            "accepted_at",
            sa.DateTime(timezone=True),
            nullable=True,
        ),
    )
    op.create_index(
        "ix_org_invites_organization_id",
        "organization_invites",
        ["organization_id"],
    )
    op.create_index(
        "ix_org_invites_invited_email",
        "organization_invites",
        ["invited_email"],
    )
    op.create_index(
        "ix_org_invites_token",
        "organization_invites",
        ["token"],
        unique=True,
    )

    bind = op.get_bind()

    op.execute("DROP TABLE IF EXISTS _alembic_tmp_tasks")

    inspector = sa.inspect(bind)
    existing_columns = [
        col["name"] for col in inspector.get_columns("tasks")
    ]

    if "organization_id" not in existing_columns:
        with op.batch_alter_table("tasks") as batch_op:
            batch_op.add_column(
                sa.Column(
                    "organization_id",
                    sa.String(),
                    sa.ForeignKey(
                        "organizations.organization_id",
                        name="fk_tasks_organization_id",
                    ),
                    nullable=True,
                )
            )
            batch_op.create_index(
                "ix_tasks_organization_id",
                ["organization_id"],
            )

    session = orm.Session(bind=bind)

    users = session.execute(
        sa.text("SELECT user_id, full_name, email FROM users")
    ).fetchall()

    for user_id, full_name, email in users:
        organization_id = str(uuid4())
        membership_id = str(uuid4())

        org_name = (
            f"{full_name}'s Workspace"
            if full_name
            else f"{email}'s Workspace"
        )

        session.execute(
            sa.text(
                "INSERT INTO organizations "
                "(organization_id, name, owner_id, created_at) "
                "VALUES (:organization_id, :name, :owner_id, "
                ":created_at)"
            ),
            {
                "organization_id": organization_id,
                "name": org_name,
                "owner_id": user_id,
                "created_at": datetime.now(timezone.utc),
            },
        )

        session.execute(
            sa.text(
                "INSERT INTO organization_members "
                "(membership_id, organization_id, user_id, "
                "role, joined_at) "
                "VALUES (:membership_id, :organization_id, "
                ":user_id, 'owner', :joined_at)"
            ),
            {
                "membership_id": membership_id,
                "organization_id": organization_id,
                "user_id": user_id,
                "joined_at": datetime.now(timezone.utc),
            },
        )

        session.execute(
            sa.text(
                "UPDATE tasks SET organization_id = "
                ":organization_id WHERE owner_id = :user_id"
            ),
            {
                "organization_id": organization_id,
                "user_id": user_id,
            },
        )

    session.commit()


def downgrade() -> None:
    with op.batch_alter_table("tasks") as batch_op:
        batch_op.drop_index("ix_tasks_organization_id")
        batch_op.drop_column("organization_id")

    op.drop_index(
        "ix_org_invites_token", "organization_invites"
    )
    op.drop_index(
        "ix_org_invites_invited_email",
        "organization_invites",
    )
    op.drop_index(
        "ix_org_invites_organization_id",
        "organization_invites",
    )
    op.drop_table("organization_invites")

    op.drop_index(
        "ix_org_members_user_id", "organization_members"
    )
    op.drop_index(
        "ix_org_members_organization_id",
        "organization_members",
    )
    op.drop_table("organization_members")

    op.drop_index("ix_organizations_owner_id", "organizations")
    op.drop_table("organizations")
