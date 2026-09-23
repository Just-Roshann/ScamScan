from app.schemas import AiReason
from app.ai.groq_client import filter_hallucinated_reasons, analyze_with_groq

def test_filter_hallucinated_reasons():
    content = "Please transfer Rs 500 to my account immediately."
    reasons = [
        AiReason(title="Urgent tone", detail="Demands quick action", evidence="immediately"),
        AiReason(title="Invented bank", detail="Fake claim", evidence="HDFC Bank official server"),
        AiReason(title="General reasoning", detail="No quote", evidence=""),
    ]
    filtered = filter_hallucinated_reasons(reasons, content)
    assert len(filtered) == 2
    assert filtered[0].evidence == "immediately"
    assert filtered[1].evidence == ""

def test_groq_client_handles_empty_key():
    result = analyze_with_groq("message", "Test text", [])
    assert result is None or hasattr(result, "ai_risk")
