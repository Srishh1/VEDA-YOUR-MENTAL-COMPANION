# delete_namespace.py
import os
from dotenv import load_dotenv
from pinecone import Pinecone

load_dotenv()

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_INDEX = os.getenv("PINECONE_INDEX")
PINECONE_ENVIRONMENT = os.getenv("PINECONE_ENVIRONMENT", "us-east-1")

pc = Pinecone(api_key=PINECONE_API_KEY, environment=PINECONE_ENVIRONMENT)
index = pc.Index(PINECONE_INDEX)

namespace = input("Enter namespace to delete: ")

confirm = input(f"⚠️ Are you sure you want to delete namespace '{namespace}'? (y/n): ")
if confirm.lower() == "y":
    index.delete(delete_all=True, namespace=namespace)
    print(f"✅ Deleted namespace: {namespace}")
else:
    print("❌ Operation cancelled.")
