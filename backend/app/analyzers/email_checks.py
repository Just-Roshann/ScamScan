import email
import email.utils
import re
import tldextract
from bs4 import BeautifulSoup
from app.schemas import Signal
from app.analyzers.brands import TRUSTED_BRANDS
from app.analyzers.text_rules import analyze_text_rules
from app.analyzers.url_checks import analyze_single_url, extract_urls_from_text

FREE_MAIL_DOMAINS = {
    "gmail.com",
    "yahoo.com",
    "yahoo.co.in",
    "outlook.com",
    "hotmail.com",
    "live.com",
    "aol.com",
    "proton.me",
    "protonmail.com",
    "zoho.com",
    "rediffmail.com",
    "yandex.com",
}

DANGEROUS_EXTENSIONS = [
    ".exe",
    ".scr",
    ".js",
    ".vbs",
    ".apk",
    ".html",
    ".iso",
    ".bat",
    ".cmd",
    ".hta",
]

tld_parser = tldextract.TLDExtract()

def get_domain_from_email_address(email_address: str) -> str:
    if "@" in email_address:
        return email_address.split("@")[-1].strip().lower().rstrip(">")
    return ""

def find_brand_in_string(target_string: str):
    clean_target = target_string.lower()
    for brand_key, domains in TRUSTED_BRANDS.items():
        clean_brand = brand_key.lower()
        if re.search(rf"\b{re.escape(clean_brand)}\b", clean_target):
            return brand_key, domains
    return None, []

def check_header_authentication(auth_header: str):
    lower_header = auth_header.lower()
    if "spf=fail" in lower_header or "dkim=fail" in lower_header or "dmarc=fail" in lower_header or "softfail" in lower_header:
        return True, auth_header[:80]
    return False, ""

def check_link_text_mismatch(html_content: str):
    soup = BeautifulSoup(html_content, "html.parser")
    mismatches = []
    for link_tag in soup.find_all("a", href=True):
        href_value = link_tag.get("href", "").strip()
        anchor_text = link_tag.get_text().strip()
        text_domain_match = re.search(r"[a-zA-Z0-9-]+\.[a-zA-Z]{2,10}", anchor_text)
        if text_domain_match and href_value.startswith("http"):
            text_domain = tld_parser(text_domain_match.group(0)).registered_domain
            href_domain = tld_parser(href_value).registered_domain
            if text_domain and href_domain and text_domain.lower() != href_domain.lower():
                mismatches.append(f"{anchor_text} -> {href_value}")
    return mismatches

def extract_email_body_and_attachments(parsed_message):
    body_text_parts = []
    html_parts = []
    attachment_names = []
    if parsed_message.is_multipart():
        for part in parsed_message.walk():
            disposition = str(part.get("Content-Disposition", ""))
            filename = part.get_filename()
            if filename:
                attachment_names.append(filename)
            content_type = part.get_content_type()
            payload = part.get_payload(decode=True)
            if payload:
                decoded = payload.decode(errors="replace")
                if content_type == "text/html":
                    html_parts.append(decoded)
                elif content_type == "text/plain":
                    body_text_parts.append(decoded)
    else:
        payload = parsed_message.get_payload(decode=True)
        raw_text = payload.decode(errors="replace") if payload else parsed_message.get_payload()
        if isinstance(raw_text, str):
            if "<html" in raw_text.lower():
                html_parts.append(raw_text)
            body_text_parts.append(raw_text)
    combined_body = "\n".join(body_text_parts) if body_text_parts else "\n".join(html_parts)
    return combined_body, "\n".join(html_parts), attachment_names

def check_dangerous_attachment_names(attachment_names: list, email_text: str):
    found_dangerous = []
    for name in attachment_names:
        lower_name = name.lower()
        if any(lower_name.endswith(ext) for ext in DANGEROUS_EXTENSIONS):
            found_dangerous.append(name)
    for ext in DANGEROUS_EXTENSIONS:
        matches = re.findall(rf"\b[a-zA-Z0-9_-]+{re.escape(ext)}\b", email_text, re.IGNORECASE)
        found_dangerous.extend(matches)
    return list(dict.fromkeys(found_dangerous))

def analyze_email_content(raw_email_string: str):
    signals = []
    parsed_msg = email.message_from_string(raw_email_string)
    display_name, from_address = email.utils.parseaddr(parsed_msg.get("From", ""))
    reply_to_name, reply_to_address = email.utils.parseaddr(parsed_msg.get("Reply-To", ""))
    return_path_header = parsed_msg.get("Return-Path", "")
    auth_header = parsed_msg.get("Authentication-Results", "")
    body_text, html_body, attachments = extract_email_body_and_attachments(parsed_msg)

    if not body_text.strip():
        body_text = raw_email_string

    from_domain = get_domain_from_email_address(from_address)
    reply_domain = get_domain_from_email_address(reply_to_address)
    return_domain = get_domain_from_email_address(return_path_header)

    has_auth_fail, auth_evidence = check_header_authentication(auth_header)
    if has_auth_fail:
        signals.append(Signal(id="email_auth_fail", category="sender", title="Email Authentication Failed", detail="SPF, DKIM, or DMARC verification reported a failure.", weight=20, evidence=auth_evidence))

    if from_domain and reply_domain and from_domain != reply_domain:
        signals.append(Signal(id="email_replyto_mismatch", category="sender", title="Reply-To Address Mismatch", detail=f"Replies are directed to '{reply_domain}' instead of sender '{from_domain}'.", weight=15, evidence=f"From: {from_domain}, Reply-To: {reply_domain}"))

    if display_name and from_domain:
        brand_name, trusted_domains = find_brand_in_string(display_name)
        if brand_name and from_domain not in trusted_domains:
            signals.append(Signal(id="email_display_spoof", category="impersonation", title="Display Name Brand Spoofing", detail=f"Display name shows '{display_name}' but sender domain '{from_domain}' is not official.", weight=22, evidence=f"{display_name} <{from_address}>"))
        if brand_name and from_domain in FREE_MAIL_DOMAINS:
            signals.append(Signal(id="email_freemail_spoof", category="sender", title="Free Webmail Impersonating Company", detail=f"Legitimate organization '{brand_name}' does not send official correspondence from public mail services.", weight=18, evidence=from_address))

    if from_domain and return_domain and from_domain != return_domain:
        signals.append(Signal(id="email_return_path_mismatch", category="sender", title="Return-Path Domain Mismatch", detail=f"Return-Path points to '{return_domain}', conflicting with sender domain.", weight=8, evidence=f"Return-Path: {return_domain}"))

    if html_body:
        mismatched_links = check_link_text_mismatch(html_body)
        if mismatched_links:
            signals.append(Signal(id="email_hidden_link_target", category="link", title="Misleading Link Destination", detail="Visible link text displays a safe address but redirects to an entirely different website.", weight=20, evidence=mismatched_links[0]))

    dangerous_files = check_dangerous_attachment_names(attachments, body_text)
    if dangerous_files:
        signals.append(Signal(id="email_dangerous_attachment", category="technical", title="Dangerous File Attachment", detail="Executable or script attachments detected, which can run malware.", weight=15, evidence=", ".join(dangerous_files)))

    text_signals, highlights = analyze_text_rules(body_text)
    signals.extend(text_signals)

    extracted_urls = extract_urls_from_text(body_text + " " + html_body)
    url_results = []
    for link in extracted_urls:
        analyzed_url = analyze_single_url(link)
        url_results.append(analyzed_url)
        signals.extend(analyzed_url.signals)

    return signals, highlights, url_results, body_text
