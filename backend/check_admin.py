import os
import sys
import django

# Setup Django settings
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth.hashers import check_password
from admin_management.models import AdminUser

print("=" * 70)
print("DEBUG: CHECKING ADMIN DATABASE")
print("=" * 70)

# Get all admin users
all_admins = AdminUser.objects.all()
print(f"\nTotal admin users in database: {all_admins.count()}\n")

for admin in all_admins:
    print(f"Email: {admin.email}")
    print(f"Admin ID: {admin.admin_id}")
    print(f"Password Hash (first 50 chars): {admin.password[:50]}")
    print(f"Full Hash Length: {len(admin.password)}")
    
    # Test password verification
    test_passwords = ['staff123', 'support123', 'admin123']
    print(f"\nPassword Tests:")
    for test_pwd in test_passwords:
        result = check_password(test_pwd, admin.password)
        print(f"  - '{test_pwd}': {result}")
    print("-" * 70)

print("\n" + "=" * 70)
