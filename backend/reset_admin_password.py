import os
import sys
import django

# Setup Django settings
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth.hashers import make_password
from admin_management.models import AdminUser

def create_or_reset_admin(email, password):
    """
    Creates a new admin user or resets password for existing admin user.
    Ensures password is properly hashed.
    """
    from django.contrib.auth.hashers import check_password
    
    try:
        # Try to get existing admin user
        admin_user = AdminUser.objects.get(email=email)
        print(f"Found existing admin user: {email}")
        
        # Update password - use raw password, model.save() will hash it
        admin_user.password = password
        admin_user.save()
        print(f"✓ Successfully reset password for admin user: {email}")
        print(f"✓ Password hash: {admin_user.password[:30]}...")
        
        # Verify the password works
        if check_password(password, admin_user.password):
            print(f"✓ Password verification: SUCCESS")
        else:
            print(f"✗ Password verification: FAILED")
        
    except AdminUser.DoesNotExist:
        # Create new admin user
        print(f"Admin user not found. Creating new admin user: {email}")
        
        # Don't pre-hash - let the model.save() handle it
        admin_user = AdminUser.objects.create(
            email=email,
            password=password
        )
        print(f"✓ Successfully created new admin user: {email}")
        print(f"✓ Admin ID: {admin_user.admin_id}")
        print(f"✓ Password hash: {admin_user.password[:30]}...")
        
        # Verify the password works
        if check_password(password, admin_user.password):
            print(f"✓ Password verification: SUCCESS")
        else:
            print(f"✗ Password verification: FAILED")
        
    except Exception as e:
        print(f"✗ An error occurred: {e}")
        raise

if __name__ == '__main__':
    # Configure these credentials
    ADMIN_EMAIL = 'staff@ceynoa.com'
    ADMIN_PASSWORD = 'staff123'
    
    print("=" * 60)
    print("ADMIN USER SETUP")
    print("=" * 60)
    print(f"Email: {ADMIN_EMAIL}")
    print(f"Password: {ADMIN_PASSWORD}")
    print("=" * 60)
    
    create_or_reset_admin(ADMIN_EMAIL, ADMIN_PASSWORD)
    
    print("=" * 60)
    print("Setup complete! You can now login to the admin dashboard.")
    print("=" * 60)