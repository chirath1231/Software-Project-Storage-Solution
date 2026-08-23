from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from unittest.mock import patch
from .models import Event

User = get_user_model()

class EventAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        # Create a dummy user for the test
        self.user = User.objects.create_user(username='tester', password='testpassword123')
        self.client.force_authenticate(user=self.user)

    @patch('events.views.resend.Emails.send') # Mock the Resend API
    def test_create_event_and_send_email(self, mock_resend_send):
        payload = {
            "title": "Supervisor Demo Meeting",
            "start_time": "2026-08-25T10:00:00",
            "end_time": "2026-08-25T11:00:00",
            "attendee_email": "instructor@university.edu"
        }
        
        response = self.client.post('/api/accounts/events/', payload)
        
        # Check if the event was created successfully
        self.assertEqual(response.status_code, 201)
        self.assertEqual(Event.objects.count(), 1)
        
        # Check if the Resend email function was triggered
        self.assertTrue(mock_resend_send.called)