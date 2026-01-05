# Ved 🌑  
**Your rhythm in dark**

Ved is a calm, emotionally present conversational companion designed to sit with users during heavy or overwhelming moments.  
It is not a therapist, not a diagnostic tool, and not a productivity chatbot — Ved’s role is presence, reflection, and gentle grounding.

This project is a personal, open-source, full-stack AI system built using:
- A custom frontend (Lovable → React)
- A FastAPI backend
- A local open-source LLM via Ollama
- Optional RAG (retrieval-augmented generation)
- Session-based memory (no login required)

---

## ✨ What Ved Is (and Isn’t)

 Ved is:
- Emotion-first and presence-based  
- Calm, warm, and non-clinical  
- Designed for short, reflective conversations  
- Local-first and privacy-respecting  

 Ved is not:
- A therapist or medical professional  
- A diagnostic or crisis-response system  
- Advice-heavy or instructional  



## 🧠 How Ved Works 

Frontend (React)
↓
FastAPI backend (/chat)
↓
Veda Engine (prompt + memory)
↓
Ollama (local LLM: mistral)
↓
Response back to UI

- The frontend is responsible **only for UI**
- All intelligence lives in the backend
- The LLM runs **locally** using Ollama
- No user accounts, no tracking, no external APIs required


---

## 🚀 Getting Started (Local Setup)

1️⃣ Prerequisites

- Python 3.10+
- Node.js 18+
- Ollama installed → https://ollama.com


2️⃣ Clone the repo

```bash
git clone https://github.com/<your-username>/veda-bot.git
cd veda-bot

3️⃣ Set up Python backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

4️⃣ Install the LLM (one-time)
ollama pull mistral

5️⃣ Run the backend
uvicorn main:app --reload

6️⃣ Run the frontend
cd frontend/veda
npm install
npm run dev

----

###💬 Session Memory (No Login Required)

-Ved uses session-based memory, not user       accounts.
-Each browser session is assigned a random session_id
-Memory lasts for the duration of the session
-Closing the tab starts a fresh conversation
-No authentication or personal data is stored
-This is intentional and appropriate for a mental-health-adjacent companion.

###📚 Retrieval-Augmented Generation (Optional)

-If vectorstore.py is present and configured:
-Ved can retrieve relevant background context
-Context is injected gently, never quoted directly
-Emotional presence always comes before factual grounding
-RAG failures are handled safely and never block responses.

### ⚡ Performance Notes

-First response may take ~3 seconds (model warm-up)
-Subsequent responses typically ~1.5–2 seconds
-Designed for perceived calm, not rapid-fire replies

###🛡️ Safety & Ethics

-Veda does not diagnose, treat, or provide medical advice
-Responses are non-clinical and non-authoritative
-Crisis language is avoided unless explicitly prompted
-Memory is short-term and user-controlled
-This project is intended for learning, exploration, and personal use.

###🧪 Development Notes

-Backend logic lives entirely in engine.py
-main.py is intentionally thin (API glue only)
-Frontend contains no prompt logic
-LLM can be swapped easily via Ollama