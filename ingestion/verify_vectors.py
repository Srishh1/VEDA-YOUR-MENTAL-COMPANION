import os
from dotenv import load_dotenv
from pinecone import Pinecone

load_dotenv()

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_ENVIRONMENT = os.getenv("PINECONE_ENVIRONMENT")
PINECONE_INDEX = os.getenv("PINECONE_INDEX")

pc = Pinecone(api_key=PINECONE_API_KEY, environment=PINECONE_ENVIRONMENT)
index = pc.Index(PINECONE_INDEX)

# Verify namespace and count
stats = index.describe_index_stats()
print("📊 Current index stats:")
print(stats)

# Try fetching one vector
print("\n🔍 Fetching first vector (if exists)...")
result = index.query(vector=[0.1]*1024, top_k=1, namespace="Msme_Connect_owner_Visitor", include_metadata=True)
print(result)
