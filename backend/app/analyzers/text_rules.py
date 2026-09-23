import re
from app.schemas import Signal, TextHighlight

URGENCY_KEYWORDS = [
    "within 24 hours",
    "immediately",
    "last warning",
    "account will be blocked",
    "abhi",
    "turant",
    "urgent",
    "urgently",
    "urgent notice",
    "urgent action required",
    "hurry up",
    "limited time offer",
    "within 2 hours",
    "action required immediately",
    "expiring today",
    "tonight",
]

THREAT_KEYWORDS = [
    "legal action",
    "digital arrest",
    "arrest warrant",
    "police",
    "cbi",
    "fir filed",
    "suspended",
    "court notice",
    "ed investigation",
    "law enforcement",
]

CREDENTIAL_KEYWORDS = [
    "share otp",
    "send otp",
    "tell otp",
    "enter otp",
    "cvv",
    "upi pin",
    "atm pin",
    "banking password",
    "card pin",
    "share password",
    "enter your pin",
]

REWARD_KEYWORDS = [
    "you have won",
    "lottery",
    "cashback",
    "free gift",
    "lucky draw",
    "congratulations you won",
    "claim prize",
    "won reward",
    "crorepati winner",
]

PAYMENT_KEYWORDS = [
    "pay now",
    "processing fee",
    "registration fee",
    "transfer fee",
    "advance fee",
    "refundable deposit",
    "pay ₹",
]

KYC_KEYWORDS = [
    "update kyc",
    "pan link",
    "verify account",
    "re-activate",
    "kyc document",
    "aadhaar link",
    "complete kyc",
    "kyc suspended",
]

JOB_KEYWORDS = [
    "work from home",
    "daily income",
    "like youtube videos",
    "telegram task",
    "earn ₹",
    "part time job",
    "daily payout",
    "subscribe and earn",
]

COURIER_BILL_KEYWORDS = [
    "parcel on hold",
    "customs clearance",
    "electricity bill",
    "connection will be disconnected",
    "power cut tonight",
    "unpaid electricity",
    "delivery package held",
]

REMOTE_APP_KEYWORDS = [
    "anydesk",
    "teamviewer",
    "quicksupport",
    "install app",
    "download apk",
    "screen share",
    "rustdesk",
]

GREETING_KEYWORDS = [
    "dear customer",
    "dear consumer",
    "dear user",
    "dear valued member",
    "dear client",
    "dear account holder",
]

SHORTENER_DOMAINS = [
    "bit.ly",
    "tinyurl",
    "cutt.ly",
    "is.gd",
    "t.ly",
    "rb.gy",
]

NEGATION_PHRASES = [
    "do not",
    "don't",
    "dont",
    "never",
    "mat",
    "kabhi nahi",
    "kabhi mat",
    "not to",
]

def check_keyword_matches(text_content: str, keywords_list: list):
    matched_phrases = []
    highlights = []
    lower_text = text_content.lower()
    for keyword in keywords_list:
        keyword_lower = keyword.lower()
        search_start = 0
        while True:
            found_index = lower_text.find(keyword_lower, search_start)
            if found_index == -1:
                break
            matched_phrases.append(text_content[found_index : found_index + len(keyword)])
            highlights.append((found_index, found_index + len(keyword)))
            search_start = found_index + len(keyword)
    return matched_phrases, highlights

def is_negated_match(text_content: str, start_index: int) -> bool:
    preceding_text = text_content[:start_index].lower()
    words_before = preceding_text.split()[-6:]
    window_string = " ".join(words_before)
    for phrase in NEGATION_PHRASES:
        if phrase in window_string:
            return True
    return False

def check_credential_group(text_content: str):
    valid_matches = []
    highlights = []
    lower_text = text_content.lower()
    for keyword in CREDENTIAL_KEYWORDS:
        search_start = 0
        while True:
            found_index = lower_text.find(keyword, search_start)
            if found_index == -1:
                break
            if not is_negated_match(text_content, found_index):
                valid_matches.append(text_content[found_index : found_index + len(keyword)])
                highlights.append((found_index, found_index + len(keyword)))
            search_start = found_index + len(keyword)
    return valid_matches, highlights

def check_shouting_or_punctuation(text_content: str):
    words = [w for w in text_content.split() if len(w) > 1 and w.isalpha()]
    shouting_words = [w for w in words if w.isupper()]
    is_excess_exclamation = "!!!" in text_content
    is_high_uppercase = len(words) >= 4 and (len(shouting_words) / len(words)) >= 0.3
    if is_excess_exclamation or is_high_uppercase:
        evidence_text = "!!!" if is_excess_exclamation else " ".join(shouting_words[:4])
        return True, evidence_text
    return False, ""

def check_phone_call_action(text_content: str):
    pattern = r"(?:call|contact|dial|whatsapp|phone)\b[^\n\r\.\,\!\?]{0,45}?(?:\+?91[\s\-]?)?[6-9]\d{9}\b"
    match = re.search(pattern, text_content, re.IGNORECASE)
    if match:
        return True, match.group(0), match.start(), match.end()
    return False, "", -1, -1

def check_upi_or_amounts(text_content: str):
    upi_pattern = r"\b[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}\b"
    amount_pattern = r"(?:₹\s*\d+(?:,\d+)*(?:\.\d+)?|\d+\s*(?:rs|rupees|inr))\s*(?:credited|received|won)?"
    upi_matches = re.findall(upi_pattern, text_content)
    amount_matches = re.findall(amount_pattern, text_content, re.IGNORECASE)
    combined = upi_matches + [m for m in amount_matches if "credited" in m.lower() or "received" in m.lower()]
    return combined

def analyze_text_rules(text_content: str):
    signals = []
    highlights = []

    urgency_matches, urgency_spans = check_keyword_matches(text_content, URGENCY_KEYWORDS)
    if urgency_matches:
        signals.append(Signal(id="text_urgency", category="urgency", title="Urgency Pressure", detail="Creates artificial time pressure to make you act without thinking.", weight=12, evidence=", ".join(set(urgency_matches))))
        highlights.extend([TextHighlight(start=s, end=e, category="urgency") for s, e in urgency_spans])

    threat_matches, threat_spans = check_keyword_matches(text_content, THREAT_KEYWORDS)
    if threat_matches:
        signals.append(Signal(id="text_threat", category="urgency", title="Threat or Fear Tactic", detail="Uses intimidation, legal threats, or arrest warnings.", weight=15, evidence=", ".join(set(threat_matches))))
        highlights.extend([TextHighlight(start=s, end=e, category="urgency") for s, e in threat_spans])

    cred_matches, cred_spans = check_credential_group(text_content)
    if cred_matches:
        signals.append(Signal(id="text_credentials", category="credentials", title="Asks for OTP / PIN / Password", detail="Legitimate organizations and banks never ask for your confidential codes.", weight=25, evidence=", ".join(set(cred_matches))))
        highlights.extend([TextHighlight(start=s, end=e, category="credentials") for s, e in cred_spans])

    reward_matches, reward_spans = check_keyword_matches(text_content, REWARD_KEYWORDS)
    reward_amounts = [m for m in check_upi_or_amounts(text_content) if "credited" in m.lower() or "won" in m.lower()]
    all_rewards = list(set(reward_matches + reward_amounts))
    if all_rewards:
        signals.append(Signal(id="text_reward", category="money", title="Unrealistic Reward or Lottery", detail="Promises free money, lottery winnings, or unexpected gifts.", weight=15, evidence=", ".join(all_rewards)))
        highlights.extend([TextHighlight(start=s, end=e, category="money") for s, e in reward_spans])

    payment_matches, payment_spans = check_keyword_matches(text_content, PAYMENT_KEYWORDS)
    upi_addresses = [m for m in re.findall(r"\b[a-zA-Z0-9.\-_]{2,40}@[a-zA-Z]{3,20}\b", text_content) if not m.endswith(".com") and not m.endswith(".in")]
    if payment_matches or upi_addresses:
        evidence = ", ".join(set(payment_matches + upi_addresses))
        signals.append(Signal(id="text_payment", category="money", title="Direct Payment or Fee Request", detail="Demands advance payment, processing fees, or money transfers.", weight=15, evidence=evidence))
        highlights.extend([TextHighlight(start=s, end=e, category="money") for s, e in payment_spans])

    kyc_matches, kyc_spans = check_keyword_matches(text_content, KYC_KEYWORDS)
    if kyc_matches:
        signals.append(Signal(id="text_kyc", category="credentials", title="KYC or Account Suspension Warning", detail="Asks to verify identity or PAN/Aadhaar under threat of blocking.", weight=15, evidence=", ".join(set(kyc_matches))))
        highlights.extend([TextHighlight(start=s, end=e, category="credentials") for s, e in kyc_spans])

    job_matches, job_spans = check_keyword_matches(text_content, JOB_KEYWORDS)
    if job_matches:
        signals.append(Signal(id="text_job", category="money", title="Job or Daily Task Scam", detail="Offers unrealistic daily payouts for simple social media or Telegram tasks.", weight=14, evidence=", ".join(set(job_matches))))
        highlights.extend([TextHighlight(start=s, end=e, category="money") for s, e in job_spans])

    courier_matches, courier_spans = check_keyword_matches(text_content, COURIER_BILL_KEYWORDS)
    if courier_matches:
        signals.append(Signal(id="text_courier_bill", category="urgency", title="Courier or Utility Bill Threat", detail="Claims parcels are held or electricity will be cut off tonight.", weight=14, evidence=", ".join(set(courier_matches))))
        highlights.extend([TextHighlight(start=s, end=e, category="urgency") for s, e in courier_spans])

    remote_matches, remote_spans = check_keyword_matches(text_content, REMOTE_APP_KEYWORDS)
    if remote_matches:
        signals.append(Signal(id="text_remote_access", category="technical", title="Remote Access App Request", detail="Instructs to install remote control apps that allow screen capture.", weight=20, evidence=", ".join(set(remote_matches))))
        highlights.extend([TextHighlight(start=s, end=e, category="technical") for s, e in remote_spans])

    greeting_matches, greeting_spans = check_keyword_matches(text_content, GREETING_KEYWORDS)
    if greeting_matches:
        signals.append(Signal(id="text_greeting", category="sender", title="Impersonal Generic Greeting", detail="Uses vague greetings instead of addressing you by your actual name.", weight=5, evidence=", ".join(set(greeting_matches))))
        highlights.extend([TextHighlight(start=s, end=e, category="sender") for s, e in greeting_spans])

    is_shouting, shout_evidence = check_shouting_or_punctuation(text_content)
    if is_shouting:
        signals.append(Signal(id="text_shouting", category="language", title="Aggressive Punctuation or Shouting", detail="Excessive exclamation marks or uppercase text used to manufacture alarm.", weight=4, evidence=shout_evidence))

    shortener_matches = [d for d in SHORTENER_DOMAINS if d.lower() in text_content.lower()]
    if shortener_matches:
        signals.append(Signal(id="text_shortener", category="link", title="Shortened Link in Message", detail="Message includes a link shortener that conceals the true address.", weight=8, evidence=", ".join(shortener_matches)))

    has_phone, phone_evidence, phone_start, phone_end = check_phone_call_action(text_content)
    if has_phone:
        signals.append(Signal(id="text_phone_action", category="sender", title="Unverified Phone Call Request", detail="Directs you to call an unverified phone number immediately.", weight=8, evidence=phone_evidence))
        if phone_start >= 0:
            highlights.append(TextHighlight(start=phone_start, end=phone_end, category="sender"))

    return signals, highlights
