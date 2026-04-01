from django.utils.timezone import now, timedelta
from .models import AccountDeletion

def delete_expired_accounts():
    expired_users = AccountDeletion.objects.filter(
        is_deleted=True,
        deleted_at__lte=now() - timedelta(days=30)
    )

    for deletion in expired_users:
        user = deletion.user

        # 🔥 STEP 1: DELETE CLOUD FILES (ask teammate)
        # Example:
        # delete_user_files(user)

        # 🔥 STEP 2: DELETE DB RELATED DATA
        # Example:
        # user.files.all().delete()

        # 🔥 STEP 3: DELETE USER
        user.delete()

        # 🔥 STEP 4: DELETE TRACKING RECORD
        deletion.delete()