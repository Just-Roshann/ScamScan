from typing import List, Optional, Tuple
from app.schemas import Signal, ReasonItem, AiAnalysisResponse

VERDICT_MESSAGES = {
    "Looks Safe": "No strong warning signs found. Still stay careful.",
    "Suspicious": "Some warning signs. Verify from the official source before acting.",
    "Dangerous": "Very likely a scam. Do not click, pay, or share anything.",
}

DEFAULT_SAFE_ACTIONS = {
    "Dangerous": [
        "Do not click links, open attachments, or reply to this communication.",
        "Never share OTPs, passwords, or UPI PINs with anyone.",
        "Report the scam immediately at cybercrime.gov.in or call 1930.",
        "Forward suspicious SMS to 7726 or report to Sanchar Saathi Chakshu.",
    ],
    "Suspicious": [
        "Verify independently through the organization's official app or portal.",
        "Do not enter passwords or banking credentials on unverified forms.",
        "Double-check the exact domain name and email sender address.",
    ],
    "Looks Safe": [
        "Stay alert and never disclose one-time passwords.",
        "Ensure website connections use official domains with valid HTTPS.",
    ],
}

def determine_rule_scam_type(signals: List[Signal]) -> str:
    signal_ids = {s.id for s in signals}
    if "text_sextortion" in signal_ids:
        return "sextortion"
    if "text_kyc" in signal_ids:
        return "bank_kyc"
    if "url_brand_lure" in signal_ids or "url_deceptive_lure" in signal_ids or "text_reward" in signal_ids:
        return "lottery_reward"
    if "text_credentials" in signal_ids or "url_brand_lookalike" in signal_ids or "url_brand_subdomain" in signal_ids:
        return "phishing"
    if "text_investment" in signal_ids:
        return "investment"
    if "text_payment" in signal_ids:
        return "upi_payment"
    if "text_job" in signal_ids:
        return "job_task"
    if "text_courier_bill" in signal_ids:
        return "courier_bill"
    if "text_remote_access" in signal_ids:
        return "tech_support"
    if "text_threat" in signal_ids:
        return "impersonation"
    return "phishing" if signals else "none"

def compute_raw_score(signals: List[Signal], ai_response: Optional[AiAnalysisResponse]) -> Tuple[int, int]:
    rule_score = min(100, sum(s.weight for s in signals))
    if ai_response is not None:
        # When rules already show strong evidence, don't let AI drag the score down
        if rule_score >= 40:
            ai_weight = 0.30
        elif rule_score >= 20:
            ai_weight = 0.40
        else:
            ai_weight = 0.45
        rule_weight = 1.0 - ai_weight
        final_score = round(rule_weight * rule_score + ai_weight * ai_response.ai_risk)
    else:
        final_score = rule_score
    return rule_score, final_score

def apply_score_overrides(rule_score: int, initial_score: int, signals: List[Signal], ai_response: Optional[AiAnalysisResponse]) -> int:
    score = initial_score

    # Any single high-weight signal (credential theft, sextortion, brand lookalike) floors at 55
    has_high_weight_signal = any(s.weight >= 20 for s in signals)
    if has_high_weight_signal:
        score = max(score, 55)
        # High-weight signal + any other signal = almost certainly a scam
        if len(signals) >= 2:
            score = max(score, 62)

    # Highest weight signal (credential theft at 25) floors at 65
    has_critical_signal = any(s.weight >= 25 for s in signals)
    if has_critical_signal:
        score = max(score, 65)

    # Multiple rule signals combined = likely scam
    if len(signals) >= 3 and rule_score >= 25:
        score = max(score, 50)

    # AI high confidence scam override
    if ai_response and ai_response.confidence == "high" and ai_response.scam_type != "none":
        if ai_response.ai_risk >= 70:
            score = max(score, min(95, ai_response.ai_risk))
        elif ai_response.ai_risk >= 50:
            score = max(score, 70)
        elif rule_score >= 15:
            score = max(score, 65)

    # AI medium confidence + rules corroborate
    if ai_response and ai_response.confidence == "medium" and ai_response.scam_type != "none":
        if ai_response.ai_risk >= 50 and rule_score >= 15:
            score = max(score, 55)
        elif ai_response.ai_risk >= 60:
            score = max(score, 50)

    # AI confirms scam type + rules have at least 2 signals → floor at "Dangerous"
    if ai_response and ai_response.scam_type != "none" and len(signals) >= 2:
        score = max(score, 60)

    # Only mark as safe if both rules AND AI agree it's clean
    if not signals and (ai_response is None or ai_response.ai_risk < 20):
        score = min(score, 15)

    return min(100, max(0, score))

def determine_verdict(final_score: int) -> str:
    if final_score >= 60:
        return "Dangerous"
    if final_score >= 30:
        return "Suspicious"
    return "Looks Safe"

def merge_top_reasons(signals: List[Signal], ai_response: Optional[AiAnalysisResponse]) -> List[ReasonItem]:
    all_reasons = []
    seen_categories = set()
    for sig in sorted(signals, key=lambda s: s.weight, reverse=True):
        if sig.category not in seen_categories:
            seen_categories.add(sig.category)
            all_reasons.append(
                ReasonItem(
                    title=sig.title,
                    detail=sig.detail,
                    evidence=sig.evidence,
                    category=sig.category,
                    source="rules",
                    weight=sig.weight,
                )
            )
    if ai_response:
        for ai_r in ai_response.reasons:
            if "ai" not in seen_categories or len(all_reasons) < 6:
                seen_categories.add("ai")
                all_reasons.append(
                    ReasonItem(
                        title=ai_r.title,
                        detail=ai_r.detail,
                        evidence=ai_r.evidence,
                        category="ai",
                        source="ai",
                        weight=20,
                    )
                )
    all_reasons.sort(key=lambda r: r.weight, reverse=True)
    return all_reasons[:6]

def generate_verdict_summary(verdict: str, scam_type: str, custom_summary: Optional[str]) -> str:
    if custom_summary:
        return custom_summary
    return VERDICT_MESSAGES.get(verdict, "Scan completed.")

def get_recommended_actions(verdict: str, ai_actions: Optional[List[str]]) -> List[str]:
    if ai_actions and len(ai_actions) > 0:
        return ai_actions[:4]
    return DEFAULT_SAFE_ACTIONS.get(verdict, DEFAULT_SAFE_ACTIONS["Looks Safe"])
