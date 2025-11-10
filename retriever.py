import os
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer
from pinecone import Pinecone

load_dotenv()

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_INDEX = os.getenv("PINECONE_INDEX")
PINECONE_ENVIRONMENT = os.getenv("PINECONE_ENVIRONMENT", "us-east-1")

pc = Pinecone(api_key=PINECONE_API_KEY, environment=PINECONE_ENVIRONMENT)
index = pc.Index(PINECONE_INDEX)
model = SentenceTransformer("intfloat/multilingual-e5-large")

def retrieve_context(query: str, top_k: int = 5, namespace: str = None):
    """Fetch top matching chunks from Pinecone for the query."""
    query_emb = model.encode(query).tolist()
    res = index.query(
        vector=query_emb,
        top_k=top_k,
        include_metadata=True,
        namespace=namespace
    )
    contexts = [match["metadata"]["text"] for match in res["matches"]]
    return "\n\n".join(contexts)
