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
    "expires tonight",
    "tonight only",
    "act now",
    "act immediately",
    "respond immediately",
    "don't delay",
    "time is running out",
    "expires soon",
    "final notice",
    "last chance",
    "only today",
    "today only",
    "before it's too late",
    "do it now",
    "right away",
    "as soon as possible",
    "without delay",
]

THREAT_KEYWORDS = [
    "legal action",
    "digital arrest",
    "arrest warrant",
    "police action",
    "police complaint",
    "police officer",
    "cyber police",
    "delhi police",
    "mumbai police",
    "cbi enquiry",
    "cbi investigation",
    "cbi case",
    "fir filed",
    "court notice",
    "ed investigation",
    "law enforcement",
    "your account has been compromised",
    "unauthorized access",
    "unauthorized transaction",
    "suspicious activity detected",
    "security alert",
    "account locked",
    "account suspended",
    "service suspended",
    "account deactivated",
    "permanently disabled",
    "legal proceedings",
    "penalty",
    "fine of",
    "assets seized",
    "account seized",
    "funds seized",
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
    "verify your identity",
    "confirm your identity",
    "enter your password",
    "update your password",
    "verify your account",
    "confirm your account",
    "enter your credentials",
    "provide your details",
    "share your details",
    "bank details",
    "card number",
    "card details",
    "account number",
    "social security",
    "login credentials",
    "sign in to verify",
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
    "claim your reward",
    "selected as winner",
    "you are selected",
    "you've been chosen",
    "exclusive offer for you",
    "spin and win",
    "scratch and win",
]

PAYMENT_KEYWORDS = [
    "pay now",
    "processing fee",
    "registration fee",
    "transfer fee",
    "advance fee",
    "refundable deposit",
    "customs fee",
    "customs duty",
    "delivery fee",
    "unpaid fee",
    "pending payment",
    "pay ₹",
    "pay rs",
    "pay in bitcoin",
    "send bitcoin",
]

KYC_KEYWORDS = [
    "update kyc",
    "kyc update",
    "kyc expired",
    "kyc has expired",
    "incomplete kyc",
    "pan link",
    "verify account",
    "re-activate",
    "kyc document",
    "aadhaar link",
    "complete kyc",
    "kyc suspended",
    "netbanking blocked",
    "account deactivated",
    "update your kyc",
    "complete your kyc",
    "kyc verification",
]

JOB_KEYWORDS = [
    "work from home",
    "daily income",
    "like youtube",
    "like videos",
    "rating hotels",
    "google maps review",
    "telegram task",
    "earn ₹",
    "earn rs",
    "part time job",
    "part-time job",
    "daily payout",
    "subscribe and earn",
    "simple task",
    "earn 1000",
    "earn 2000",
    "earn 3000",
    "earn 5000",
    "per day from home",
    "work 1-2 hours",
    "no experience needed",
    "daily salary",
    "contact hr",
    "online job",
]

COURIER_BILL_KEYWORDS = [
    "parcel on hold",
    "customs clearance",
    "electricity bill",
    "electricity office",
    "electricity officer",
    "power will be disconnected",
    "connection will be disconnected",
    "power cut tonight",
    "power cut",
    "unpaid electricity",
    "delivery package held",
    "package could not be delivered",
    "delivery attempt failed",
    "reschedule delivery",
    "shipment on hold",
    "gas bill overdue",
    "water bill overdue",
    "parcel tracking",
    "package tracking",
    "cannot be delivered",
    "could not be delivered",
    "delivery failed",
    "unpaid bill",
    "bill update",
    "bill pending",
    "bill was not updated",
    "disconnected tonight",
    "light cut",
    "bijli",
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
    "dear sir/madam",
    "dear winner",
    "dear beneficiary",
    "valued customer",
]

INVESTMENT_KEYWORDS = [
    "guaranteed returns",
    "double your money",
    "risk free investment",
    "high returns guaranteed",
    "invest now",
    "crypto profit",
    "forex trading",
    "earn daily profit",
    "minimum investment",
    "100% profit",
    "200% return",
    "passive income guaranteed",
    "no risk involved",
    "money doubling",
    "bitcoin profit",
    "trading signals",
]

SEXTORTION_KEYWORDS = [
    "recorded you",
    "your private video",
    "your private photos",
    "webcam footage",
    "intimate video",
    "compromising video",
    "send to all contacts",
    "share with contacts",
    "send bitcoin",
    "pay in bitcoin",
    "your browsing history",
    "visited adult",
    "adult website",
    "i have your photos",
    "i recorded you",
    "i hacked your",
]

PHISHING_ACTION_KEYWORDS = [
    "click here",
    "click the link",
    "click link",
    "click below",
    "click the button",
    "tap here",
    "tap the link",
    "tap link",
    "tap below",
    "open link",
    "follow the link",
    "follow link",
    "visit the link",
    "visit link",
    "log in here",
    "sign in here",
    "click to verify",
    "click to confirm",
    "click to update",
    "click to secure",
    "click to unlock",
    "click to restore",
    "update address",
    "verify here",
    "claim here",
    "track here",
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
        signals.append(Signal(id="text_threat", category="urgency", title="Threat or Fear Tactic", detail="Uses intimidation, legal threats, or arrest warnings.", weight=20, evidence=", ".join(set(threat_matches))))
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
        signals.append(Signal(id="text_payment", category="money", title="Direct Payment or Fee Request", detail="Demands advance payment, processing fees, or money transfers.", weight=18, evidence=evidence))
        highlights.extend([TextHighlight(start=s, end=e, category="money") for s, e in payment_spans])

    kyc_matches, kyc_spans = check_keyword_matches(text_content, KYC_KEYWORDS)
    if kyc_matches:
        signals.append(Signal(id="text_kyc", category="credentials", title="KYC or Account Suspension Warning", detail="Asks to verify identity or PAN/Aadhaar under threat of blocking.", weight=22, evidence=", ".join(set(kyc_matches))))
        highlights.extend([TextHighlight(start=s, end=e, category="credentials") for s, e in kyc_spans])

    job_matches, job_spans = check_keyword_matches(text_content, JOB_KEYWORDS)
    if job_matches:
        signals.append(Signal(id="text_job", category="money", title="Job or Daily Task Scam", detail="Offers unrealistic daily payouts for simple social media or Telegram tasks.", weight=20, evidence=", ".join(set(job_matches))))
        highlights.extend([TextHighlight(start=s, end=e, category="money") for s, e in job_spans])

    courier_matches, courier_spans = check_keyword_matches(text_content, COURIER_BILL_KEYWORDS)
    if courier_matches:
        signals.append(Signal(id="text_courier_bill", category="urgency", title="Courier or Utility Bill Threat", detail="Claims parcels are held or electricity will be cut off tonight.", weight=20, evidence=", ".join(set(courier_matches))))
        highlights.extend([TextHighlight(start=s, end=e, category="urgency") for s, e in courier_spans])

    remote_matches, remote_spans = check_keyword_matches(text_content, REMOTE_APP_KEYWORDS)
    if remote_matches:
        signals.append(Signal(id="text_remote_access", category="technical", title="Remote Access App Request", detail="Instructs to install remote control apps that allow screen capture.", weight=20, evidence=", ".join(set(remote_matches))))
        highlights.extend([TextHighlight(start=s, end=e, category="technical") for s, e in remote_spans])

    invest_matches, invest_spans = check_keyword_matches(text_content, INVESTMENT_KEYWORDS)
    if invest_matches:
        signals.append(Signal(id="text_investment", category="money", title="Investment or Trading Scam", detail="Promises guaranteed returns or unrealistic profits from trading or investments.", weight=22, evidence=", ".join(set(invest_matches))))
        highlights.extend([TextHighlight(start=s, end=e, category="money") for s, e in invest_spans])

    sextort_matches, sextort_spans = check_keyword_matches(text_content, SEXTORTION_KEYWORDS)
    if sextort_matches:
        signals.append(Signal(id="text_sextortion", category="urgency", title="Sextortion or Blackmail Threat", detail="Threatens to share private or intimate content unless payment is made.", weight=25, evidence=", ".join(set(sextort_matches))))
        highlights.extend([TextHighlight(start=s, end=e, category="urgency") for s, e in sextort_spans])

    phish_action_matches, phish_action_spans = check_keyword_matches(text_content, PHISHING_ACTION_KEYWORDS)
    if phish_action_matches:
        signals.append(Signal(id="text_phishing_action", category="link", title="Suspicious Call to Action", detail="Urges you to click a link, button, or take immediate action through a URL.", weight=10, evidence=", ".join(set(phish_action_matches))))
        highlights.extend([TextHighlight(start=s, end=e, category="link") for s, e in phish_action_spans])

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

    # Combo boost: when 3+ distinct scam categories fire, it's almost certainly a scam
    scam_categories = {s.category for s in signals if s.weight >= 8}
    if len(scam_categories) >= 3:
        signals.append(Signal(id="text_combo_boost", category="multi", title="Multiple Scam Indicators Combined", detail=f"This content triggers {len(scam_categories)} distinct risk categories, a strong sign of a scam.", weight=15, evidence=f"Categories: {', '.join(sorted(scam_categories))}"))

    return signals, highlights
