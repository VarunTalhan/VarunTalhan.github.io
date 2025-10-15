import requests
import json

data = {"file_path": "sample_traffic.csv"}
resp = requests.post("http://127.0.0.1:8000/predict", json=data)
print("Server reply:", resp.text)
