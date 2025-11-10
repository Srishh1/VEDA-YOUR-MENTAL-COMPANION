import os
from dotenv import load_dotenv
from pinecone import Pinecone

load_dotenv()

# === Setup Pinecone client ===
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
index_name = os.getenv("PINECONE_INDEX")
index = pc.Index(index_name)

# === Choose which namespace to inspect ===
namespace = input("Enter namespace to inspect  ").strip()
limit = int(input("How many chunks to preview? (default 5): ") or 5)

print(f"\n🔍 Inspecting {limit} chunks from namespace: '{namespace}' in index '{index_name}'")

# === Query Pinecone for vectors (we don’t need a real embedding here) ===
results = index.query(
    namespace=namespace,
    vector=[0] * 1024,      # dummy zero vector to fetch top items
    top_k=limit,
    include_metadata=True,
    include_values=False    # we only care about metadata + text
)

matches = results.get("matches", [])
if not matches:
    print(f"⚠️ No chunks found in namespace '{namespace}'.")
else:
    for idx, match in enumerate(matches, start=1):
        meta = match.get("metadata", {})
        text = meta.get("text", "")
        print(f"\n--- 🧩 Chunk {idx}/{limit} ---")
        print(f"📜 Text:\n{text[:500]}{'...' if len(text) > 500 else ''}")
        print(f"🏷️ Metadata:\n{meta}")
        print("-" * 80)
