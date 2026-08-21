# --------------------------------
# 1. KNOWLEDGE BASE
# --------------------------------

KNOWLEDGE_BASE = {

    # ==============================
    # FILE MANAGEMENT
    # ==============================

    "upload_file":
        "Go to Dashboard → Click Upload → Select your file.",

    "download_file":
        "Click on a file → Press Download.",

    "share_file":
        "Click Share → Enter the recipient's email → Send.",

    "delete_file":
        "Open or select the file → Click Delete.",


    # ==============================
    # PROFILE & ACCOUNT SETTINGS
    # ==============================

    "change_profile_details":
        "Go to My Profile → Edit Profile → Update your details → Save.",

    "change_password":
        "Go to Settings → Security → Change Password.",

    "delete_account":
        "Go to Settings → Danger Zone → Delete Account permanently.",

    "update_profile_picture":
        "Go to Profile → Click your profile picture or avatar → Upload a new image.",


    # ==============================
    # STORAGE & SUBSCRIPTIONS
    # ==============================

    "storage_limit":
        "Your available storage depends on your subscription plan. You can check your current storage usage and available capacity from the Dashboard or My Profile.",

    "free_plan":
        "Free users get 5GB of storage. You can upgrade your subscription if you need more space.",

    "standard_plan":
        "The Standard Plan offers 10GB of storage.",

    "pro_plan":
        "The Pro Plan offers 50GB of storage.",

    "ultra_plan":
        "The Ultra Plan offers 100GB of storage.",

    "upgrade_plan":
        "Go to Subscriptions → Choose a plan → Complete the payment process to upgrade.",

    "check_storage":
        "Go to Dashboard or My Profile to view your current storage usage and available capacity.",


    # ==============================
    # AUTHENTICATION
    # ==============================

    "login_issue":
        "Check that your login credentials are correct. If the problem continues, try resetting your password.",

    "login_failed":
        "Ensure that your username or email and password are correct. You can reset your password if you have forgotten it.",

    "logout":
        "Click your profile icon in the navigation bar and select Logout.",

    "google_login":
        "On the login page, click Continue with Google and select your Google account.",


    # ==============================
    # NOTIFICATIONS & EMAILS
    # ==============================

    "check_notifications":
        "You can view your real-time notifications by clicking the Bell Icon in the top navigation bar. This opens a dropdown showing recent activities, uploads, file sharing activity, and system alerts.",

    "manage_notifications":
        "Open the notification dropdown by clicking the Bell Icon. You can click individual notifications to mark them as read, select Mark All as Read, or clear notifications if that option is available.",

    "storage_warning":
        "CEYNOA sends an email and an in-app alert when your storage reaches 95% or 100% of your subscription limit. To continue uploading files, you can delete unnecessary files or upgrade your subscription plan.",

    "missing_email_or_invitation":
        "If an expected CEYNOA email or shared-file invitation is missing, check your Spam or Junk folder first. If the problem continues, resend the sharing invitation from the Share section of your My Files dashboard.",


    # ==============================
    # CALENDAR & EXPIRING LINKS
    # ==============================

    "find_expiring_links":
        "You can track expiring shared links using the Interactive Calendar in your dashboard. Expiring links are shown with red indicators. Click an item to view the file details, check access, or revoke the link early.",

    "calendar_views":
        "The Calendar allows you to switch between Monthly, Weekly, and Daily views. Use the view selector at the top of the calendar to change your timeline.",


    # ==============================
    # MEETING SCHEDULING
    # ==============================

    "book_meeting":
        "Navigate to the Scheduling Module, select an available time slot, and send a meeting request to your client. Once the meeting is accepted, it will appear on your Interactive Calendar.",

    "meeting_confirmation":
        "Once a meeting is scheduled and approved, it appears on your calendar. Both you and your client receive a confirmation email, and CEYNOA can provide an in-app notification before the meeting starts.",

    "cancel_or_reschedule_meeting":
        "Go to your Calendar, select the relevant meeting, and choose Cancel or Reschedule. The other participant will be notified about the changes.",


    # ==============================
    # CHAT SYSTEM
    # ==============================

    "use_chat_system":
        "You can access the chat system from the client portal to communicate with the relevant support staff or file owner in real time.",

    "send_chat_message":
        "Open the relevant chat conversation, type your message, and send it. The message is delivered to the other participant through the real-time chat system.",

    "chat_response":
        "When the other participant replies, you can receive the response in the chat system without needing to refresh the page.",

    "chat_history":
        "Previous chat messages are stored as conversation history, allowing you to review earlier messages and continue the conversation later.",


    # ==============================
    # SUPPORT TICKETS
    # ==============================

    "create_support_ticket":
        "If your issue cannot be resolved through chat or the AI assistant, open the Support Ticket section, enter the issue title and description, add the necessary details, and submit the ticket.",

    "ticket_created":
        "After submitting a support ticket, the backend validates your request and creates a ticket with a unique ticket ID.",

    "ticket_status":
        "You can track your support ticket through statuses such as Open, In Progress, Resolved, and Closed.",

    "ticket_resolution":
        "The support team reviews your ticket and provides a response or solution. Once the issue is resolved, the ticket may be marked as Resolved or Closed.",


    # ==============================
    # SECURITY
    # ==============================

    "security_tips":
        "Use a strong password, avoid sharing your account credentials, and use available security features to protect your CEYNOA account.",


    # ==============================
    # AI ASSISTANT
    # ==============================

    "ai_assistant_usage":
        "You can ask me questions about using CEYNOA, including file management, storage, subscriptions, notifications, calendar features, meetings, chat, and support tickets.",


    # ==============================
    # TROUBLESHOOTING
    # ==============================

    "upload_error":
        "Check your internet connection and ensure that the file meets the allowed upload requirements. You can also try uploading the file again.",

    "file_not_uploading":
        "Try refreshing the page, checking your internet connection, and uploading the file again. If the issue continues, try a smaller file or contact support.",

    "calendar_sync_issue":
        "If your calendar or meeting information is not updating correctly, try refreshing the page. If the issue continues, contact support or submit a support ticket.",
}


# --------------------------------
# 2. INTENT KEYWORDS
# --------------------------------

INTENTS = {

    # ==============================
    # FILE MANAGEMENT
    # ==============================

    "upload_file": [
        "upload",
        "upload file",
        "add file",
        "send file",
        "upload document",
    ],

    "download_file": [
        "download",
        "download file",
        "get file",
    ],

    "share_file": [
        "share",
        "share file",
        "send to email",
        "share document",
        "share link",
    ],

    "delete_file": [
        "delete",
        "delete file",
        "remove file",
    ],


    # ==============================
    # PROFILE & ACCOUNT
    # ==============================

    "change_profile_details": [
        "change name",
        "edit profile",
        "update profile",
        "modify account",
        "change details",
    ],

    "change_password": [
        "change password",
        "reset password",
        "forgot password",
        "password",
    ],

    "delete_account": [
        "delete account",
        "remove account",
        "close account",
    ],

    "update_profile_picture": [
        "change photo",
        "profile picture",
        "avatar",
        "profile pic",
    ],


    # ==============================
    # STORAGE & SUBSCRIPTIONS
    # ==============================

    "storage_limit": [
        "storage limit",
        "storage",
        "storage space",
        "how much space",
        "capacity",
    ],

    "free_plan": [
        "free plan",
        "free storage",
        "5gb",
    ],

    "standard_plan": [
        "standard plan",
        "10gb",
    ],

    "pro_plan": [
        "pro plan",
        "50gb",
    ],

    "ultra_plan": [
        "ultra plan",
        "100gb",
    ],

    "upgrade_plan": [
        "upgrade",
        "upgrade plan",
        "premium",
        "buy plan",
        "subscription",
    ],

    "check_storage": [
        "check storage",
        "storage usage",
        "used storage",
        "how much storage",
    ],


    # ==============================
    # AUTHENTICATION
    # ==============================

    "login_issue": [
        "cannot login",
        "login problem",
        "login issue",
        "can't login",
    ],

    "login_failed": [
        "wrong password",
        "login failed",
        "invalid password",
    ],

    "logout": [
        "logout",
        "sign out",
        "log out",
    ],

    "google_login": [
        "google login",
        "sign in with google",
        "continue with google",
    ],


    # ==============================
    # NOTIFICATIONS & EMAILS
    # ==============================

    "check_notifications": [
        "notifications",
        "check notifications",
        "new alert",
        "bell icon",
        "alerts",
        "notification bell",
    ],

    "manage_notifications": [
        "mark as read",
        "mark all as read",
        "clear notifications",
        "delete notifications",
        "notification won't clear",
    ],

    "storage_warning": [
        "storage full",
        "95 percent",
        "95%",
        "capacity warning",
        "storage warning",
        "storage full email",
    ],

    "missing_email_or_invitation": [
        "email not received",
        "missing email",
        "share link email",
        "invitation not received",
        "client didn't get email",
        "spam folder",
    ],


    # ==============================
    # CALENDAR & EXPIRING LINKS
    # ==============================

    "find_expiring_links": [
        "expiring link",
        "link expires",
        "temporary link",
        "calendar red",
        "red marks",
        "expired link",
    ],

    "calendar_views": [
        "calendar view",
        "monthly view",
        "weekly view",
        "daily view",
        "change calendar view",
    ],


    # ==============================
    # MEETINGS
    # ==============================

    "book_meeting": [
        "schedule meeting",
        "book meeting",
        "client meeting",
        "consultation",
        "virtual meeting",
    ],

    "meeting_confirmation": [
        "meeting confirmed",
        "meeting confirmation",
        "meeting reminder",
        "consultation reminder",
    ],

    "cancel_or_reschedule_meeting": [
        "cancel meeting",
        "reschedule meeting",
        "change meeting",
        "move meeting",
    ],


    # ==============================
    # CHAT SYSTEM
    # ==============================

    "use_chat_system": [
        "chat system",
        "open chat",
        "contact support",
        "chat with support",
    ],

    "send_chat_message": [
        "send message",
        "send chat",
        "message support",
    ],

    "chat_response": [
        "chat response",
        "receive message",
        "instant reply",
        "real time message",
    ],

    "chat_history": [
        "chat history",
        "previous messages",
        "old messages",
        "conversation history",
    ],


    # ==============================
    # SUPPORT TICKETS
    # ==============================

    "create_support_ticket": [
        "create ticket",
        "submit ticket",
        "support ticket",
        "report issue",
        "technical support",
        "send ticket",
        "put ticket",
        "open ticket",
        "raise ticket",
        "make ticket",
        "file ticket",
        "ticket",
    ],

    "ticket_created": [
        "ticket id",
        "ticket created",
        "ticket number",
    ],

    "ticket_status": [
        "ticket status",
        "open ticket",
        "in progress",
        "resolved",
        "closed ticket",
    ],

    "ticket_resolution": [
        "ticket resolved",
        "close ticket",
        "issue resolved",
    ],


    # ==============================
    # SECURITY
    # ==============================

    "security_tips": [
        "security",
        "safe account",
        "secure account",
        "account safety",
    ],


    # ==============================
    # AI ASSISTANT
    # ==============================

    "ai_assistant_usage": [
        "help",
        "what can you do",
        "assistant",
        "how can you help",
    ],


    # ==============================
    # TROUBLESHOOTING
    # ==============================

    "upload_error": [
        "upload error",
        "file upload problem",
        "upload failed",
    ],

    "file_not_uploading": [
        "file not uploading",
        "cannot upload file",
        "upload not working",
    ],

    "calendar_sync_issue": [
        "calendar not sync",
        "calendar didn't sync",
        "meeting not showing",
        "calendar problem",
    ],
}


# --------------------------------
# 3. GENERAL RESPONSES
# --------------------------------

RESPONSES = {
    "greeting": "Hi! How can I help you today? 😊",

    "thanks": "You're welcome! Happy to help!",

    "fallback":
        "I'm not fully sure about that. Please try rephrasing your question or contact support if you need further assistance.",
}