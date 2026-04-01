from django.core.management.base import BaseCommand
from accounts.utils import delete_expired_accounts

class Command(BaseCommand):
    help = "Delete expired accounts"

    def handle(self, *args, **kwargs):
        delete_expired_accounts()
        self.stdout.write("Expired accounts deleted successfully")