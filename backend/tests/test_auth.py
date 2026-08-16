def test_register_login_and_get_current_user(client):
    register_response = client.post(
        "/auth/register",
        json={
            "email": "yasmeen@example.com",
            "password": "SecurePassword123!",
            "full_name": "Yasmeen Azmat",
        },
    )

    assert register_response.status_code == 201

    registered_user = register_response.json()

    assert registered_user["email"] == "yasmeen@example.com"
    assert registered_user["full_name"] == "Yasmeen Azmat"
    assert registered_user["is_active"] is True
    assert "user_id" in registered_user
    assert "hashed_password" not in registered_user
    assert "password" not in registered_user

    login_response = client.post(
        "/auth/token",
        data={
            "username": "yasmeen@example.com",
            "password": "SecurePassword123!",
        },
    )

    assert login_response.status_code == 200

    token_data = login_response.json()

    assert token_data["token_type"] == "bearer"
    assert token_data["access_token"]

    me_response = client.get(
        "/auth/me",
        headers={
            "Authorization": (
                f"Bearer {token_data['access_token']}"
            )
        },
    )

    assert me_response.status_code == 200
    assert me_response.json()["email"] == "yasmeen@example.com"
    assert (
        me_response.json()["user_id"]
        == registered_user["user_id"]
    )


def test_duplicate_registration_returns_409(client):
    user_data = {
        "email": "duplicate@example.com",
        "password": "SecurePassword123!",
        "full_name": "Duplicate User",
    }

    first_response = client.post(
        "/auth/register",
        json=user_data,
    )

    second_response = client.post(
        "/auth/register",
        json=user_data,
    )

    assert first_response.status_code == 201
    assert second_response.status_code == 409
    assert second_response.json() == {
        "detail": "Email is already registered"
    }


def test_invalid_login_and_missing_token(client):
    client.post(
        "/auth/register",
        json={
            "email": "login@example.com",
            "password": "CorrectPassword123!",
            "full_name": "Login User",
        },
    )

    login_response = client.post(
        "/auth/token",
        data={
            "username": "login@example.com",
            "password": "WrongPassword123!",
        },
    )

    assert login_response.status_code == 401
    assert login_response.json() == {
        "detail": "Incorrect email or password"
    }

    me_response = client.get("/auth/me")

    assert me_response.status_code == 401
    assert me_response.json() == {
        "detail": "Not authenticated"
    }