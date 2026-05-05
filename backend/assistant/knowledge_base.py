# -------------------------------
# 1. KNOWLEDGE BASE (MAIN ANSWERS)
# -------------------------------
KNOWLEDGE_BASE = {
    # File actions
    "upload_file": "Go to Dashboard → Click Upload → Select your file.",
    "download_file": "Click on a file → Press Download.",
    "share_file": "Click Share → Enter email → Send.",
    "delete_file": "Open file → Click Delete.",

    # Profile & settings
    "change_profile_details": "Go to My Profile → Edit Profile → Update details → Save.",
    "change_password": "Go to Settings → Security → Change Password.",
    "delete_account": "Go to Settings → Danger Zone → Delete Account permanently.",
    "update_profile_picture": "Go to Profile → Click avatar → Upload new image.",

    # Storage & subscriptions
    "free plan": "Free users get 5GB storage. Upgrade for more.",
    "standard plan": "The Standard Plan offers 10GB storage.",
    "pro plan": "The Pro Plan offers 50GB storage.",
    "ultra plan": "The Ultra Plan offers 100GB storage.",
    "upgrade_plan": "Go to Subscriptions → Choose a plan → Confirm payment.",
    "check_storage": "Go to Dashboard → Storage section to see usage.",

    # Authentication
    "login_issue": "Try resetting your password or check your credentials.",
    "logout": "Click profile icon → Logout.",
    "google_login": "Click 'Continue with Google' on the login page.",

    # Notifications
    "notifications": "Click the bell icon to view notifications.",
    "mark_notifications": "Open notifications → Click 'Mark all as read'.",

    # Security
    "security_tips": "Use a strong password and enable two-factor authentication.",

    # AI assistant
    "ai_assistant_usage": "You can ask me anything about using the platform or troubleshooting issues.",

    # Errors / troubleshooting
    "upload_error": "Check your internet connection and file size limit.",
    "login_failed": "Ensure credentials are correct or reset your password.",
    "file_not_uploading": "Try refreshing the page or uploading a smaller file.",
}


# -------------------------------
# 2. INTENT KEYWORDS (MATCH USER INPUT)
# -------------------------------
INTENTS = {
    "upload_file": ["upload", "add file", "send file"],
    "download_file": ["download", "get file"],
    "share_file": ["share", "send to email"],
    "delete_file": ["delete", "delete file", "remove file"],

    "change_profile_details": ["change name", "edit profile", "update profile", "modify account"],
    "change_password": ["change password", "reset password", "forgot password", "pw"],
    "delete_account": ["delete account", "remove account"],
    "update_profile_picture": ["change photo", "profile picture", "avatar", "pic"],

    "storage_limit": ["storage", "limit", "space"],
    "upgrade_plan": ["upgrade", "premium", "buy plan"],
    "check_storage": ["check storage", "how much space", "GB", "gb"],

    "login_issue": ["cannot login", "login problem", "login issue"],
    "login_failed": ["wrong password", "login failed"],
    "logout": ["logout", "sign out"],
    "google_login": ["google login", "sign in with google"],

    "notifications": ["notifications", "alerts"],
    "mark_notifications": ["mark as read"],

    "security_tips": ["security", "safe account"],

    "upload_error": ["upload error", "file upload problem"],
    "file_not_uploading": ["file not uploading"],

    "ai_assistant_usage": ["help", "what can you do", "assistant"],
}


# -------------------------------
# 3. GENERAL RESPONSES
# -------------------------------
RESPONSES = {
    "greeting": "Hi! How can I help you today? 😊",
    "thanks": "You're welcome! Happy to help!",
    "fallback": "I'm not fully sure about that, but here's a general idea:\n"
}