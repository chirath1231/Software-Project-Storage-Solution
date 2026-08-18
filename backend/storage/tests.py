"""
tests.py — File Upload Test Cases
"""

from unittest.mock import MagicMock, patch

from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework import status
from rest_framework.test import APIClient, APITestCase


def make_file(name="test.txt", content=b"hello world", content_type="text/plain"):
    return SimpleUploadedFile(name, content, content_type=content_type)


def auth_client(user):
    client = APIClient()
    client.force_authenticate(user=user)
    return client


class UploadFileTests(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user("alice", password="pass")
        self.client = auth_client(self.user)
        self.url = "/api/files/upload/"

    @patch("storage.views.File.objects.create")
    def test_upload_success(self, mock_create):
        """Valid file upload returns 200 with a URL."""
        mock_obj = MagicMock()
        mock_obj.file.url = "https://spaces.example.com/uploads/test.txt"
        mock_create.return_value = mock_obj

        resp = self.client.post(self.url, {"file": make_file()}, format="multipart")

        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data["message"], "Uploaded successfully")
        self.assertIn("url", resp.data)

    @patch("storage.views.File.objects.create")
    def test_upload_image(self, mock_create):
        """PNG image upload returns 200."""
        mock_obj = MagicMock()
        mock_obj.file.url = "https://spaces.example.com/uploads/photo.png"
        mock_create.return_value = mock_obj

        resp = self.client.post(
            self.url,
            {"file": make_file("photo.png", b"\x89PNG\r\n", "image/png")},
            format="multipart",
        )

        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    @patch("storage.views.File.objects.create")
    def test_upload_pdf(self, mock_create):
        """PDF upload returns 200."""
        mock_obj = MagicMock()
        mock_obj.file.url = "https://spaces.example.com/uploads/doc.pdf"
        mock_create.return_value = mock_obj

        resp = self.client.post(
            self.url,
            {"file": make_file("doc.pdf", b"%PDF-1.4", "application/pdf")},
            format="multipart",
        )

        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    @patch("storage.views.File.objects.create")
    def test_upload_stores_correct_metadata(self, mock_create):
        """File.objects.create is called with the correct user and filename."""
        mock_obj = MagicMock()
        mock_obj.file.url = "https://spaces.example.com/uploads/notes.txt"
        mock_create.return_value = mock_obj

        self.client.post(
            self.url,
            {"file": make_file("notes.txt", b"some data")},
            format="multipart",
        )

        call_kwargs = mock_create.call_args[1]
        self.assertEqual(call_kwargs["name"], "notes.txt")
        self.assertEqual(call_kwargs["user"], self.user)

    @patch("storage.views.File.objects.create")
    def test_upload_stores_file_size(self, mock_create):
        """File size is passed correctly to File.objects.create."""
        content = b"hello world"
        mock_obj = MagicMock()
        mock_obj.file.url = "https://spaces.example.com/uploads/test.txt"
        mock_create.return_value = mock_obj

        self.client.post(
            self.url,
            {"file": make_file("test.txt", content)},
            format="multipart",
        )

        call_kwargs = mock_create.call_args[1]
        self.assertEqual(call_kwargs["size"], len(content))

    def test_upload_no_file_returns_400(self):
        """POST with no file returns 400 with an error message."""
        resp = self.client.post(self.url, {}, format="multipart")

        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", resp.data)

    def test_upload_unauthenticated_returns_401(self):
        """Unauthenticated upload is rejected with 401."""
        resp = APIClient().post(self.url, {"file": make_file()}, format="multipart")

        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    @patch("storage.views.File.objects.create")
    def test_upload_response_contains_url(self, mock_create):
        """Response URL matches the file's storage URL."""
        mock_obj = MagicMock()
        mock_obj.file.url = "https://spaces.example.com/uploads/test.txt"
        mock_create.return_value = mock_obj

        resp = self.client.post(self.url, {"file": make_file()}, format="multipart")

        self.assertEqual(resp.data["url"], "https://spaces.example.com/uploads/test.txt")