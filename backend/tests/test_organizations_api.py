from app.models.organization_invite_record import (
    OrganizationInviteRecord,
)


def register_and_login(client, email: str, full_name: str) -> dict[str, str]:
    register_response = client.post(
        "/auth/register",
        json={
            "email": email,
            "password": "TestPassword123!",
            "full_name": full_name,
        },
    )

    assert register_response.status_code == 201

    login_response = client.post(
        "/auth/token",
        data={
            "username": email,
            "password": "TestPassword123!",
        },
    )

    assert login_response.status_code == 200

    token = login_response.json()["access_token"]

    return {"Authorization": f"Bearer {token}"}


def test_new_user_has_a_personal_organization(client):
    headers = register_and_login(
        client, "solo@example.com", "Solo User"
    )

    response = client.get("/organizations/", headers=headers)

    assert response.status_code == 200

    organizations = response.json()

    assert len(organizations) == 1
    assert organizations[0]["role"] == "owner"
    assert "Solo User" in organizations[0]["name"]


def test_list_members_shows_the_owner(client):
    headers = register_and_login(
        client, "owner@example.com", "Owner Person"
    )

    response = client.get(
        "/organizations/members", headers=headers
    )

    assert response.status_code == 200

    members = response.json()

    assert len(members) == 1
    assert members[0]["role"] == "owner"
    assert members[0]["email"] == "owner@example.com"


def test_invite_and_accept_flow_via_http(client, database):
    owner_headers = register_and_login(
        client, "inviter2@example.com", "Inviter Two"
    )

    invite_response = client.post(
        "/organizations/members/invite",
        json={
            "email": "joiner@example.com",
            "role": "member",
        },
        headers=owner_headers,
    )

    assert invite_response.status_code == 201

    invite_id = invite_response.json()["invite_id"]

    # The API intentionally never returns the raw token in the
    # invite response — in production it only ever goes out via
    # the email link, not something the frontend could log. For
    # this test, read it directly from the database instead.
    invite_record = database.get(
        OrganizationInviteRecord, invite_id
    )

    assert invite_record is not None

    joiner_headers = register_and_login(
        client, "joiner@example.com", "Joiner Person"
    )

    before_response = client.get(
        "/organizations/", headers=joiner_headers
    )

    assert len(before_response.json()) == 1

    accept_response = client.post(
        f"/organizations/invites/{invite_record.token}/accept",
        headers=joiner_headers,
    )

    assert accept_response.status_code == 200
    assert accept_response.json()["role"] == "member"

    after_response = client.get(
        "/organizations/", headers=joiner_headers
    )

    # joiner now belongs to two orgs: their own personal one,
    # plus the one they just joined.
    assert len(after_response.json()) == 2


def test_non_owner_invite_acts_on_their_own_default_org(
    client,
):
    member_headers = register_and_login(
        client, "member3@example.com", "Member Three"
    )

    # member3's default org is their own personal workspace,
    # where they're the owner — so this succeeds, since the
    # endpoint always acts on whichever org resolves for the
    # current request, not some other org they don't belong to.
    invite_response = client.post(
        "/organizations/members/invite",
        json={
            "email": "someone@example.com",
            "role": "member",
        },
        headers=member_headers,
    )

    assert invite_response.status_code == 201


def test_remove_member_requires_membership(client):
    headers = register_and_login(
        client, "solo2@example.com", "Solo Two"
    )

    response = client.delete(
        "/organizations/members/nonexistent-user-id",
        headers=headers,
    )

    assert response.status_code == 404