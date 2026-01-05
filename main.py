from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional
from fastapi.middleware.cors import CORSMiddleware
from rag_engine import veda_reply

app = FastAPI()

# ---------------- CORS CONFIG ----------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",
        "http://127.0.0.1:8080",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- Request schema ----------------
class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = "local"


# ---------------- Simple in-memory conversation store ----------------
conversation_store = {}



# ---------------- Chat endpoint ----------------
@app.post("/chat")
def chat(req: ChatRequest):
    session_id = req.session_id or "local"

    if session_id not in conversation_store:
        conversation_store[session_id] = []

    history = conversation_store[session_id]

    # Get response from Veda's core logic
    reply = veda_reply(
        user_message=req.message,
        conversation_history=history
    )

# IMPORTANT: ensure reply is always a string
    if reply is None:
        reply = "I’m here with you. Something went quiet, but I’m listening."

    history.append({"role": "user", "content": req.message})
    history.append({"role": "assistant", "content": reply})

    return {"reply": reply}
