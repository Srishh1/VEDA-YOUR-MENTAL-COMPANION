from fastapi import FastAPI, Request
from pydantic import BaseModel
from rag_engine import rag_query
import uuid

app = FastAPI()

# === Request Schema ===
class QueryRequest(BaseModel):
    query: str

@app.post("/rag-query")
def rag_endpoint(request: QueryRequest, fastapi_request: Request):
    """
    Handles RAG queries with auto-generated session IDs.
    For now: no user context, no login detection.
    """

    # Temporary automatic session ID (based on client IP + random token)
    client_ip = fastapi_request.client.host
    session_id = f"{client_ip}-{uuid.uuid4().hex[:8]}"

    # Run RAG engine
    answer = rag_query(request.query, session_id)

    return {
        "connie_reply": answer,
    }
