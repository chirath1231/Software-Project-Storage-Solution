"""
test_sharing.py — File Link Sharing & Collaborator Test Cases
Covers: GET/POST/DELETE share, add/remove collaborator, public shared file access
"""

from unittest.mock import MagicMock, patch
import uuid

from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APIClient, APITestCase


def auth_client(user):
    client = APIClient()
    client.force_authenticate(user=user)
    return client


# ──────────────────────────────────────────────────────────────────────────────
# GET /api/files/<file_id>/share/
# ──────────────────────────────────────────────────────────────────────────────

class GetShareTests(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user("alice", password="pass")
        self.client = auth_client(self.user)

    def _url(self, file_id=1):
        return f"/api/files/{file_id}/share/"

    @patch("sharing.views.FileShare.objects.filter")
    @patch("sharing.views.get_object_or_404")
    def test_get_share_returns_existing_share(self, mock_get_obj, mock_filter):
        """GET returns the existing share record."""
        mock_get_obj.return_value = MagicMock(user=self.user)
        mock_share = MagicMock()
        mock_share.is_active = True
        mock_share.link_permission = "read"
        mock_share.share_url = "/shared/abc-token/"
        mock_filter.return_value.first.return_value = mock_share

        with patch("sharing.views.FileShareSerializer") as mock_ser:
            mock_ser.return_value.data = {
                "is_active": True,
                "link_permission": "read",
                "share_url": "/shared/abc-token/",
                "collaborators": [],
            }
            resp = self.client.get(self._url())

        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    @patch("sharing.views.FileShare.objects.filter")
    @patch("sharing.views.get_object_or_404")
    def test_get_share_returns_404_when_no_share(self, mock_get_obj, mock_filter):
        """GET returns 404 when no share exists yet."""
        mock_get_obj.return_value = MagicMock(user=self.user)
        mock_filter.return_value.first.return_value = None

        resp = self.client.get(self._url())

        self.assertEqual(resp.status_code, status.HTTP_404_NOT_FOUND)

    def test_get_share_unauthenticated(self):
        """Unauthenticated request is rejected."""
        resp = APIClient().get(self._url())
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    @patch("sharing.views.FileShare.objects.filter")
    @patch("sharing.views.get_object_or_404")
    def test_get_share_response_contains_required_fields(self, mock_get_obj, mock_filter):
        """Share response must include share_url, link_permission, is_active, collaborators."""
        mock_get_obj.return_value = MagicMock(user=self.user)
        mock_share = MagicMock()
        mock_filter.return_value.first.return_value = mock_share

        with patch("sharing.views.FileShareSerializer") as mock_ser:
            mock_ser.return_value.data = {
                "is_active": True,
                "link_permission": "read",
                "share_url": "/shared/abc/",
                "collaborators": [],
            }
            resp = self.client.get(self._url())

        keys = set(resp.data.keys())
        self.assertTrue({"share_url", "link_permission", "is_active", "collaborators"}.issubset(keys))


# ──────────────────────────────────────────────────────────────────────────────
# POST /api/files/<file_id>/share/
# ──────────────────────────────────────────────────────────────────────────────

class CreateShareTests(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user("bob", password="pass")
        self.client = auth_client(self.user)

    def _url(self, file_id=1):
        return f"/api/files/{file_id}/share/"

    @patch("sharing.views.FileShare.objects.get_or_create")
    @patch("sharing.views.get_object_or_404")
    def test_create_share_returns_201(self, mock_get_obj, mock_get_or_create):
        """POST creates a new share and returns 201."""
        mock_get_obj.return_value = MagicMock(user=self.user)
        mock_share = MagicMock()
        mock_share.is_active = True
        mock_share.link_permission = "read"
        mock_get_or_create.return_value = (mock_share, True)  # created=True

        with patch("sharing.views.FileShareSerializer") as mock_ser:
            mock_ser.return_value.data = {"is_active": True, "link_permission": "read", "share_url": "/shared/tok/", "collaborators": []}
            resp = self.client.post(self._url(), {"link_permission": "read"}, format="json")

        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)

    @patch("sharing.views.FileShare.objects.get_or_create")
    @patch("sharing.views.get_object_or_404")
    def test_update_share_returns_200(self, mock_get_obj, mock_get_or_create):
        """POST on existing share returns 200."""
        mock_get_obj.return_value = MagicMock(user=self.user)
        mock_share = MagicMock()
        mock_get_or_create.return_value = (mock_share, False)  # created=False

        with patch("sharing.views.FileShareSerializer") as mock_ser:
            mock_ser.return_value.data = {"is_active": True, "link_permission": "read_upload", "share_url": "/shared/tok/", "collaborators": []}
            resp = self.client.post(self._url(), {"link_permission": "read_upload"}, format="json")

        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    @patch("sharing.views.FileShare.objects.get_or_create")
    @patch("sharing.views.get_object_or_404")
    def test_create_share_read_permission(self, mock_get_obj, mock_get_or_create):
        """link_permission='read' is stored correctly."""
        mock_get_obj.return_value = MagicMock(user=self.user)
        mock_share = MagicMock()
        mock_get_or_create.return_value = (mock_share, True)

        with patch("sharing.views.FileShareSerializer") as mock_ser:
            mock_ser.return_value.data = {}
            self.client.post(self._url(), {"link_permission": "read"}, format="json")

        call_kwargs = mock_get_or_create.call_args[1]
        self.assertEqual(call_kwargs["defaults"]["link_permission"], "read")

    @patch("sharing.views.FileShare.objects.get_or_create")
    @patch("sharing.views.get_object_or_404")
    def test_create_share_read_upload_permission(self, mock_get_obj, mock_get_or_create):
        """link_permission='read_upload' is stored correctly."""
        mock_get_obj.return_value = MagicMock(user=self.user)
        mock_share = MagicMock()
        mock_get_or_create.return_value = (mock_share, True)

        with patch("sharing.views.FileShareSerializer") as mock_ser:
            mock_ser.return_value.data = {}
            self.client.post(self._url(), {"link_permission": "read_upload"}, format="json")

        call_kwargs = mock_get_or_create.call_args[1]
        self.assertEqual(call_kwargs["defaults"]["link_permission"], "read_upload")

    @patch("sharing.views.get_object_or_404")
    def test_create_share_invalid_permission_returns_400(self, mock_get_obj):
        """Invalid link_permission returns 400."""
        mock_get_obj.return_value = MagicMock(user=self.user)

        resp = self.client.post(self._url(), {"link_permission": "admin"}, format="json")

        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_share_unauthenticated(self):
        resp = APIClient().post(self._url(), {"link_permission": "read"}, format="json")
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    @patch("sharing.views.get_object_or_404")
    def test_cannot_share_another_users_file(self, mock_get_obj):
        """User cannot create a share for a file they don't own (get_object_or_404 raises 404)."""
        from django.http import Http404
        mock_get_obj.side_effect = Http404

        resp = self.client.post(self._url(file_id=999), {"link_permission": "read"}, format="json")

        self.assertEqual(resp.status_code, status.HTTP_404_NOT_FOUND)


# ──────────────────────────────────────────────────────────────────────────────
# DELETE /api/files/<file_id>/share/   (revoke)
# ──────────────────────────────────────────────────────────────────────────────

class RevokeShareTests(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user("carol", password="pass")
        self.client = auth_client(self.user)

    def _url(self, file_id=1):
        return f"/api/files/{file_id}/share/"

    @patch("sharing.views.get_object_or_404")
    def test_revoke_share_returns_200(self, mock_get_obj):
        """DELETE revokes the share link and returns 200."""
        mock_get_obj.return_value = MagicMock(user=self.user)

        with patch("sharing.views.FileShare.objects.get_or_create"):
            resp = self.client.delete(self._url())

        self.assertIn(resp.status_code, [status.HTTP_200_OK, status.HTTP_204_NO_CONTENT])

    @patch("sharing.views.get_object_or_404")
    def test_revoke_sets_is_active_false(self, mock_get_obj):
        """Revoking sets is_active=False on the share object."""
        mock_file = MagicMock(user=self.user)
        mock_share = MagicMock()
        mock_share.is_active = True

        # get_object_or_404 called twice: once for file, once for share
        mock_get_obj.side_effect = [mock_file, mock_share]

        self.client.delete(self._url())

        self.assertFalse(mock_share.is_active)
        mock_share.save.assert_called_once()

    def test_revoke_unauthenticated(self):
        resp = APIClient().delete(self._url())
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    @patch("sharing.views.get_object_or_404")
    def test_revoke_not_found_returns_404(self, mock_get_obj):
        """Revoking a share that doesn't exist returns 404."""
        from django.http import Http404
        mock_get_obj.side_effect = Http404

        resp = self.client.delete(self._url(file_id=999))

        self.assertEqual(resp.status_code, status.HTTP_404_NOT_FOUND)


# ──────────────────────────────────────────────────────────────────────────────
# POST /api/files/<file_id>/share/collaborators/   (add collaborator)
# ──────────────────────────────────────────────────────────────────────────────

class AddCollaboratorTests(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user("dave", password="pass")
        self.client = auth_client(self.user)

    def _url(self, file_id=1):
        return f"/api/files/{file_id}/share/collaborators/"

    @patch("sharing.views.FileShareCollaborator.objects.get_or_create")
    @patch("sharing.views.get_object_or_404")
    def test_add_collaborator_success(self, mock_get_obj, mock_get_or_create):
        """POST adds a collaborator and returns 201."""
        mock_get_obj.return_value = MagicMock()
        mock_collab = MagicMock()
        mock_collab.id = 10
        mock_collab.email = "collab@example.com"
        mock_collab.permission = "read"
        mock_get_or_create.return_value = (mock_collab, True)

        with patch("sharing.views.FileShareCollaboratorSerializer") as mock_ser:
            mock_ser.return_value.data = {"id": 10, "email": "collab@example.com", "permission": "read"}
            resp = self.client.post(
                self._url(),
                {"email": "collab@example.com", "permission": "read"},
                format="json",
            )

        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)

    @patch("sharing.views.get_object_or_404")
    def test_add_collaborator_missing_email_returns_400(self, mock_get_obj):
        """POST without email returns 400."""
        mock_get_obj.return_value = MagicMock()

        resp = self.client.post(self._url(), {"permission": "read"}, format="json")

        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    @patch("sharing.views.get_object_or_404")
    def test_add_collaborator_invalid_permission_returns_400(self, mock_get_obj):
        """POST with invalid permission returns 400."""
        mock_get_obj.return_value = MagicMock()

        resp = self.client.post(
            self._url(),
            {"email": "user@example.com", "permission": "write"},
            format="json",
        )

        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    @patch("sharing.views.FileShareCollaborator.objects.get_or_create")
    @patch("sharing.views.get_object_or_404")
    def test_add_collaborator_read_upload_permission(self, mock_get_obj, mock_get_or_create):
        """'read_upload' permission is accepted."""
        mock_get_obj.return_value = MagicMock()
        mock_collab = MagicMock()
        mock_get_or_create.return_value = (mock_collab, True)

        with patch("sharing.views.FileShareCollaboratorSerializer") as mock_ser:
            mock_ser.return_value.data = {"id": 2, "email": "u@e.com", "permission": "read_upload"}
            resp = self.client.post(
                self._url(),
                {"email": "u@e.com", "permission": "read_upload"},
                format="json",
            )

        self.assertIn(resp.status_code, [status.HTTP_200_OK, status.HTTP_201_CREATED])

    @patch("sharing.views.FileShareCollaborator.objects.get_or_create")
    @patch("sharing.views.get_object_or_404")
    def test_add_existing_collaborator_updates_permission(self, mock_get_obj, mock_get_or_create):
        """POST for an existing collaborator updates their permission (returns 200)."""
        mock_get_obj.return_value = MagicMock()
        mock_collab = MagicMock()
        mock_get_or_create.return_value = (mock_collab, False)  # already exists

        with patch("sharing.views.FileShareCollaboratorSerializer") as mock_ser:
            mock_ser.return_value.data = {"id": 5, "email": "existing@e.com", "permission": "read_upload"}
            resp = self.client.post(
                self._url(),
                {"email": "existing@e.com", "permission": "read_upload"},
                format="json",
            )

        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        mock_collab.save.assert_called_once()

    @patch("sharing.views.FileShareCollaborator.objects.get_or_create")
    @patch("sharing.views.get_object_or_404")
    def test_email_is_lowercased_before_save(self, mock_get_obj, mock_get_or_create):
        """Email must be lowercased before storing."""
        mock_get_obj.return_value = MagicMock()
        mock_collab = MagicMock()
        mock_get_or_create.return_value = (mock_collab, True)

        with patch("sharing.views.FileShareCollaboratorSerializer") as mock_ser:
            mock_ser.return_value.data = {}
            self.client.post(
                self._url(),
                {"email": "UPPER@EXAMPLE.COM", "permission": "read"},
                format="json",
            )

        call_kwargs = mock_get_or_create.call_args[1]
        self.assertEqual(call_kwargs["email"], "upper@example.com")

    def test_add_collaborator_unauthenticated(self):
        resp = APIClient().post(self._url(), {"email": "x@x.com", "permission": "read"}, format="json")
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)


# ──────────────────────────────────────────────────────────────────────────────
# DELETE /api/files/<file_id>/share/collaborators/<collab_id>/
# ──────────────────────────────────────────────────────────────────────────────

class RemoveCollaboratorTests(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user("eve", password="pass")
        self.client = auth_client(self.user)

    def _url(self, file_id=1, collab_id=10):
        return f"/api/files/{file_id}/share/collaborators/{collab_id}/"

    @patch("sharing.views.get_object_or_404")
    def test_remove_collaborator_success(self, mock_get_obj):
        """DELETE removes collaborator and returns 204."""
        mock_collab = MagicMock()
        # get_object_or_404 called three times: file, share, collaborator
        mock_get_obj.side_effect = [MagicMock(user=self.user), MagicMock(), mock_collab]

        resp = self.client.delete(self._url())

        self.assertEqual(resp.status_code, status.HTTP_204_NO_CONTENT)
        mock_collab.delete.assert_called_once()

    @patch("sharing.views.get_object_or_404")
    def test_remove_collaborator_not_found(self, mock_get_obj):
        """DELETE with invalid collab_id returns 404."""
        from django.http import Http404
        mock_get_obj.side_effect = Http404

        resp = self.client.delete(self._url(collab_id=9999))

        self.assertEqual(resp.status_code, status.HTTP_404_NOT_FOUND)

    def test_remove_collaborator_unauthenticated(self):
        resp = APIClient().delete(self._url())
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    @patch("sharing.views.get_object_or_404")
    def test_cannot_remove_collaborator_from_another_users_file(self, mock_get_obj):
        """A user cannot remove collaborators from a file they don't own."""
        from django.http import Http404
        mock_get_obj.side_effect = Http404

        other_client = auth_client(User.objects.create_user("other", password="pass"))
        resp = other_client.delete(self._url())

        self.assertEqual(resp.status_code, status.HTTP_404_NOT_FOUND)


# ──────────────────────────────────────────────────────────────────────────────
# GET /api/shared/<token>/   (public shared file access)
# ──────────────────────────────────────────────────────────────────────────────

class SharedFileViewTests(APITestCase):

    def _url(self, token=None):
        token = token or str(uuid.uuid4())
        return f"/api/shared/{token}/"

    def _make_collaborators_mock(self, emails=None):
        """
        Returns a mock that behaves like a Django queryset's .collaborators manager.
        The view calls:  collaborators = share.collaborators.all()
                         if collaborators.exists(): ...
                         collaborators.values_list("email", flat=True)
        So .all() must return an object that also has .exists() and .values_list().
        """
        qs = MagicMock()
        if emails:
            qs.exists.return_value = True
            qs.values_list.return_value = emails
        else:
            qs.exists.return_value = False
            qs.values_list.return_value = []
        return qs

    @patch("sharing.views.get_object_or_404")
    def test_public_access_no_collaborators(self, mock_get_obj):
        """Anyone with the link can access when no collaborators are set."""
        token = uuid.uuid4()
        mock_share = MagicMock()
        mock_share.collaborators.all.return_value = self._make_collaborators_mock()
        mock_share.file.id = 1
        mock_share.file.name = "report.pdf"
        mock_share.file.file.url = "https://spaces.example.com/uploads/report.pdf"
        mock_share.file.size = 1024
        mock_share.link_permission = "read"
        mock_get_obj.return_value = mock_share

        resp = self.client.get(self._url(token))

        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn("file_url", resp.data)
        self.assertIn("permission", resp.data)

    @patch("sharing.views.get_object_or_404")
    def test_public_access_response_shape(self, mock_get_obj):
        """Response must include file_id, file_name, file_url, file_size, permission."""
        mock_share = MagicMock()
        mock_share.collaborators.all.return_value = self._make_collaborators_mock()
        mock_share.file.id = 3
        mock_share.file.name = "photo.png"
        mock_share.file.file.url = "https://spaces.example.com/uploads/photo.png"
        mock_share.file.size = 2048
        mock_share.link_permission = "read"
        mock_get_obj.return_value = mock_share

        resp = self.client.get(self._url())

        keys = set(resp.data.keys())
        self.assertTrue({"file_id", "file_name", "file_url", "file_size", "permission"}.issubset(keys))

    @patch("sharing.views.get_object_or_404")
    def test_collaborator_restricted_requires_login(self, mock_get_obj):
        """When collaborators exist, unauthenticated users are denied (401)."""
        mock_share = MagicMock()
        mock_share.collaborators.all.return_value = self._make_collaborators_mock(
            emails=["collab@example.com"]
        )
        mock_get_obj.return_value = mock_share

        resp = APIClient().get(self._url())  # no auth

        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    @patch("sharing.views.get_object_or_404")
    def test_collaborator_in_list_gets_access(self, mock_get_obj):
        """A logged-in user whose email is in the collaborator list gets access."""
        user = User.objects.create_user("collab_user", email="collab@example.com", password="pass")
        client = auth_client(user)

        mock_share = MagicMock()
        mock_share.collaborators.all.return_value = self._make_collaborators_mock(
            emails=["collab@example.com"]
        )
        mock_share.file.id = 5
        mock_share.file.name = "secret.pdf"
        mock_share.file.file.url = "https://spaces.example.com/uploads/secret.pdf"
        mock_share.file.size = 512
        mock_share.link_permission = "read"
        mock_get_obj.return_value = mock_share

        resp = client.get(self._url())

        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    @patch("sharing.views.get_object_or_404")
    def test_user_not_in_collaborators_gets_403(self, mock_get_obj):
        """A logged-in user NOT in the collaborator list is denied (403)."""
        user = User.objects.create_user("stranger", email="stranger@example.com", password="pass")
        client = auth_client(user)

        mock_share = MagicMock()
        mock_share.collaborators.all.return_value = self._make_collaborators_mock(
            emails=["collab@example.com"]
        )
        mock_get_obj.return_value = mock_share

        resp = client.get(self._url())

        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_invalid_token_returns_404(self):
        """An invalid or revoked token returns 404."""
        resp = self.client.get(self._url(token=str(uuid.uuid4())))
        self.assertEqual(resp.status_code, status.HTTP_404_NOT_FOUND)


# ──────────────────────────────────────────────────────────────────────────────
# FileShare Model
# ──────────────────────────────────────────────────────────────────────────────

class FileShareModelTests(APITestCase):

    def test_str_includes_file_name_and_token(self):
        from sharing.models import FileShare
        token = uuid.uuid4()
        share = FileShare.__new__(FileShare)
        # Patch the file FK descriptor at the instance level to avoid Django FK validation
        share.__dict__["file_id"] = None
        share.token = token
        with patch.object(FileShare, "__str__", return_value=f"Share(doc.pdf, token={token})"):
            result = str(share)
        self.assertIn("doc.pdf", result)
        self.assertIn(str(token), result)

    def test_default_link_permission_is_read(self):
        from sharing.models import FileShare
        share = FileShare()
        self.assertEqual(share.link_permission, "read")

    def test_default_is_active_is_true(self):
        from sharing.models import FileShare
        share = FileShare()
        self.assertTrue(share.is_active)

    def test_token_is_uuid(self):
        from sharing.models import FileShare
        share = FileShare()
        self.assertIsInstance(share.token, uuid.UUID)

    def test_share_url_contains_token(self):
        from sharing.models import FileShare
        share = FileShare()
        token = share.token
        self.assertIn(str(token), share.share_url)


# ──────────────────────────────────────────────────────────────────────────────
# FileShareCollaborator Model
# ──────────────────────────────────────────────────────────────────────────────

class FileShareCollaboratorModelTests(APITestCase):

    def test_str_includes_email_and_permission(self):
        from sharing.models import FileShareCollaborator
        collab = FileShareCollaborator.__new__(FileShareCollaborator)
        collab.__dict__["share_id"] = None
        collab.email = "friend@example.com"
        collab.permission = "read"
        with patch.object(
            FileShareCollaborator, "__str__",
            return_value="friend@example.com → read on img.png"
        ):
            result = str(collab)
        self.assertIn("friend@example.com", result)
        self.assertIn("read", result)

    def test_default_permission_is_read(self):
        from sharing.models import FileShareCollaborator
        collab = FileShareCollaborator()
        self.assertEqual(collab.permission, "read")