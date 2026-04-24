from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from storage.models import File   # ✅ FIXED IMPORT

class Command(BaseCommand):
    help = "Delete files in trash older than 30 days"

    def handle(self, *args, **kwargs):
        threshold = timezone.now() - timedelta(days=30)

        old_files = File.objects.filter(
            is_deleted=True,
            deleted_at__lt=threshold
        )

        count = old_files.count()

        for f in old_files:
            f.file.delete()  # delete from DigitalOcean Spaces
            f.delete()       # delete DB record

        self.stdout.write(self.style.SUCCESS(f"Deleted {count} old files"))