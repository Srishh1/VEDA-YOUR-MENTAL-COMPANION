from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
from chunk_docs import chunked_documents

PERSIST_DIR = "vectorstore/chroma_mh"

# Embedding model (same family you used earlier)
embedding = HuggingFaceEmbeddings(
    model_name="intfloat/multilingual-e5-large"
)

vectorstore = Chroma.from_documents(
    documents=chunked_documents,
    embedding=embedding,
    persist_directory=PERSIST_DIR
)

vectorstore.persist()

print("✅ Vector store built and persisted")
print("Total vectors:", len(chunked_documents))
