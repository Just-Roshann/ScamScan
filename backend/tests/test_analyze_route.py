from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_analyze_empty_content_rejected():
    response = client.post("/api/analyze", json={"type": "message", "content": "   "})
    assert response.status_code == 400

def test_analyze_suspicious_message():
    payload = {
        "type": "message",
        "content": "Dear customer, your account will be blocked within 24 hours. Update KYC immediately at http://sbi-kyc-verify.top",
    }
    response = client.post("/api/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["verdict"] in ["Dangerous", "Suspicious"]
    assert data["score"] >= 30
    assert len(data["reasons"]) > 0
    assert len(data["urls"]) > 0

def test_analyze_safe_message():
    payload = {
        "type": "message",
        "content": "Hey bro, are we meeting at the cafe this evening for dinner?",
    }
    response = client.post("/api/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["verdict"] == "Looks Safe"
    assert data["score"] < 30
