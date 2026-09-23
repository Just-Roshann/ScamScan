import json
from typing import Optional, List
from pydantic import ValidationError
from groq import Groq
from app.config import GROQ_API_KEY, PRIMARY_MODEL, FALLBACK_MODEL, ADDITIONAL_MODELS
from app.schemas import Signal, AiAnalysisResponse, AiReason
from app.ai.prompts import SYSTEM_PROMPT, build_user_prompt

def filter_hallucinated_reasons(reasons: List[AiReason], original_content: str) -> List[AiReason]:
    verified_reasons = []
    lower_content = original_content.lower()
    for item in reasons:
        evidence_text = item.evidence.strip().lower()
        if not evidence_text:
            verified_reasons.append(item)
            continue
        # Check exact substring first
        if evidence_text in lower_content:
            verified_reasons.append(item)
            continue
        # Fuzzy check: if most words from evidence appear in content, keep it
        evidence_words = [w for w in evidence_text.split() if len(w) > 2]
        if evidence_words:
            matches = sum(1 for w in evidence_words if w in lower_content)
            if matches / len(evidence_words) >= 0.5:
                verified_reasons.append(item)
    return verified_reasons[:5]

def call_groq_model(client: Groq, model_name: str, user_content: str) -> Optional[dict]:
    try:
        completion = client.chat.completions.create(
            model=model_name,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_content},
            ],
            response_format={"type": "json_object"},
            temperature=0.2,
            max_tokens=700,
        )
        raw_text = completion.choices[0].message.content
        return json.loads(raw_text)
    except Exception:
        return None

def analyze_with_groq(input_type: str, content: str, signals: List[Signal]) -> Optional[AiAnalysisResponse]:
    if not GROQ_API_KEY or not GROQ_API_KEY.strip():
        return None

    client = Groq(api_key=GROQ_API_KEY, timeout=8.0)
    prompt_payload = build_user_prompt(input_type, content, signals)

    models_to_try = [PRIMARY_MODEL, FALLBACK_MODEL] + [m for m in ADDITIONAL_MODELS if m not in (PRIMARY_MODEL, FALLBACK_MODEL)]

    for model_name in models_to_try:
        result_json = call_groq_model(client, model_name, prompt_payload)
        if not result_json:
            continue
        try:
            parsed_response = AiAnalysisResponse.model_validate(result_json)
            if 1 <= parsed_response.ai_risk <= 10 and parsed_response.scam_type != "none":
                parsed_response.ai_risk = parsed_response.ai_risk * 10
            parsed_response.reasons = filter_hallucinated_reasons(parsed_response.reasons, content)
            return parsed_response
        except ValidationError:
            continue

    return None

