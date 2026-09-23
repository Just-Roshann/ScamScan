from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_samples_endpoint():
    response = client.get("/api/samples")
    assert response.status_code == 200
    samples = response.json()
    assert isinstance(samples, list)
    assert len(samples) >= 12

def test_history_and_stats_endpoint():
    client.post("/api/analyze", json={"type": "message", "content": "Hello test message from pytest"})
    history_response = client.get("/api/history")
    assert history_response.status_code == 200
    history = history_response.json()
    assert len(history) > 0

    stats_response = client.get("/api/stats")
    assert stats_response.status_code == 200
    stats = stats_response.json()
    assert stats["total_scans"] > 0
    assert "Looks Safe" in stats["verdict_counts"]
