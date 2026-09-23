import re
import urllib.parse
import httpx
import tldextract
from bs4 import BeautifulSoup
from app.schemas import Signal
from app.analyzers.brands import TRUSTED_BRANDS
from app.analyzers.url_checks import analyze_single_url
from app.analyzers.text_rules import analyze_text_rules

tld_parser = tldextract.TLDExtract()

def get_registered_domain(target_url: str) -> str:
    extracted = tld_parser(target_url)
    return f"{extracted.domain}.{extracted.suffix}" if extracted.suffix else extracted.domain

def find_brand_in_text(target_text: str):
    clean_text = target_text.lower()
    for brand_key, domains in TRUSTED_BRANDS.items():
        clean_brand = brand_key.lower()
        if re.search(rf"\b{re.escape(clean_brand)}\b", clean_text):
            return brand_key, domains
    return None, []

def check_sensitive_form_inputs(soup: BeautifulSoup):
    sensitive_keywords = ["card", "cvv", "otp", "pin", "aadhaar", "pan card"]
    matched_inputs = []
    for tag in soup.find_all("input"):
        attrs_text = " ".join([
            str(tag.get("name", "")),
            str(tag.get("id", "")),
            str(tag.get("placeholder", "")),
        ]).lower()
        for kw in sensitive_keywords:
            if kw in attrs_text:
                matched_inputs.append(kw)
    return list(dict.fromkeys(matched_inputs))

def check_form_external_post(soup: BeautifulSoup, page_domain: str):
    cross_domain_actions = []
    for form in soup.find_all("form", action=True):
        action_url = form.get("action", "").strip()
        if action_url.startswith("http://") or action_url.startswith("https://"):
            action_domain = get_registered_domain(action_url)
            if action_domain and action_domain.lower() != page_domain.lower():
                cross_domain_actions.append(action_domain)
    return cross_domain_actions

def check_hidden_iframes(soup: BeautifulSoup):
    for iframe in soup.find_all("iframe"):
        w = str(iframe.get("width", "")).strip()
        h = str(iframe.get("height", "")).strip()
        style = str(iframe.get("style", "")).lower()
        if w in ("0", "0px") or h in ("0", "0px") or "display:none" in style or "visibility:hidden" in style:
            return True
    return False

def check_obfuscated_javascript(raw_html: str, soup: BeautifulSoup):
    lower_html = raw_html.lower()
    if "eval(atob(" in lower_html or "unescape(" in lower_html:
        return True, "eval(atob) or unescape pattern"
    for script in soup.find_all("script"):
        script_text = script.string or ""
        if len(script_text) > 150:
            if re.search(r"[A-Za-z0-9+/]{120,}={0,2}", script_text):
                return True, "long base64 encoded payload"
    return False, ""

def inspect_html_elements(raw_html: str, final_url: str):
    soup = BeautifulSoup(raw_html, "html.parser")
    page_domain = get_registered_domain(final_url)
    title_text = soup.title.string.strip() if soup.title and soup.title.string else ""
    visible_text = soup.get_text(separator=" ", strip=True)[:3000]
    signals = []

    brand_in_title, title_trusted = find_brand_in_text(title_text)
    if brand_in_title and page_domain not in title_trusted:
        signals.append(Signal(id="website_title_brand_mismatch", category="impersonation", title="Brand Impersonation in Title", detail=f"Page title references '{brand_in_title}' but domain is '{page_domain}'.", weight=18, evidence=title_text[:60]))

    has_password_input = bool(soup.find("input", {"type": "password"}))
    brand_in_body, body_trusted = find_brand_in_text(visible_text)
    active_brand = brand_in_title or brand_in_body
    active_trusted = title_trusted or body_trusted
    if has_password_input and active_brand and page_domain not in active_trusted:
        signals.append(Signal(id="website_password_brand_mismatch", category="credentials", title="Fake Brand Password Form", detail=f"Login password field found while pretending to be '{active_brand}'.", weight=25, evidence=f"Password input on {page_domain}"))

    external_posts = check_form_external_post(soup, page_domain)
    if external_posts:
        signals.append(Signal(id="website_form_cross_domain", category="technical", title="Form Posts to External Domain", detail=f"Web form submits user credentials to third-party domain '{external_posts[0]}'.", weight=18, evidence=external_posts[0]))

    sensitive_fields = check_sensitive_form_inputs(soup)
    if sensitive_fields:
        signals.append(Signal(id="website_sensitive_inputs", category="credentials", title="High-Risk Input Fields Requested", detail=f"Form requests sensitive identifiers: {', '.join(sensitive_fields)}.", weight=20, evidence=", ".join(sensitive_fields)))

    if check_hidden_iframes(soup):
        signals.append(Signal(id="website_hidden_iframe", category="technical", title="Hidden Invisible iFrame", detail="Page contains hidden iframes often used for clickjacking or silent downloads.", weight=10, evidence="<iframe style='display:none'>"))

    is_obfuscated, obf_detail = check_obfuscated_javascript(raw_html, soup)
    if is_obfuscated:
        signals.append(Signal(id="website_obfuscated_js", category="technical", title="Obfuscated Script Execution", detail=f"Page includes suspicious script obfuscation ({obf_detail}).", weight=12, evidence=obf_detail))

    if 'oncontextmenu="return false"' in raw_html.lower() or 'oncopy="return false"' in raw_html.lower():
        signals.append(Signal(id="website_disabled_context", category="technical", title="Right-Click or Copy Disabled", detail="Script prevents user inspection by blocking context menu or copy operations.", weight=5, evidence="oncontextmenu/oncopy blocked"))

    return signals, visible_text

def safely_fetch_website(target_url: str):
    formatted_url = target_url if target_url.startswith("http") else "http://" + target_url
    client = httpx.Client(
        timeout=5.0,
        follow_redirects=True,
        max_redirects=5,
        headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"},
    )
    with client:
        response = client.get(formatted_url)
        content_bytes = response.read()[: 1024 * 1024]
        raw_html = content_bytes.decode(errors="replace")
        final_url = str(response.url)
        return raw_html, final_url

def analyze_website_content(target_url: str):
    signals = []
    initial_domain = get_registered_domain(target_url)
    try:
        raw_html, final_url = safely_fetch_website(target_url)
    except Exception as fetch_error:
        url_result = analyze_single_url(target_url)
        return list(url_result.signals), [], [url_result], f"Could not fetch website: {str(fetch_error)}"

    final_domain = get_registered_domain(final_url)
    if initial_domain and final_domain and initial_domain.lower() != final_domain.lower():
        signals.append(Signal(id="website_redirect_cross_domain", category="technical", title="Redirect Crosses Domains", detail=f"URL redirects from '{initial_domain}' to a different domain '{final_domain}'.", weight=10, evidence=f"{initial_domain} -> {final_domain}"))

    url_result = analyze_single_url(final_url)
    signals.extend(url_result.signals)

    html_signals, visible_text = inspect_html_elements(raw_html, final_url)
    signals.extend(html_signals)

    text_signals, highlights = analyze_text_rules(visible_text)
    signals.extend(text_signals)

    return signals, highlights, [url_result], visible_text
