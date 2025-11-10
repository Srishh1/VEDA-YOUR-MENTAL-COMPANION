import fitz  # PyMuPDF
import hashlib
import os

def read_and_chunk_pdf(file_path, chunk_size=800, overlap=100):
    """
    Reads a PDF file, extracts text, and splits it into overlapping chunks.

    Args:
        file_path (str): Path to the PDF file.
        chunk_size (int): Number of words per chunk.
        overlap (int): Overlap between consecutive chunks.

    Returns:
        list: List of chunk dictionaries with id, text, and metadata.
    """
    doc = fitz.open(file_path)
    all_text = ""
    for page_num, page in enumerate(doc, start=1):
        text = page.get_text("text").strip()
        if text:
            all_text += text + "\n"

    words = all_text.split()
    chunks = []
    i = 0
    while i < len(words):
        chunk_words = words[i:i + chunk_size]
        text_chunk = " ".join(chunk_words)
        chunk_id = hashlib.md5(text_chunk.encode()).hexdigest()
        chunks.append({
            "id": f"{os.path.basename(file_path)}_{chunk_id}",
            "text": text_chunk,
            "metadata": {
                "source": os.path.basename(file_path),
                "chunk_index": len(chunks),
            }
        })
        i += chunk_size - overlap

    print(f"📚 Created {len(chunks)} chunks from {os.path.basename(file_path)}")
    return chunks
