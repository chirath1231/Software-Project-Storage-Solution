import time
from django.core.management.base import BaseCommand
from notifications.utils import process_meeting_reminders

class Command(BaseCommand):
    help = "Runs a background worker to process meeting reminders every 60 seconds"

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS("🚀 Background Watcher is now active..."))
        
        while True:
            try:
                process_meeting_reminders()
                # Optional: self.stdout.write("Checking for meetings...")
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Error: {e}"))
            
            time.sleep(60) # Wait for 1 minute before checking again