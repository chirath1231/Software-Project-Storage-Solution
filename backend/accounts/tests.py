from django.test import TestCase

# Create your tests here.
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model

User = get_user_model()


class AuthenticationTests(APITestCase):

    def test_user_registration(self):
        url = reverse("register")  # Change to your actual URL name

        data = {
            "username": "testuser",
            "email": "test@example.com",
            "password": "TestPassword123!",
            "password2": "TestPassword123!",
        }

        response = self.client.post(url, data)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        self.assertTrue(
            User.objects.filter(email="test@example.com").exists()
        )


# Duplicate email
def test_duplicate_email_registration(self):

    User.objects.create_user(
        username="existinguser",
        email="test@example.com",
        password="Password123!"
    )

    url = reverse("register")

    data = {
        "username": "newuser",
        "email": "test@example.com",
        "password": "Password123!",
        "password2": "Password123!",
    }

    response = self.client.post(url, data)

    self.assertEqual(
        response.status_code,
        status.HTTP_400_BAD_REQUEST
    )

# Incorrect Login
def test_invalid_login(self):

    User.objects.create_user(
        username="testuser",
        password="CorrectPassword123!"
    )

    url = reverse("token_obtain_pair")

    data = {
        "username": "testuser",
        "password": "WrongPassword123!"
    }

    response = self.client.post(url, data)

    self.assertEqual(
        response.status_code,
        status.HTTP_401_UNAUTHORIZED
    )

# Profile Update
def test_update_profile(self):

    user = User.objects.create_user(
        username="oldusername",
        email="test@example.com",
        password="TestPassword123!"
    )

    refresh = RefreshToken.for_user(user)

    self.client.credentials(
        HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}"
    )

    data = {
        "first_name": "Poojani",
        "last_name": "Danulya"
    }

    response = self.client.patch(
        "/api/accounts/profile/",
        data
    )

    self.assertEqual(
        response.status_code,
        status.HTTP_200_OK
    )

    user.refresh_from_db()

    self.assertEqual(user.first_name, "Poojani")

# one user cannot access another user's data
def test_user_cannot_access_another_users_data(self):

    user1 = User.objects.create_user(
        username="user1",
        password="Password123!"
    )

    user2 = User.objects.create_user(
        username="user2",
        password="Password123!"
    )

    refresh = RefreshToken.for_user(user1)

    self.client.credentials(
        HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}"
    )

    # Try to access user2's protected resource
    response = self.client.get(
        f"/api/accounts/users/{user2.id}/"
    )

    self.assertIn(
        response.status_code,
        [
            status.HTTP_403_FORBIDDEN,
            status.HTTP_404_NOT_FOUND
        ]
    )