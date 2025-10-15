# train_model.py
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
import joblib
import numpy as np

# -------------------------------------------------
# 1️⃣  Build a small synthetic "network-like" dataset
# -------------------------------------------------
n = 4000
rng = np.random.default_rng(42)
df = pd.DataFrame({
    "duration": rng.integers(0, 500, n),
    "protocol_type": rng.choice(["tcp", "udp", "icmp"], n),
    "service": rng.choice(["http", "private", "ecr_i", "ftp"], n),
    "flag": rng.choice(["SF", "S0", "REJ"], n),
    "src_bytes": rng.integers(0, 10000, n),
    "dst_bytes": rng.integers(0, 10000, n),
    "land": rng.choice([0, 1], n),
    "wrong_fragment": rng.integers(0, 3, n),
    "urgent": rng.integers(0, 3, n),
    "hot": rng.integers(0, 5, n),
    "num_failed_logins": rng.integers(0, 5, n),
    "num_compromised": rng.integers(0, 10, n),
})
# label: 0 = normal, 1 = attack
df["label"] = np.where(
    (df["src_bytes"] > 8000) | (df["num_compromised"] > 5), "attack", "normal"
)

# -------------------------------------------------
# 2️⃣  Split data
# -------------------------------------------------
X = df.drop(columns=["label"])
y = df["label"]
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# -------------------------------------------------
# 3️⃣  Build preprocessing + model pipeline
# -------------------------------------------------
cat_cols = X.select_dtypes(include=["object"]).columns
num_cols = X.select_dtypes(exclude=["object"]).columns

preprocessor = ColumnTransformer(
    transformers=[
        ("cat", OneHotEncoder(handle_unknown="ignore"), cat_cols),
        ("num", "passthrough", num_cols)
    ]
)

model = RandomForestClassifier(n_estimators=120, random_state=42, n_jobs=-1)
pipeline = Pipeline([("preprocessor", preprocessor),
                     ("model", model)])

# -------------------------------------------------
# 4️⃣  Train and evaluate
# -------------------------------------------------
pipeline.fit(X_train, y_train)
acc = pipeline.score(X_test, y_test)
print(f"✅ Model trained. Accuracy: {acc:.3f}")

# -------------------------------------------------
# 5️⃣  Save model and sample CSV
# -------------------------------------------------
joblib.dump(pipeline, "model.pkl")
print("✅ Saved model pipeline to model.pkl")

sample = X.sample(50, random_state=7)
sample.to_csv("sample_traffic.csv", index=False)
print("✅ Wrote sample_traffic.csv (50 rows)")
