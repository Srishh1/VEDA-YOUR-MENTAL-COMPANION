# namespace_router.py
import json
import os
from openai import OpenAI
from dotenv import load_dotenv
from pinecone import Pinecone

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_INDEX = os.getenv("PINECONE_INDEX")
PINECONE_ENVIRONMENT = os.getenv("PINECONE_ENVIRONMENT", "us-east-1")

pc = Pinecone(api_key=PINECONE_API_KEY, environment=PINECONE_ENVIRONMENT)
index = pc.Index(PINECONE_INDEX)

def detect_namespace(question: str) -> str:
    """Ask the LLM which namespace the query belongs to."""
    try:
        stats = index.describe_index_stats()
        available_namespaces = list(stats.get("namespaces", {}).keys())

        prompt = f"""
        You are Connie, the Connecverse AI assistant.

        Available knowledge areas (namespaces):
        {available_namespaces}

        Based on the user's question, decide which namespace is most relevant.
        Return only the namespace name exactly as listed.

        Question:
        "{question}"
        """

        response = client.chat.completions.create(
            model="gpt-4.1-nano-2025-04-14",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
        )

        ns = response.choices[0].message.content.strip()
        if ns in available_namespaces:
            print(f"🧭 Detected namespace: {ns}")
            return ns

        print("⚠️ Could not confidently detect namespace, using default (None)")
        return None

    except Exception as e:
        print(f"⚠️ Namespace detection failed: {e}")
        return None
