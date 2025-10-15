from fastapi import FastAPI
from pydantic import BaseModel
import pandas as pd
import joblib
import os

app = FastAPI()
model = joblib.load("model.pkl")

class InputData(BaseModel):
    file_path: str

@app.post("/predict")
def predict(inp: InputData):
    if not os.path.exists(inp.file_path):
        return {"error": f"File not found: {inp.file_path}"}

    df = pd.read_csv(inp.file_path)

    # ✅ Expected columns from training
    expected_cols = [
        'duration', 'protocol_type', 'service', 'flag',
        'src_bytes', 'dst_bytes', 'land', 'wrong_fragment',
        'urgent', 'hot', 'num_failed_logins', 'num_compromised'
    ]

    # ✅ Add missing columns with default values
    for col in expected_cols:
        if col not in df.columns:
            df[col] = 0

    # ✅ Reorder to match training
    df = df[expected_cols]

    preds = model.predict(df)
    results = ["Attack ⚠️" if p == "attack" else "Normal ✅" for p in preds]
    total_attacks = sum(1 for r in results if "⚠️" in r)

    summary = f"{total_attacks} attacks detected out of {len(results)} rows"
    return {"summary": summary, "results": results}
