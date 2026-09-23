import math
import re
import urllib.parse
import ipaddress
import tldextract
from app.schemas import Signal, UrlBreakdown, UrlAnalysisResult
from app.analyzers.brands import TRUSTED_BRANDS, SHORTENER_HOSTS, RISKY_TLDS, SUSPICIOUS_PATH_WORDS

extractor = tldextract.TLDExtract()

def calculate_levenshtein_distance(first_word: str, second_word: str) -> int:
    length_a = len(first_word)
    length_b = len(second_word)
    distance_matrix = [[0] * (length_b + 1) for _ in range(length_a + 1)]
    for i in range(length_a + 1):
        distance_matrix[i][0] = i
    for j in range(length_b + 1):
        distance_matrix[0][j] = j
    for i in range(1, length_a + 1):
        for j in range(1, length_b + 1):
            substitution_cost = 0 if first_word[i - 1] == second_word[j - 1] else 1
            distance_matrix[i][j] = min(
                distance_matrix[i - 1][j] + 1,
                distance_matrix[i][j - 1] + 1,
                distance_matrix[i - 1][j - 1] + substitution_cost,
            )
    return distance_matrix[length_a][length_b]

def calculate_shannon_entropy(text_value: str) -> float:
    if not text_value:
        return 0.0
    frequencies = {}
    for character in text_value:
        frequencies[character] = frequencies.get(character, 0) + 1
    total_length = len(text_value)
    entropy_score = 0.0
    for count in frequencies.values():
        probability = count / total_length
        entropy_score -= probability * math.log2(probability)
    return entropy_score

def is_ip_address(host_name: str) -> bool:
    clean_host = host_name.split(":")[0]
    try:
        ipaddress.IPv4Address(clean_host)
        return True
    except ValueError:
        return False

def check_lookalike_brand(domain_name: str, registered_domain: str):
    lower_domain = domain_name.lower()
    for brand_name, trusted_domains in TRUSTED_BRANDS.items():
        if registered_domain.lower() in trusted_domains:
            continue
        clean_brand = brand_name.replace(" ", "")
        distance = calculate_levenshtein_distance(lower_domain, clean_brand)
        if 1 <= distance <= 2 and abs(len(lower_domain) - len(clean_brand)) <= 2:
            return brand_name, f"Domain '{domain_name}' closely resembles '{clean_brand}'"
        if clean_brand in lower_domain and lower_domain != clean_brand:
            return brand_name, f"Domain contains brand name '{clean_brand}' with variations"
    return None, None

def check_brand_in_subdomain_or_path(subdomain: str, path: str, registered_domain: str):
    subdomain_and_path = f"{subdomain}/{path}".lower()
    for brand_name, trusted_domains in TRUSTED_BRANDS.items():
        if registered_domain.lower() in trusted_domains:
            continue
        clean_brand = brand_name.replace(" ", "")
        pattern = rf"(^|[._/-]){clean_brand}([._/-]|$)"
        if re.search(pattern, subdomain_and_path):
            return brand_name
    return None

def extract_urls_from_text(input_text: str):
    url_pattern = r"(?:https?://[^\s<>'\"`]+|www\.[^\s<>'\"`]+|[a-zA-Z0-9-]+\.[a-zA-Z]{2,12}(?:/[^\s<>'\"`]*)?)"
    found_matches = re.findall(url_pattern, input_text, re.IGNORECASE)
    cleaned_urls = []
    for match in found_matches:
        cleaned = match.rstrip(".,;!?:)]}\"'")
        if cleaned:
            cleaned_urls.append(cleaned)
    return list(dict.fromkeys(cleaned_urls))

DECEPTIVE_LURE_WORDS = [
    "giveaway",
    "lottery",
    "prize",
    "winner",
    "reward",
    "free-gift",
    "airdrop",
    "bonus",
    "lucky-draw",
    "claim",
    "free",
]

def analyze_single_url(target_url: str) -> UrlAnalysisResult:
    formatted_url = target_url
    if not (formatted_url.startswith("http://") or formatted_url.startswith("https://")):
        formatted_url = "http://" + formatted_url
    parsed = urllib.parse.urlsplit(formatted_url)
    host_value = parsed.netloc.lower().split("@")[-1]
    host_without_port = host_value.split(":")[0]
    extracted = extractor(formatted_url)
    registered_domain = f"{extracted.domain}.{extracted.suffix}" if extracted.suffix else extracted.domain
    signals = []
    suspicious_part = ""
    suspicious_reason = ""

    if is_ip_address(host_without_port):
        signals.append(Signal(id="url_ip_host", category="technical", title="IP Address Used as Host", detail="Website uses a raw IP address instead of a domain name.", weight=20, evidence=host_without_port))
        suspicious_part = host_without_port
        suspicious_reason = "Raw IP address"

    brand_match, lookalike_detail = check_lookalike_brand(extracted.domain, registered_domain)
    if brand_match:
        signals.append(Signal(id="url_brand_lookalike", category="impersonation", title="Brand Lookalike Domain", detail=lookalike_detail, weight=25, evidence=registered_domain))
        suspicious_part = registered_domain
        suspicious_reason = f"Impersonates {brand_match}"

    lower_domain_str = extracted.domain.lower()
    lower_path = parsed.path.lower()
    matched_lures = [word for word in DECEPTIVE_LURE_WORDS if word in lower_domain_str or word in lower_path]
    if matched_lures:
        if brand_match:
            signals.append(Signal(id="url_brand_lure", category="impersonation", title="Brand Lure / Giveaway Trap", detail=f"Domain couples brand '{brand_match}' with deceptive giveaway lure terms ({', '.join(matched_lures)}).", weight=30, evidence=registered_domain))
            if not suspicious_part:
                suspicious_part = registered_domain
                suspicious_reason = f"Brand lure targeting {brand_match}"
        else:
            signals.append(Signal(id="url_deceptive_lure", category="money", title="Deceptive Prize or Giveaway Lure", detail=f"Domain or path advertises prize/giveaway lure terms ({', '.join(matched_lures)}).", weight=20, evidence=registered_domain))
            if not suspicious_part:
                suspicious_part = registered_domain
                suspicious_reason = "Deceptive prize or giveaway lure"

    subdomain_brand = check_brand_in_subdomain_or_path(extracted.subdomain, parsed.path, registered_domain)
    if subdomain_brand:
        signals.append(Signal(id="url_brand_subdomain", category="impersonation", title="Brand in Subdomain or Path", detail=f"Brand '{subdomain_brand}' is placed in subdomain/path while domain is '{registered_domain}'.", weight=22, evidence=f"{extracted.subdomain}.{registered_domain}"))
        suspicious_part = extracted.subdomain
        suspicious_reason = f"Deceptive {subdomain_brand} subdomain"

    if "xn--" in host_without_port or any(ord(char) > 127 for char in host_without_port):
        signals.append(Signal(id="url_punycode", category="technical", title="Punycode / Homoglyph Domain", detail="Host contains non-standard international characters or punycode prefix.", weight=20, evidence=host_without_port))
        suspicious_part = host_without_port
        suspicious_reason = "Homoglyph / Punycode characters"

    if extracted.suffix.lower() in RISKY_TLDS:
        signals.append(Signal(id="url_risky_tld", category="technical", title="Suspicious Top-Level Domain", detail=f"The domain uses .{extracted.suffix}, a TLD frequently associated with scam websites.", weight=8, evidence=f".{extracted.suffix}"))
        if not suspicious_part:
            suspicious_part = f".{extracted.suffix}"
            suspicious_reason = "High-risk TLD"

    if "@" in target_url.split("?")[0]:
        signals.append(Signal(id="url_at_symbol", category="technical", title="@ Symbol in URL", detail="The @ symbol in URL may obscure the real destination host.", weight=15, evidence="@"))
        suspicious_part = "@"
        suspicious_reason = "Credential obscuration"

    if host_without_port.count(".") >= 4:
        signals.append(Signal(id="url_many_subdomains", category="technical", title="Excessive Subdomains", detail="Domain has 4 or more subdomains, often used to hide the true host.", weight=8, evidence=host_without_port))

    if len(target_url) > 100:
        signals.append(Signal(id="url_very_long", category="technical", title="Abnormally Long URL", detail="URL length exceeds 100 characters, common in obfuscated phishing links.", weight=5, evidence=target_url[:60] + "..."))

    domain_entropy = calculate_shannon_entropy(extracted.domain)
    if domain_entropy > 3.8 and len(extracted.domain) >= 8:
        signals.append(Signal(id="url_high_entropy", category="technical", title="Randomized Domain Name", detail="Domain name exhibits high character randomness.", weight=8, evidence=extracted.domain))

    if extracted.domain.count("-") >= 2 or host_without_port.count("-") >= 2:
        signals.append(Signal(id="url_many_hyphens", category="technical", title="Multiple Hyphens in Host", detail="Domain uses multiple hyphens to simulate brand names or services.", weight=6, evidence=host_without_port))

    for keyword in SUSPICIOUS_PATH_WORDS:
        if keyword in lower_path:
            signals.append(Signal(id="url_suspicious_path", category="technical", title="Sensitive Action in Path", detail=f"URL path contains sensitive action keyword '{keyword}'.", weight=8, evidence=keyword))
            break

    if parsed.scheme.lower() == "http":
        signals.append(Signal(id="url_no_https", category="technical", title="Insecure HTTP Connection", detail="URL does not use encrypted HTTPS connection.", weight=6, evidence="http://"))

    if parsed.port and parsed.port not in (80, 443):
        signals.append(Signal(id="url_non_standard_port", category="technical", title="Non-Standard Port", detail=f"URL specifies non-standard port {parsed.port}.", weight=8, evidence=str(parsed.port)))

    if host_without_port in SHORTENER_HOSTS:
        signals.append(Signal(id="url_shortener", category="technical", title="Shortened URL Service", detail="Link is shortened, which conceals its true destination.", weight=8, evidence=host_without_port))
        if not suspicious_part:
            suspicious_part = host_without_port
            suspicious_reason = "Shortened link obscures destination"

    total_score = min(100, sum(signal.weight for signal in signals))
    breakdown = UrlBreakdown(
        scheme=parsed.scheme or "http",
        subdomain=extracted.subdomain,
        registered_domain=registered_domain,
        tld=extracted.suffix,
        path=parsed.path,
        query=parsed.query,
        suspicious_part=suspicious_part,
        reason=suspicious_reason,
    )
    return UrlAnalysisResult(url=target_url, score=total_score, breakdown=breakdown, signals=signals)
