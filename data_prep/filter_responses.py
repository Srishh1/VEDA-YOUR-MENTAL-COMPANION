import pandas as pd

DATASET_PATH = "data/conversations_raw.csv"

df = pd.read_csv(DATASET_PATH)

# Drop rows where Response is missing
df = df.dropna(subset=["Response"])

EXCLUDE_PHRASES = [
    "call 911",
    "emergency services",
    "suicide hotline",
    "hotline",
    "kill yourself",
    "end your life",
    "immediate danger",
    "hospitalized immediately",
    "contact authorities",
    "you must seek immediate",
]

def is_safe_response(text) -> bool:
    # Ensure text is a string
    if not isinstance(text, str):
        return False

    text_lower = text.lower()
    for phrase in EXCLUDE_PHRASES:
        if phrase in text_lower:
            return False
    return True

safe_df = df[df["Response"].apply(is_safe_response)]

print("Original rows:", len(df))
print("Safe rows:", len(safe_df))
print("Removed rows:", len(df) - len(safe_df))
