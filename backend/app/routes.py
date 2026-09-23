import json
import time
import uuid
from pathlib import Path
from collections import defaultdict, deque
from fastapi import APIRouter, HTTPException, Request
from app.schemas import AnalyzeRequest, AnalyzeResponse, StatsResponse
from app.analyzers.text_rules import analyze_text_rules
from app.analyzers.url_checks import analyze_single_url, extract_urls_from_text
from app.analyzers.email_checks import analyze_email_content
from app.analyzers.website_checks import analyze_website_content
from app.ai.groq_client import analyze_with_groq
from app.scoring import (
    compute_raw_score,
    apply_score_overrides,
    determine_verdict,
    determine_rule_scam_type,
    merge_top_reasons,
    generate_verdict_summary,
    get_recommended_actions,
)
from app.history import record_scan_result, fetch_recent_scans, calculate_scan_statistics

router = APIRouter()
request_records = defaultdict(deque)

def check_rate_limit(client_ip: str, max_requests: int = 30, window_seconds: int = 60):
    now = time.time()
    records = request_records[client_ip]
    while records and records[0] <= now - window_seconds:
        records.popleft()
    if len(records) >= max_requests:
        raise HTTPException(status_code=429, detail="Rate limit exceeded. Please wait.")
    records.append(now)

def process_message_input(content: str):
    signals, highlights = analyze_text_rules(content)
    extracted_urls = extract_urls_from_text(content)
    url_results = []
    for link in extracted_urls:
        url_res = analyze_single_url(link)
        url_results.append(url_res)
        signals.extend(url_res.signals)
    return signals, highlights, url_results, content

def process_email_input(content: str):
    signals, highlights, url_results, body_text = analyze_email_content(content)
    return signals, highlights, url_results, body_text

def process_url_input(content: str):
    clean_url = content.strip()
    url_res = analyze_single_url(clean_url)
    signals = list(url_res.signals)
    clean_domain_text = clean_url.replace("-", " ").replace(".", " ").replace("/", " ").replace("https", "").replace("http", "").replace("www", "")
    text_signals, _ = analyze_text_rules(clean_domain_text)
    for sig in text_signals:
        if sig.id not in {s.id for s in signals}:
            signals.append(sig)
    return signals, [], [url_res], clean_url

def process_website_input(content: str):
    clean_url = content.strip()
    signals, highlights, url_results, page_text = analyze_website_content(clean_url)
    return signals, highlights, url_results, page_text

@router.get("/health")
def get_health():
    return {"status": "ok", "service": "ScamScan API", "timestamp": int(time.time())}

@router.get("/history")
def get_history():
    return fetch_recent_scans(limit_count=50)

@router.get("/stats", response_model=StatsResponse)
def get_stats():
    return calculate_scan_statistics()

@router.get("/samples")
def get_samples():
    samples_path = Path(__file__).resolve().parent.parent / "samples" / "demo_cases.json"
    if not samples_path.exists():
        return []
    with open(samples_path, "r", encoding="utf-8") as f:
        return json.load(f)

@router.post("/analyze", response_model=AnalyzeResponse)
def analyze_endpoint(request_body: AnalyzeRequest, req: Request):
    client_ip = req.client.host if req.client else "127.0.0.1"
    check_rate_limit(client_ip)

    content = request_body.content.strip()
    if not content:
        raise HTTPException(status_code=400, detail="Content cannot be empty.")
    if len(content) > 50000:
        content = content[:50000]

    start_time = time.time()
    input_type = request_body.type

    if input_type == "message":
        signals, highlights, url_results, cleaned_content = process_message_input(content)
    elif input_type == "email":
        signals, highlights, url_results, cleaned_content = process_email_input(content)
    elif input_type == "url":
        signals, highlights, url_results, cleaned_content = process_url_input(content)
    elif input_type == "website":
        signals, highlights, url_results, cleaned_content = process_website_input(content)
    else:
        raise HTTPException(status_code=400, detail="Invalid input type.")

    ai_response = analyze_with_groq(input_type, cleaned_content, signals)
    ai_used = ai_response is not None

    rule_score, initial_score = compute_raw_score(signals, ai_response)
    final_score = apply_score_overrides(rule_score, initial_score, signals, ai_response)
    verdict = determine_verdict(final_score)
    scam_type = ai_response.scam_type if ai_response and ai_response.scam_type != "none" else determine_rule_scam_type(signals)
    custom_summary = ai_response.summary if ai_response else None
    summary = generate_verdict_summary(verdict, scam_type, custom_summary)
    ai_actions = ai_response.safe_actions if ai_response else None
    safe_actions = get_recommended_actions(verdict, ai_actions)
    reasons = merge_top_reasons(signals, ai_response)
    elapsed_ms = int((time.time() - start_time) * 1000)
    scan_id = str(uuid.uuid4())

    record_scan_result(scan_id, input_type, content, final_score, verdict, scam_type)

    return AnalyzeResponse(
        id=scan_id,
        score=final_score,
        verdict=verdict,
        scam_type=scam_type,
        summary=summary,
        reasons=reasons,
        highlights=highlights,
        urls=url_results,
        safe_actions=safe_actions,
        ai_used=ai_used,
        elapsed_ms=elapsed_ms,
    )
