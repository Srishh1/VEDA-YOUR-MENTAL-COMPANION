import pandas as pd
from langchain_core.documents import Document

DATASET_PATH = "data/conversations_raw.csv"

df = pd.read_csv(DATASET_PATH)
df = df.dropna(subset=["Response"])

EXCLUDE_PHRASES = [
    "call 911",
    "emergency services",
    "suicide hotline",
    "hotline",
    "kill yourself",
    "end your life",
    "immediate danger",
    "contact authorities",
]

def is_safe_response(text) -> bool:
    if not isinstance(text, str):
        return False
    text_lower = text.lower()
    for phrase in EXCLUDE_PHRASES:
        if phrase in text_lower:
            return False
    return True

safe_df = df[df["Response"].apply(is_safe_response)]

documents = []

for _, row in safe_df.iterrows():
    doc = Document(
        page_content=row["Response"].strip(),
        metadata={
            "source": "nlp_mental_health_conversations",
            "tone": "supportive",
            "intent": "emotional_support",
            "has_context": bool(row.get("Context")),
        }
    )
    documents.append(doc)

print("Total LangChain documents:", len(documents))
print("Sample document:\n")
print(documents[0])


__all__ = ["documents"]
