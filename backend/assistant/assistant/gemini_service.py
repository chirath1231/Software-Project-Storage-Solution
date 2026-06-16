import re
import os, time
from google import genai

from .knowledge_base import INTENTS, KNOWLEDGE_BASE
from .prompts import SYSTEM_PROMPT
from google.genai.errors import ClientError, ServerError

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

GREETING_PATTERNS = re.compile(
    r'^\s*(hi+|hello+|hey+|good\s+(morning|evening|afternoon|night))[!.,\s]*$',
    re.IGNORECASE
)

def handle_greetings(prompt):
    if GREETING_PATTERNS.match(prompt.strip()):
        return "Hi 👋 I'm your Ceynoa Assistant. I can help you with uploads, sharing, storage, and account settings."
    return None

def check_intent(prompt):
    text = prompt.lower().strip()
    
    # Use word-boundary safe tokenization
    text_words = set(re.findall(r'\b\w+\b', text))

    best_intent = None
    best_score = 0

    for intent, keywords in INTENTS.items():
        score = 0

        for keyword in keywords:
            words = keyword.split()
            keyword_words = set(words)
            
            # All words in keyword must exist as whole words in the text
            if keyword_words.issubset(text_words):
                # Longer (more specific) keywords score higher
                score += len(words) * 2  # weight multi-word phrases more

        if score > best_score:
            best_score = score
            best_intent = intent

    # Raise threshold — require at least a 2-word match OR a very specific single word
    # Single-word keywords score 2, so threshold of 3 requires multi-word match
    # Lower to 2 only if you want single-word matches (be careful)
    if best_score >= 2 and best_intent:
        return KNOWLEDGE_BASE.get(best_intent)

    return None
   
def ask_gemini(user_message: str):
    # These now correctly receive just "hi", "how to delete", etc.
    
    greeting = handle_greetings(user_message)
    if greeting:
        return greeting

    kb_answer = check_intent(user_message)
    if kb_answer:
        return kb_answer

    faq_answer = check_faq(user_message)
    if faq_answer:
        return faq_answer

    key = user_message.strip().lower()
    if key in CACHE:
        return CACHE[key]

    # Only here do we build the full prompt for Gemini
    full_prompt = f"""
    {SYSTEM_PROMPT}

    --- KNOWLEDGE BASE ---
    {KNOWLEDGE_BASE}

    User: {user_message}
    """

    for attempt in range(2):
        try:
            print("CALLING GEMINI API")
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                # model = "gemini-3.1-flash-lite",
                # model = "gemini-3-flash",
                contents=[full_prompt]  # single assembled string
            )
            answer = response.text
            CACHE[key] = answer
            return answer

        except ServerError:
            return "AI is currently busy. Please try again in a few seconds."
        except ClientError as e:
            if "429" in str(e):
                time.sleep(2)
                continue
            return f"AI error: {str(e)}"

    return "AI is busy. Please retry after a few seconds."