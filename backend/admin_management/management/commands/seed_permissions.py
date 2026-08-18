from django.core.management.base import BaseCommand
from admin_management.models import AdminPermission

DEFAULT_PERMISSIONS = [
    {
        "code": "users.view",
        "name": "View Users",
        "category": "Users",
        "description": "View user management table, user profiles, and storage usage."
    },
    {
        "code": "users.manage",
        "name": "Manage Users",
        "category": "Users",
        "description": "Suspend, reactivate, and manage user accounts."
    },
    {
        "code": "payments.view",
        "name": "View Payments",
        "category": "Payments",
        "description": "View subscription analytics, revenue distribution, and top paying users."
    },
    {
        "code": "payments.manage",
        "name": "Manage Subscriptions",
        "category": "Payments",
        "description": "Create, edit, and update subscription plans, storage, and pricing."
    },
    {
        "code": "storage.view",
        "name": "View Storage Analytics",
        "category": "Storage",
        "description": "View storage utilization metrics, uploaded files statistics, and storage charts."
    },
    {
        "code": "storage.manage",
        "name": "Manage Storage",
        "category": "Storage",
        "description": "Manage files and storage configurations."
    },
    {
        "code": "reports.view",
        "name": "View Reports & Analytics",
        "category": "Reports",
        "description": "View executive reports, weekly performance breakdown, and yearly analytics."
    },
    {
        "code": "support.view",
        "name": "View Support Tickets",
        "category": "Support",
        "description": "View support ticket submissions and user inquiries."
    },
    {
        "code": "support.manage",
        "name": "Manage Support Tickets",
        "category": "Support",
        "description": "Reply to support tickets and resolve user issues."
    },
    {
        "code": "settings.view",
        "name": "View Admin Settings",
        "category": "Settings",
        "description": "View admin profile settings."
    },
    {
        "code": "settings.manage",
        "name": "Manage Admin Settings",
        "category": "Settings",
        "description": "Update admin profile, change password, and configure security."
    },
    {
        "code": "admin_permissions.manage",
        "name": "Manage Admin Permissions",
        "category": "Permissions",
        "description": "Super Admin permission to view and update permissions for other admin accounts."
    },
]


class Command(BaseCommand):
    help = "Seed standard Admin Permissions into the database."

    def handle(self, *args, **options):
        created_count = 0
        updated_count = 0

        for perm in DEFAULT_PERMISSIONS:
            obj, created = AdminPermission.objects.update_or_create(
                code=perm["code"],
                defaults={
                    "name": perm["name"],
                    "category": perm["category"],
                    "description": perm["description"],
                }
            )
            if created:
                created_count += 1
            else:
                updated_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Successfully seeded permissions: {created_count} created, {updated_count} updated. Total: {AdminPermission.objects.count()} permissions in database."
            )
        )
