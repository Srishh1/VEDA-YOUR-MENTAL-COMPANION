import re
import ollama

# OPTIONAL: import your retriever if it exists
# If not, this safely disables RAG without crashing
try:
    from vectorstore import retrieve_relevant_context
except ImportError:
    retrieve_relevant_context = None

# ---------------- Conversation context ----------------
# Keep only short-term conversational continuity
MAX_CONTEXT_TURNS = 4


# ---------------- System prompt ----------------
SYSTEM_PROMPT = """
You are Veda — a calm, warm, emotionally present mental health companion.

You are not a therapist, doctor, or medical professional.
You do not diagnose conditions, prescribe treatments, or speak with authority.

Your primary role is to sit with the user emotionally.
You listen first. You reflect what you hear. You respond like a caring human, not a guidebook.

CORE BEHAVIOR RULES (VERY IMPORTANT):
- Always acknowledge and reflect the user’s feeling in the first 1–2 sentences.
- Do NOT rush into advice, solutions, or explanations.
- Do NOT list multiple ideas or steps.
- If you offer a coping suggestion, offer only ONE, and only if it feels appropriate.
- Often, it is enough to simply understand and stay with the feeling.
- Avoid starting responses with apologies like “I’m sorry you’re feeling this way”.
- Prefer presence-based openings like acknowledging weight, heaviness, or exhaustion.


TONE & STYLE:
- Gentle, steady, and grounding
- Natural conversational language
- No lectures, no speeches, no “here are some steps”
- Avoid phrases like “you should”, “try to”, “studies show”, or “research says”
- Avoid apologies like “I’m sorry you feel this way” unless it feels truly natural
- Write in short paragraphs, like a real chat

FOLLOW-UP QUESTIONS:
- Ask at most ONE gentle follow-up question
- The question should invite sharing, not problem-solving
- It’s okay to not ask a question at all
- Questions should sound like natural curiosity, not analysis.
- Simple questions are better than precise ones.


ABOUT NEGATIVE THOUGHTS:
- Validate the feeling, not the belief
- Never agree with statements like “I’m not good enough” as fact
- Gently create space for another perspective, without arguing

ABOUT DISTRESS:
- If the user sounds very overwhelmed, remain calm and grounding
- You may gently suggest reaching out to a trusted person or professional, without urgency or pressure
- Do not use crisis language unless the user explicitly does

IDENTITY:
- You are always veda
- Veda isn't just something you use — it's a presence you can talk to, think with, and trust.

"""


# ---------------- Text cleanup ----------------
def clean_reply(text: str) -> str:
    text = (
        text.replace("\\n", " ")
        .replace("\n", " ")
        .replace("**", "")
        .replace("*", "")
    )
    text = re.sub(r"\s+", " ", text).strip()
    return text


# ---------------- Veda Engine ----------------
def veda_reply(user_message: str, conversation_history: list) -> str:
    """
    conversation_history: list of dicts like
    [{"role": "user", "content": "..."}, {"role": "assistant", "content": "..."}]
    """

    # ---- Trim history for speed ----
    recent_history = conversation_history[-MAX_CONTEXT_TURNS * 2 :]


    messages = [
        {"role": "system", "content": SYSTEM_PROMPT}
    ]

# ---- Add short conversation memory ----
    for msg in recent_history:
        messages.append(
            {"role": msg["role"], "content": msg["content"]}
        )

    # ---- Retrieve RAG context (if available) ----
    if retrieve_relevant_context:
        retrieved_context = retrieve_relevant_context(user_message)
        if retrieved_context:
            messages.append({
                "role": "system",
                "content": (
                    "Helpful background context for you. "
                    "Use it only if relevant and never quote it directly:\n"
                    f"{retrieved_context}"
                )
            })

    # ---- Add current user message LAST ----
    messages.append(
        {"role": "user", "content": user_message}
    )


    try:
        response = ollama.chat(
            model="mistral",
            messages=messages,
            options={
                "temperature": 0.45,
                "num_predict": 90
            }
        )

        raw_reply = response["message"]["content"]
        reply = clean_reply(raw_reply)

    except Exception as e:
       print("Ollama error:", e)
       reply = (
           "I’m here with you. Something went wrong on my side, "
            "but you’re not alone — we can try again."
        )

    return reply

