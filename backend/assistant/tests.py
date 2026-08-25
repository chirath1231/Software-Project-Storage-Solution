# Testing the chatbot
from django.test import SimpleTestCase
from .chatbot_service import handle_greetings


class ChatbotTests(SimpleTestCase):

    def test_greeting(self):

        response = handle_greetings("Hello")

        self.assertIsNotNone(response)

        self.assertIn(
            "Ceynoa Assistant",
            response
        )

# Test FAQ matching
from django.test import SimpleTestCase
from .chatbot_service import check_faq


class FAQTests(SimpleTestCase):

    def test_upload_faq(self):

        response = check_faq(
            "How do I upload a file?"
        )

        self.assertIsNotNone(response)

        self.assertIn(
            "Upload",
            response
        )

# Test knowledge base intent matching
from django.test import SimpleTestCase
from .chatbot_service import check_intent


class KnowledgeBaseTests(SimpleTestCase):

    def test_upload_intent(self):

        response = check_intent(
            "How can I upload a file?"
        )

        self.assertIsNotNone(response)

        self.assertIn(
            "Dashboard",
            response
        )

# Test the cache
from django.test import SimpleTestCase
from .chatbot_service import CACHE


class CacheTests(SimpleTestCase):

    def test_cache_store(self):

        CACHE.clear()

        CACHE["hello"] = "Hi 👋"

        self.assertIn("hello", CACHE)

        self.assertEqual(
            CACHE["hello"],
            "Hi 👋"
        )