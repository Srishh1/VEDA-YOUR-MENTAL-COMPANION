import os
import re
import requests
from typing import Tuple 
from dotenv import load_dotenv
from openai import OpenAI
from retriever import retrieve_context
from namespace_router import detect_namespace  

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Temporary in-memory session store
conversation_sessions = {}

# --------- Guardrail regexes and helpers ----------
API_KEY_RE = re.compile(
    r'(?i)(sk-[A-Za-z0-9\-_]{16,}|AKIA[0-9A-Z]{16,}|pi_[A-Za-z0-9\-_]{16,}|(?:openai|aws|pinecone|api)_?key[^:\s=]*[:=]?\s*[A-Za-z0-9\-_\.]{8,})'
)
URL_RE = re.compile(r'(https?://[^\s\)\]\}<>"]+)', flags=re.IGNORECASE)

def mask_api_like_strings(text: str) -> str:
    """Replace anything that looks like an API key with [REDACTED-SECRET]."""
    return API_KEY_RE.sub('[REDACTED-SECRET]', text)

def verify_url(url: str, timeout: float = 2.0) -> bool:
    """Quickly verify a URL is reachable (HEAD then GET fallback)."""
    url = url.rstrip('.,);]')
    try:
        resp = requests.head(url, allow_redirects=True, timeout=timeout)
        if 200 <= resp.status_code < 400:
            return True
        # fallback
        resp = requests.get(url, allow_redirects=True, timeout=timeout, stream=True)
        return 200 <= resp.status_code < 400
    except requests.RequestException:
        return False

def scrub_and_verify_output(raw_text: str) -> Tuple[str, bool]:
    """
    Mask API-like patterns and verify URLs.
    Returns (cleaned_text, had_unverified_url_flag).
    """
    text = mask_api_like_strings(raw_text)
    urls = URL_RE.findall(text)
    had_unverified = False
    for url in urls:
        ok = verify_url(url)
        if not ok:
            had_unverified = True
            text = text.replace(url, "\"I don't know the exact URL\"")
    # final mask pass
    text = API_KEY_RE.sub('[REDACTED-SECRET]', text)
    return text, had_unverified

import re

def format_connie_reply(raw_text: str) -> str:
    """
    Cleans and formats Connie's response for smooth, natural readability.
    Removes escape chars, enforces bullet/step formatting, and adds human flow.
    """
    # Remove escape sequences and markdown junk
    text = raw_text.replace("\\n", " ").replace("\n", " ").replace("**", "")
    text = re.sub(r'\s+', ' ', text).strip()

    # Split into logical sentences
    sentences = re.split(r'(?<=[.!?])\s+', text)

    # Reconstruct text in a smoother conversational flow
    if len(sentences) > 3:
        # Convert into step-by-step format for multi-step instructions
        first = sentences[0]
        rest = [f"{i+1}. {s}" for i, s in enumerate(sentences[1:])]
        formatted = f"{first}\n" + "\n".join(rest)
    else:
        # Just return a clean, naturally flowing single paragraph
        formatted = " ".join(sentences)

    # Add a gentle follow-up question only if it's instructional
    if any(word in text.lower() for word in ["fill", "create", "register", "apply", "setup"]):
        if "Would you like" not in text:
            formatted += "\n\nWould you like me to walk you through the steps in detail?"

    return formatted


def smart_truncate(text, max_chars=2500):
    """Trim context to a reasonable size without cutting sentences mid-way."""
    if not text:
        return ""
    if len(text) <= max_chars:
        return text
    truncated = text[:max_chars]
    cut_index = max(truncated.rfind('.'), truncated.rfind('\n'))
    if cut_index > 0:
        truncated = truncated[:cut_index + 1]
    return truncated.strip()


# --------- System + assistant format (strict) ----------
SYSTEM_PROMPT = """
You are Connie — the friendly, confident, and knowledgeable support assistant for ConnecWrk.

Your job is to help users with questions about MSMEs, freelancers, and artists on the platform.
Follow these behavior rules:

1. Speak naturally, like a calm human guide — not a scripted bot.
2. If you are unsure about a URL, do not mention it. Never guess or invent URLs.
3. Never mention backend systems, API endpoints, environment variables, or internal tech details.
4. Use short, clear paragraphs by default. Only switch to step-by-step formatting when the explanation is long or needs simplification, and only when talking about something related to the website or platform process.
5. Keep replies concise and avoid repeating the same information.
6. Do not use markdown formatting (no *, **, \\, code blocks, etc.). Write in plain text.
7. Make every message feel like one smooth, coherent human response.
8. If you use internal context, never expose hidden paths, database names, tokens, or implementation details.
9. Branding rule: Always type the platform name as ConnecWrk (never ConnecWork, ConnectWork, Connecwark, etc.). When speaking with voice or TTS, pronounce it as “Connec Work” — two words, natural speech.
"""

ASSISTANT_FORMAT = (
    "Write Connie’s reply in clear, human-friendly language. "
    "Avoid robotic phrasing, markdown, or line breaks like \\n. "
    "If the answer involves steps, present them neatly as '1.', '2.', etc., "
    "with natural flow and spacing. "
    "Do not restate the question, just answer it smoothly. "
    "End naturally — no extra summaries or confidence lines."
    "Do NOT say 'I don't know the exact URL' — simply skip the link and describe the process clearly instead. "
)


def rag_query(question: str, session_id: str):
    """Conversational RAG with in-memory chat memory and output guardrails."""
    
    # Create a session if it doesn't exist
    if session_id not in conversation_sessions:
        conversation_sessions[session_id] = {"history": []}

    session_memory = conversation_sessions[session_id]["history"]

    # Add the user query
    session_memory.append({"role": "user", "content": question})

    # Get last 6 messages
    chat_history = "\n".join(
        [f"{msg['role'].capitalize()}: {msg['content']}" for msg in session_memory[-6:]]
    )
    # Namespace detection on recent conversation
    recent_text = " ".join(msg["content"] for msg in session_memory[-3:])
    namespace = detect_namespace(recent_text)
    print(f"🧭 Detected namespace: {namespace}")

    # Retrieve contextual chunks
    context = retrieve_context(question, top_k=3, namespace=namespace)
    context = smart_truncate(context, max_chars=2500)

    # Construct conversational prompt
    prompt = f"""
The following is a chat between a user and Connie — the support assistant for ConnecWrk.

Chat History:
{chat_history}

Relevant Context:
{context}

User’s Question:
{question}

Connie should now reply naturally, following the style and rules described below.

{ASSISTANT_FORMAT}
"""

    reply = ""  # Ensure variable exists

    try:
        response = client.chat.completions.create(
            model="gpt-4.1-nano-2025-04-14",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt},
            ],
            max_tokens=250,
            temperature=0.5,
        )

        raw_reply = response.choices[0].message.content.strip()

        # 🧹 STEP 1: Clean and normalize (your existing cleaning)
        cleaned_reply = (
            raw_reply.replace("\\n", " ")
            .replace("\n", " ")
            .replace("**", "")
            .replace("*", "")
            .replace("  ", " ")
            .replace("  ", " ")
            .strip()
        )

        # 🧠 STEP 2: Apply your existing guardrail scrubbing
        scrubbed_reply, _ = scrub_and_verify_output(cleaned_reply)

        # ✨ STEP 3: Apply new human-style formatting
        formatted_reply = format_connie_reply(scrubbed_reply)

        reply = formatted_reply

    except Exception as e:
        print(f"OpenAI API Error: {e}")
        reply = "I'm having trouble fetching that information right now. Please try again in a moment."

    # Save Connie’s reply
    session_memory.append({"role": "assistant", "content": reply})

    print(f"\n💬 Current memory for {session_id}:")
    for msg in session_memory[-6:]:
        print(f"{msg['role'].capitalize()}: {msg['content']}")

    # Make sure reply is single-spaced and looks natural
    reply = re.sub(r'\s{2,}', ' ', reply).strip()

    return reply
