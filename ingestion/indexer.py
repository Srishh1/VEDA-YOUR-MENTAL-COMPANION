import os
import re
import json
import hashlib
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer
from pinecone import Pinecone
from ingestion.chunker import read_and_chunk_pdf

# === Load environment variables ===
load_dotenv()

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_INDEX = os.getenv("PINECONE_INDEX")
PINECONE_ENVIRONMENT = os.getenv("PINECONE_ENVIRONMENT", "us-east-1")

DOCS_DIR = "data/docs"
LOG_FILE = "ingestion/ingest_log.json"

# === Init Pinecone + embedding model ===
pc = Pinecone(api_key=PINECONE_API_KEY, environment=PINECONE_ENVIRONMENT)
index = pc.Index(PINECONE_INDEX)
model = SentenceTransformer("intfloat/multilingual-e5-large")

MAP_PATH = os.path.join("data", "namespace_map.json")

def compute_file_hash(file_path):
    """Compute MD5 hash of file contents (not just name)."""
    with open(file_path, "rb") as f:
        file_bytes = f.read()
        return hashlib.md5(file_bytes).hexdigest()

def load_namespace_map():
    if os.path.exists(MAP_PATH):
        with open(MAP_PATH, "r") as f:
            return json.load(f)
    return {}

def save_namespace_map(mapping):
    with open(MAP_PATH, "w") as f:
        json.dump(mapping, f, indent=2)


# === Utility: load & save local log ===
def load_log():
    if os.path.exists(LOG_FILE):
        with open(LOG_FILE, "r") as f:
            return json.load(f)
    return {}

def save_log(log):
    with open(LOG_FILE, "w") as f:
        json.dump(log, f, indent=2)

# === Helper: sanitize namespace ===
def sanitize_namespace(name: str) -> str:
    return re.sub(r"[^a-zA-Z0-9_-]", "_", name)

# === Helper: compute MD5 hash of a file ===
def compute_md5(file_path: str) -> str:
    with open(file_path, "rb") as f:
        data = f.read()
    return hashlib.md5(data).hexdigest()

# === Helper: check if document already exists in Pinecone ===
def document_exists(namespace: str, source_hash: str) -> bool:
    try:
        res = index.query(
            vector=[0.0] * 1024,
            top_k=1,
            filter={"source_hash": {"$eq": source_hash}},
            namespace=namespace,
            include_metadata=False
        )
        return len(res.get("matches", [])) > 0
    except Exception:
        return False

# === Main indexing logic ===
def index_pdfs():
    log = load_log()

    for root, dirs, files in os.walk(DOCS_DIR):
        for filename in files:
            if not filename.endswith(".pdf"):
                continue

            file_path = os.path.join(root, filename)

            # Derive namespace (folder name or file name if top-level)
            namespace_map = load_namespace_map()
            file_hash = compute_file_hash(file_path)

            # === Reuse existing namespace if content is same ===
            if file_hash in namespace_map:
                namespace = namespace_map[file_hash]
            else:
                namespace = sanitize_namespace(os.path.splitext(filename)[0])
                namespace_map[file_hash] = namespace
                save_namespace_map(namespace_map)

            file_hash = compute_md5(file_path)

            # === Skip if already indexed ===
            if log.get(file_path) == file_hash:
                print(f"✅ Skipping (no change): {filename}")
                continue

            # === Skip if same file already exists in Pinecone ===
            if document_exists(namespace, file_hash):
                print(f"✅ Already exists in Pinecone: {filename}")
                log[file_path] = file_hash
                continue

            # === Otherwise, index new/updated file ===
            print(f"\n🚀 Indexing new/updated file: {filename} → namespace '{namespace}'")
            chunks = read_and_chunk_pdf(file_path)
            vectors = []

            for ch in chunks:
                emb = model.encode(ch["text"]).tolist()
                ch["metadata"].update({
                    "source_hash": file_hash,
                    "source_file": filename
                })
                vectors.append({
                    "id": ch["id"],
                    "values": emb,
                    "metadata": {
                        **ch["metadata"],
                        "text": ch["text"]  
                    }
                })

            if vectors:
                index.upsert(vectors=vectors, namespace=namespace)
                print(f"✅ Uploaded {len(vectors)} chunks → namespace '{namespace}'")

            # Update local log
            log[file_path] = file_hash
            save_log(log)


    # === Show final index stats ===
stats = index.describe_index_stats()
print("\n📊 Updated Pinecone index stats:")

# Handle both dict and object response
if isinstance(stats, dict):
    print(json.dumps(stats, indent=2))
else:
    try:
        print(json.dumps(stats.to_dict(), indent=2))
    except AttributeError:
        print(stats)


if __name__ == "__main__":
    print(f"📍 Environment: {PINECONE_ENVIRONMENT}")
    print(f"📦 Target index: {PINECONE_INDEX}")
    index_pdfs()
    print("\n🎯 Smart ingestion complete (duplicates skipped).")
