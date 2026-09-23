import json
from pathlib import Path
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_samples_accuracy_rules_only(monkeypatch):
    monkeypatch.setattr("app.routes.analyze_with_groq", lambda *args, **kwargs: None)
    samples_path = Path(__file__).resolve().parent.parent / "samples" / "demo_cases.json"
    with open(samples_path, "r", encoding="utf-8") as f:
        samples = json.load(f)

    total_count = len(samples)
    correct_count = 0
    results_table = []

    for item in samples:
        input_type = item["type"]
        actual_type = "url" if input_type == "website" else input_type
        response = client.post("/api/analyze", json={"type": actual_type, "content": item["content"]})
        assert response.status_code == 200
        data = response.json()
        got_verdict = data["verdict"]
        expected = item["expected_verdict"]

        is_match = got_verdict == expected or (expected in ["Dangerous", "Suspicious"] and got_verdict in ["Dangerous", "Suspicious"])
        if is_match:
            correct_count += 1
        results_table.append((item["id"], item["title"], expected, got_verdict, "PASS" if is_match else "FAIL"))

    print("\n" + "=" * 80)
    print(f"{'ID':<25} | {'EXPECTED':<12} | {'GOT':<12} | {'RESULT'}")
    print("-" * 80)
    for sample_id, title, expected, got, status in results_table:
        print(f"{sample_id:<25} | {expected:<12} | {got:<12} | {status}")
    accuracy = (correct_count / total_count) * 100
    print("-" * 80)
    print(f"Total: {total_count}, Correct: {correct_count}, Accuracy: {accuracy:.1f}%")
    print("=" * 80)

    assert accuracy >= 90.0
