import os, time
from google import genai
from .prompts import SYSTEM_PROMPT
from google.genai.errors import ClientError

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
CACHE = {}
FAQS = [

{
"keywords": [
"upload",
"upload file",
"uploading files",
"method of uploading",
"how do i upload",
"add file",
"upload document"
],

"answer":
"""How to Upload a File

1. Go to your dashboard.

2. Click the Upload button.

3. Select the file from your device.

4. The file will appear in your Ceynoa storage after upload completes.
"""
},

{
"keywords": [
"delete file",
"delete files",
"remove file"
],

"answer":
"""How to Delete Files

1. Select the file you want to remove.

2. Click Delete.

3. Confirm deletion.

4. The file will move to Trash.
"""
},

{
"keywords": [
"restore file",
"recover file",
"restore deleted files"
],

"answer":
"""How to Restore Deleted Files

1. Open Trash.

2. Select the deleted file.

3. Click Restore.

4. The file returns to its original location.
"""
},

{
"keywords": [
"share file",
"file sharing",
"share documents"
],

"answer":
"""How to Share Files

1. Select the file.

2. Click Share.

3. Generate a sharing link or invite collaborators.

4. Set permissions before sending.
"""
},

{
"keywords": [
"pricing",
"upgrade plan",
"subscription",
"premium plan"
],

"answer":
"""Pricing and Upgrading

1. Open your Account or Billing section.

2. View available subscription plans.

3. Select a higher plan.

4. Complete payment to upgrade.
"""
},

{
"keywords": [
"storage plan",
"storage limit",
"cloud storage size"
],

"answer":
"""Storage Plans

Ceynoa offers storage plans with different limits.

1. Open Subscription or Plans.

2. Compare storage tiers.

3. Upgrade if you need more space.
"""
},

{
"keywords": [
"profile settings",
"change profile",
"update profile"
],

"answer":
"""Updating Profile Settings

1. Open Profile Settings.

2. Edit your personal information.

3. Save changes.
"""
},

{
"keywords": [
"password reset",
"forgot password",
"change password"
],

"answer":
"""Password Reset

1. Go to Login.

2. Click Forgot Password.

3. Follow the reset link sent to your email.

4. Set a new password.
"""
}
]

def check_faq(prompt):
    text = prompt.lower()

    best_match = None
    best_score = 0

    for faq in FAQS:
        score = 0

        for keyword in faq["keywords"]:
            if f" {keyword} " in f" {text} ":
                # give weight based on keyword length (more specific = better)
                score += len(keyword)

        if score > best_score:
            best_score = score
            best_match = faq["answer"]

    # only return if confidence is high enough 15 is the confidence threshold
    if best_score >= 15:
        return best_match

    return None

def ask_gemini(prompt: str):

    # 1. Check FAQ first
    faq_answer = check_faq(prompt)

    if faq_answer:
        return faq_answer

    # normalize question
    key = prompt.strip().lower()

    # 2. Check cache 
    if key in CACHE:
        print("Using cached answer")
        return CACHE[key]

    # 3. Only call Gemini if not cached
    for attempt in range(2):
        try:
            print("CALLING GEMINI API")
            response = client.models.generate_content(
                # model="gemini-2.5-flash",
                # model="gemini-2.5-flash-lite",
                model="gemini-3.1-flash-lite-preview",
                contents=[
                    SYSTEM_PROMPT,
                    f"User question: {prompt}",
                    "Follow output format strictly."
                ]
            )

            answer = response.text

            # 3. Save response in cache
            CACHE[key] = answer

            return answer

        except ClientError as e:
            print("GEMINI ERROR:", e)
            if "429" in str(e):
                time.sleep(2)
                continue
            return f"AI error: {str(e)}"

            return "AI limit reached. Try again later." # Hit a rate limit or quota limit from Gemini

    return "AI is busy. Please retry after a few seconds." # System or retry failure (temporary issue)