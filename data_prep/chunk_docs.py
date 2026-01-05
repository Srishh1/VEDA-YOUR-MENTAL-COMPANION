from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
import pickle

# Import documents from previous step
from build_docs import documents  # make sure build_docs.py exposes `documents`

text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=600,
    chunk_overlap=80,
    separators=["\n\n", "\n", ". "]
)

chunked_documents = text_splitter.split_documents(documents)

print("Original documents:", len(documents))
print("Chunked documents:", len(chunked_documents))

print("\nSample chunk:\n")
print(chunked_documents[0])


__all__ = ["chunked_documents"]
