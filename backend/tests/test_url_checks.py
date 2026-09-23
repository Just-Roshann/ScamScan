from app.analyzers.url_checks import (
    calculate_levenshtein_distance,
    calculate_shannon_entropy,
    analyze_single_url,
    extract_urls_from_text,
)

def test_levenshtein_distance():
    assert calculate_levenshtein_distance("kitten", "sitting") == 3
    assert calculate_levenshtein_distance("paytm", "paytmm") == 1
    assert calculate_levenshtein_distance("sbi", "sbi") == 0
    assert calculate_levenshtein_distance("", "test") == 4

def test_shannon_entropy():
    assert calculate_shannon_entropy("") == 0.0
    assert calculate_shannon_entropy("aaaa") == 0.0
    entropy = calculate_shannon_entropy("abcdefgh123456")
    assert entropy > 3.0

def test_real_brand_domain_not_flagged_as_lookalike():
    result = analyze_single_url("https://sbi.co.in/portal/web")
    lookalike_signals = [s for s in result.signals if s.id == "url_brand_lookalike"]
    assert len(lookalike_signals) == 0

def test_brand_lookalike_flagged():
    result = analyze_single_url("http://paytmm-rewards.top/claim")
    signal_ids = [s.id for s in result.signals]
    assert "url_brand_lookalike" in signal_ids
    assert "url_risky_tld" in signal_ids

def test_brand_in_subdomain_flagged():
    result = analyze_single_url("https://sbi.secure-login.xyz/verify")
    signal_ids = [s.id for s in result.signals]
    assert "url_brand_subdomain" in signal_ids
    assert "url_risky_tld" in signal_ids
    assert "url_suspicious_path" in signal_ids

def test_ip_address_host_flagged():
    result = analyze_single_url("http://192.168.1.100/login")
    signal_ids = [s.id for s in result.signals]
    assert "url_ip_host" in signal_ids

def test_punycode_flagged():
    result = analyze_single_url("https://xn--googl-fsa.com")
    signal_ids = [s.id for s in result.signals]
    assert "url_punycode" in signal_ids

def test_url_shortener_flagged():
    result = analyze_single_url("https://bit.ly/3xYqzP")
    signal_ids = [s.id for s in result.signals]
    assert "url_shortener" in signal_ids

def test_extract_urls_from_text():
    sample_text = "Visit https://sbi.co.in now or check bit.ly/promo for info."
    urls = extract_urls_from_text(sample_text)
    assert "https://sbi.co.in" in urls
    assert any("bit.ly" in u for u in urls)
