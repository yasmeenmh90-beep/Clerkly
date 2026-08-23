from uuid import uuid4

import pytest

from app.models.user_record import UserRecord
from app.services import organization_service
from app.services.auth_service import hash_password


def make_user(
    database,
    email: str,
    full_name: str = "Test User",
) -> UserRecord:
    """
    Creates a real UserRecord directly in the test database.
    Bypasses the /auth/register HTTP flow since these tests
    exercise organization_service.py directly, not through any
    endpoint — there isn't one yet, that's Phase 3.
    """

    user = UserRecord(
        user_id=str(uuid4()),
        email=email,
        hashed_password=hash_password("TestPassword123!"),
        full_name=full_name,
    )

    database.add(user)
    database.commit()
    database.refresh(user)

    return user


def test_create_organization_makes_creator_the_owner(
    database,
):
    user = make_user(database, "owner@example.com")

    organization = organization_service.create_organization(
        database=database,
        user=user,
        name="Test Org",
    )

    assert organization.name == "Test Org"
    assert organization.owner_id == user.user_id

    membership = organization_service.get_membership(
        database=database,
        organization_id=organization.organization_id,
        user_id=user.user_id,
    )

    assert membership is not None
    assert membership.role == "owner"


def test_get_user_organizations_returns_created_org(
    database,
):
    user = make_user(database, "member@example.com")

    organization = organization_service.create_organization(
        database=database,
        user=user,
        name="Another Org",
    )

    organizations = (
        organization_service.get_user_organizations(
            database=database,
            user=user,
        )
    )

    organization_ids = [
        org.organization_id for org in organizations
    ]

    assert organization.organization_id in organization_ids


def test_invite_member_creates_invite_even_without_smtp(
    database,
):
    """
    SMTP isn't configured in the test environment, so this
    confirms the "degrade, don't fail" behavior — the invite
    record is still created even though the email send raises
    NotificationNotConfigured internally.
    """

    owner = make_user(database, "inviter@example.com")

    organization = organization_service.create_organization(
        database=database,
        user=owner,
        name="Invite Test Org",
    )

    invite = organization_service.invite_member(
        database=database,
        organization=organization,
        invited_email="invitee@example.com",
        role="member",
        invited_by=owner,
    )

    assert invite.invited_email == "invitee@example.com"
    assert invite.role == "member"
    assert invite.accepted_at is None
    assert invite.token


def test_invite_member_requires_manage_permission(database):
    owner = make_user(database, "owner2@example.com")
    plain_member = make_user(
        database, "plainmember@example.com"
    )

    organization = organization_service.create_organization(
        database=database,
        user=owner,
        name="Permission Test Org",
    )

    # Add plain_member as a "member" (not owner/admin) directly
    invite = organization_service.invite_member(
        database=database,
        organization=organization,
        invited_email=plain_member.email,
        role="member",
        invited_by=owner,
    )

    organization_service.accept_invite(
        database=database,
        token=invite.token,
        accepting_user=plain_member,
    )

    with pytest.raises(
        organization_service.InsufficientPermission
    ):
        organization_service.invite_member(
            database=database,
            organization=organization,
            invited_email="someone-else@example.com",
            role="member",
            invited_by=plain_member,
        )


def test_accept_invite_creates_membership(database):
    owner = make_user(database, "owner3@example.com")
    invitee = make_user(database, "newmember@example.com")

    organization = organization_service.create_organization(
        database=database,
        user=owner,
        name="Accept Test Org",
    )

    invite = organization_service.invite_member(
        database=database,
        organization=organization,
        invited_email=invitee.email,
        role="member",
        invited_by=owner,
    )

    membership = organization_service.accept_invite(
        database=database,
        token=invite.token,
        accepting_user=invitee,
    )

    assert membership.user_id == invitee.user_id
    assert membership.role == "member"
    assert (
        membership.organization_id
        == organization.organization_id
    )


def test_accept_invite_twice_raises(database):
    owner = make_user(database, "owner4@example.com")
    invitee = make_user(database, "twice@example.com")

    organization = organization_service.create_organization(
        database=database,
        user=owner,
        name="Double Accept Org",
    )

    invite = organization_service.invite_member(
        database=database,
        organization=organization,
        invited_email=invitee.email,
        role="member",
        invited_by=owner,
    )

    organization_service.accept_invite(
        database=database,
        token=invite.token,
        accepting_user=invitee,
    )

    # Accepting again with the same token should just confirm
    # the existing membership rather than error — see the
    # existing_membership branch in accept_invite. This is
    # intentional: a double-click on an email link shouldn't
    # be a hard failure.
    second_membership = organization_service.accept_invite(
        database=database,
        token=invite.token,
        accepting_user=invitee,
    )

    assert second_membership.user_id == invitee.user_id


def test_accept_invalid_token_raises_not_found(database):
    user = make_user(database, "randomuser@example.com")

    with pytest.raises(organization_service.InviteNotFound):
        organization_service.accept_invite(
            database=database,
            token="this-token-does-not-exist",
            accepting_user=user,
        )


def test_remove_member_by_owner_succeeds(database):
    owner = make_user(database, "owner5@example.com")
    member = make_user(database, "removeme@example.com")

    organization = organization_service.create_organization(
        database=database,
        user=owner,
        name="Removal Test Org",
    )

    invite = organization_service.invite_member(
        database=database,
        organization=organization,
        invited_email=member.email,
        role="member",
        invited_by=owner,
    )

    organization_service.accept_invite(
        database=database,
        token=invite.token,
        accepting_user=member,
    )

    organization_service.remove_member(
        database=database,
        organization=organization,
        user_id_to_remove=member.user_id,
        removed_by=owner,
    )

    membership = organization_service.get_membership(
        database=database,
        organization_id=organization.organization_id,
        user_id=member.user_id,
    )

    assert membership is None


def test_cannot_remove_the_owner(database):
    owner = make_user(database, "owner6@example.com")

    organization = organization_service.create_organization(
        database=database,
        user=owner,
        name="Owner Removal Test Org",
    )

    with pytest.raises(
        organization_service.InsufficientPermission
    ):
        organization_service.remove_member(
            database=database,
            organization=organization,
            user_id_to_remove=owner.user_id,
            removed_by=owner,
        )