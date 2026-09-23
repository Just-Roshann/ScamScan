from app.schemas import Signal, AiAnalysisResponse, AiReason
from app.scoring import (
    compute_raw_score,
    apply_score_overrides,
    determine_verdict,
    merge_top_reasons,
)

def test_scoring_rules_only():
    signals = [
        Signal(id="test_1", category="urgency", title="Urgent", detail="Time pressure", weight=12, evidence="act now"),
        Signal(id="test_2", category="money", title="Reward", detail="Lottery", weight=15, evidence="won cash"),
    ]
    rule_score, final_score = compute_raw_score(signals, None)
    adjusted_score = apply_score_overrides(rule_score, final_score, signals, None)
    assert adjusted_score == 27
    assert determine_verdict(adjusted_score) == "Looks Safe"

def test_override_weight_25():
    signals = [
        Signal(id="test_otp", category="credentials", title="OTP Ask", detail="Asks for OTP", weight=25, evidence="share OTP")
    ]
    rule_score, final_score = compute_raw_score(signals, None)
    adjusted_score = apply_score_overrides(rule_score, final_score, signals, None)
    assert adjusted_score >= 60
    assert determine_verdict(adjusted_score) == "Dangerous"

def test_override_ai_high_confidence():
    signals = [
        Signal(id="test_urg", category="urgency", title="Urgency", detail="Pressure", weight=20, evidence="now")
    ]
    ai_response = AiAnalysisResponse(
        ai_risk=80,
        scam_type="bank_kyc",
        confidence="high",
        reasons=[],
        safe_actions=[],
        summary="This is a known banking phishing scam."
    )
    rule_score, final_score = compute_raw_score(signals, ai_response)
    adjusted_score = apply_score_overrides(rule_score, final_score, signals, ai_response)
    assert adjusted_score >= 70
    assert determine_verdict(adjusted_score) == "Dangerous"

def test_override_no_rules_low_ai():
    signals = []
    ai_response = AiAnalysisResponse(
        ai_risk=10,
        scam_type="none",
        confidence="low",
        reasons=[],
        safe_actions=[],
        summary="Content looks legitimate."
    )
    rule_score, final_score = compute_raw_score(signals, ai_response)
    adjusted_score = apply_score_overrides(rule_score, final_score, signals, ai_response)
    assert adjusted_score <= 15
    assert determine_verdict(adjusted_score) == "Looks Safe"

def test_top_reasons_dedup_and_cap():
    signals = [
        Signal(id="s1", category="urgency", title="Urgency 1", detail="d1", weight=12, evidence="e1"),
        Signal(id="s2", category="urgency", title="Urgency 2", detail="d2", weight=10, evidence="e2"),
        Signal(id="s3", category="money", title="Money", detail="d3", weight=15, evidence="e3"),
    ]
    reasons = merge_top_reasons(signals, None)
    assert len(reasons) == 2
    assert reasons[0].category == "money"
    assert reasons[1].category == "urgency"
