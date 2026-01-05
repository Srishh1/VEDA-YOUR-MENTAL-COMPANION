import pandas as pd

DATASET_PATH = "data/conversations_raw.csv"

df = pd.read_csv(DATASET_PATH)

print("Dataset shape:", df.shape)
print("\nColumn names:")
print(df.columns.tolist())

print("\nSample rows:")
print(df.head(3))
