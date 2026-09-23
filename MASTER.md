# MASTER BUILD SPEC — "ScamScan" (PS-008 Scam & Phishing Detector)
# MASTER BUILD SPEC — "ScamScan" (PS-008 Scam & Phishing Detector)

You are building a complete, working, demo-ready project from this file. Read the whole file before writing any code. Follow every rule in **Section 1** strictly.

---

## 0. One-line pitch

**ScamScan** analyses a message, email, URL, or website and tells the user in plain language whether it looks like a scam, how risky it is, and exactly *why* — highlighting the suspicious parts and telling them what to do next.

Core idea: **hybrid detection**. Our own hand-written rule engine and URL analyser produce transparent, explainable signals. A fast LLM on Groq adds context understanding (tone, intent, Hinglish, new scam styles). The two are fused into one risk score. If Groq is down, the app still works on rules alone.

---

## 1. Non-negotiable rules for the code

1. **No comments anywhere in the code.** No `#`, no `//`, no `/* */`, no docstrings. Code must explain itself through names.
2. **Human-like, simple code.** Short functions (under ~25 lines), clear variable names (`risk_score`, `found_signals`, not `rs`, `fs`), no clever one-liners, no over-engineering, no unnecessary abstractions or design patterns.
3. **Do not copy any existing phishing detector** (no cloning GitHub projects, no copying rule lists or models from them). All heuristics, weights, and prompts in this spec are original — implement them yourself.
4. Every "suspicious" result **must** come with human-readable reasons. No reason = no flag.
5. Never execute scripts from analysed websites. Never follow more than 5 redirects. Never download files.
6. API key only from `.env` (`GROQ_API_KEY`). Never hardcode, never send to frontend.
7. Keep dependencies minimal. Prefer standard library where reasonable.

---

## 2. Tech stack

| Layer | Choice |
|---|---|
| Backend | Python 3.11, FastAPI, Uvicorn, httpx, pydantic, python-dotenv, tldextract, beautifulsoup4 |
| AI | Groq API via official `groq` Python SDK |
| Frontend | React + Vite + TailwindCSS, lucide-react icons, framer-motion for small animations |
| Storage | SQLite (via standard `sqlite3`) for scan history and stats |
| Tests | pytest |

### Groq models

| Purpose | Model | Why |
|---|---|---|
| Main analysis + explanation | `llama-3.3-70b-versatile` | Best reasoning on Groq free tier |
| Fallback / fast mode | `llama-3.1-8b-instant` | Very fast, used if 70B rate-limits or errors |

Before coding, check `https://console.groq.com/docs/models` and replace any model that has been deprecated with its current equivalent. Put model names in `config.py`, never scattered.

Use `response_format={"type": "json_object"}`, `temperature=0.2`, `max_tokens=700`. Timeout 15s. On failure try the fallback model once, then continue rules-only.

---

## 3. Folder structure

```
ScamScan/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── schemas.py
│   │   ├── routes.py
│   │   ├── analyzers/
│   │   │   ├── text_rules.py
│   │   │   ├── url_checks.py
│   │   │   ├── email_checks.py
│   │   │   ├── website_checks.py
│   │   │   └── brands.py
│   │   ├── ai/
│   │   │   ├── groq_client.py
│   │   │   └── prompts.py
│   │   ├── scoring.py
│   │   └── history.py
│   ├── tests/
│   │   ├── test_text_rules.py
│   │   ├── test_url_checks.py
│   │   ├── test_email_checks.py
│   │   └── test_scoring.py
│   ├── samples/
│   │   └── demo_cases.json
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── api.js
│   │   ├── pages/ (Scanner.jsx, History.jsx, Learn.jsx)
│   │   └── components/ (InputTabs.jsx, RiskGauge.jsx, ReasonCard.jsx, HighlightedText.jsx, UrlBreakdown.jsx, SafetyTips.jsx, QuizCard.jsx)
│   └── package.json
└── README.md
```

---

## 4. Input types the user can analyse

A tab bar at the top of the scanner: **Message | Email | URL | Website**

1. **Message** — SMS / WhatsApp / Telegram text pasted in. Any URLs inside are extracted and analysed too.
2. **Email** — paste full raw email (with headers) *or* just subject + body. If headers exist, run header checks.
3. **URL** — single link, analysed statically (no visit).
4. **Website** — URL is safely fetched (GET only, 5s timeout, max 1 MB, max 5 redirects, no JS) and the HTML is inspected.

---

## 5. Detection engine (original heuristics — implement exactly)

Every check returns a **Signal**:

```
Signal { id, category, title, detail, weight (0–30), evidence (the exact text/part that triggered it) }
```

Categories: `urgency`, `money`, `credentials`, `impersonation`, `link`, `sender`, `technical`, `language`, `ai`.

### 5.1 Text rules (`text_rules.py`)

Case-insensitive keyword/regex groups. Each group fires at most once, evidence = matched phrase(s).

| Signal | Examples of triggers | Weight |
|---|---|---|
| Urgency pressure | "within 24 hours", "immediately", "last warning", "account will be blocked", "abhi", "turant" | 12 |
| Threat / fear | "legal action", "arrest", "police", "digital arrest", "FIR", "suspended" | 15 |
| Asks for OTP / PIN / password | "share OTP", "CVV", "UPI PIN", "password", "ATM pin" | 25 |
| Too-good-to-be-true reward | "you have won", "lottery", "cashback", "free gift", "lucky draw", "₹\d+ credited" | 15 |
| Payment request | "pay now", "processing fee", "registration fee", UPI ID pattern `[\w.-]+@[a-z]+` in text | 15 |
| KYC / account update | "update KYC", "PAN link", "verify account", "re-activate" | 15 |
| Job / task scam | "work from home", "earn ₹", "daily income", "like YouTube videos", "telegram task" | 14 |
| Courier / bill scam | "parcel on hold", "customs", "electricity bill", "connection will be disconnected" | 14 |
| Remote access apps | "AnyDesk", "TeamViewer", "QuickSupport", "install app" | 20 |
| Generic greeting | "Dear customer", "Dear user", "Dear valued member" | 5 |
| Shouting / excess punctuation | ≥30% uppercase words or `!!!` | 4 |
| Shortened link present | bit.ly, tinyurl, cutt.ly, is.gd, t.ly, rb.gy | 8 |
| Phone number + "call now" | regex on Indian numbers + call-to-action words | 8 |

Keep the keyword lists in plain Python lists at the top of the file. Include English + common Hinglish words.

### 5.2 URL checks (`url_checks.py`) — static, no network

Parse with `urllib.parse` + `tldextract`. Checks:

| Signal | Rule | Weight |
|---|---|---|
| IP address as host | host matches IPv4 | 20 |
| Brand lookalike | registered domain within Levenshtein distance ≤2 of a brand in `brands.py` but not equal (e.g. `paytmm.com`, `sbi-kyc.in`) | 25 |
| Brand in subdomain | brand name appears in subdomain/path but registered domain is not the brand's real domain (`sbi.secure-login.xyz`) | 22 |
| Punycode / homoglyph | host contains `xn--` or non-ASCII chars | 20 |
| Risky TLD | `.xyz .top .click .shop .icu .buzz .cfd .sbs .live .rest .monster` | 8 |
| `@` in URL | `@` before host | 15 |
| Too many subdomains | ≥4 dots in host | 8 |
| Very long URL | > 100 chars | 5 |
| High randomness | Shannon entropy of registered domain name > 3.8 | 8 |
| Many hyphens | ≥3 hyphens in domain | 6 |
| Suspicious words in path | login, verify, secure, update, kyc, wallet, reward, claim | 8 |
| No HTTPS | scheme is http | 6 |
| Non-standard port | explicit port not 80/443 | 8 |
| URL shortener | host in shortener list | 8 |

Implement Levenshtein distance yourself (simple DP function). Implement entropy yourself.

`brands.py`: dict of ~30 brands → official domains. Include Indian brands: sbi.co.in, onlinesbi.sbi, hdfcbank.com, icicibank.com, axisbank.com, paytm.com, phonepe.com, npci.org.in, incometax.gov.in, uidai.gov.in, indiapost.gov.in, irctc.co.in, amazon.in, amazon.com, flipkart.com, google.com, microsoft.com, apple.com, paypal.com, netflix.com, instagram.com, facebook.com, whatsapp.com, linkedin.com, airtel.in, jio.com, bsnl.co.in, epfindia.gov.in.

Also return a **URL breakdown** object for the UI: scheme, subdomain, registered domain, TLD, path, query, and which part is suspicious.

### 5.3 Email checks (`email_checks.py`)

Parse with standard `email` module. If headers present:

| Signal | Rule | Weight |
|---|---|---|
| SPF/DKIM/DMARC fail | `Authentication-Results` contains `fail` or `softfail` | 20 |
| Reply-To mismatch | Reply-To domain ≠ From domain | 15 |
| Display-name spoof | display name contains a brand but From domain is not that brand's | 22 |
| Free-mail pretending to be company | brand in display name + gmail/yahoo/outlook address | 18 |
| Return-Path mismatch | Return-Path domain ≠ From domain | 8 |
| Link text ≠ link target | in HTML body, `<a>` text shows one domain, href goes to another | 20 |
| Dangerous attachment names | `.exe .scr .js .vbs .apk .html .iso` mentioned | 15 |

Then run text rules + URL checks on the body and every extracted link.

### 5.4 Website checks (`website_checks.py`)

Safe fetch with httpx (see rule 5). Run URL checks on the final URL, plus:

| Signal | Rule | Weight |
|---|---|---|
| Redirect chain crosses domains | final domain ≠ start domain | 10 |
| Password form on non-brand domain | `<input type=password>` present and title/logo text mentions a brand whose domain doesn't match | 25 |
| Form posts to other domain | `<form action>` points to different domain | 18 |
| Asks for card/OTP fields | input names/placeholders include card, cvv, otp, pin, aadhaar | 20 |
| Title/brand mismatch | page title contains brand, domain isn't the brand | 18 |
| Hidden iframes | iframe with width/height 0 or display:none | 10 |
| Obfuscated JS | inline script containing `eval(atob(` or `unescape(` or very long base64 blocks | 12 |
| Right-click / copy disabled | `oncontextmenu="return false"` | 5 |

Send the visible page text (first 3000 chars) to the AI step as well.

### 5.5 AI step (`groq_client.py`, `prompts.py`)

Send: input type, cleaned content (max 4000 chars), and the list of rule signals already found. The model acts as a second opinion and explainer, **not** the only judge.

System prompt (store in `prompts.py`):

```
You are a cybersecurity analyst who helps ordinary people in India spot scams and phishing.
You receive content and signals found by a rule engine.
Judge if the content is a scam, phishing, spam, or legitimate.
Consider intent, emotional manipulation, impersonation, requests for money or secrets, and Hinglish or regional phrasing.
Do not invent facts. If the content looks normal, say so.
Reply only in JSON with this exact shape:
{
  "ai_risk": integer 0-100,
  "scam_type": one of ["phishing","bank_kyc","upi_payment","job_task","lottery_reward","courier_bill","impersonation","investment","tech_support","sextortion","other","none"],
  "confidence": "low" | "medium" | "high",
  "reasons": [ {"title": short string, "detail": one plain sentence, "evidence": exact short quote from the content or ""} ],
  "safe_actions": [ up to 4 short practical steps ],
  "summary": one friendly sentence a non-technical person understands
}
Maximum 5 reasons.
```

Validate the JSON with pydantic. If invalid, retry once with the fallback model; if it still fails, skip AI. Drop any AI reason whose `evidence` is not actually found in the content (anti-hallucination check).

---

## 6. Scoring & verdict (`scoring.py`)

```
rule_score = min(100, sum of signal weights)
if AI available: final = round(0.55 * rule_score + 0.45 * ai_risk)
else:            final = rule_score
```

Overrides (simple ifs):
- If any signal with weight ≥ 25 fired → final at least 60.
- If AI says `high` confidence scam and rule_score ≥ 20 → final at least 70.
- If no rule signals and AI risk < 20 → final at most 15.

Verdicts:

| Score | Verdict | Colour | Message |
|---|---|---|---|
| 0–29 | **Looks Safe** | green | "No strong warning signs found. Still stay careful." |
| 30–59 | **Suspicious** | amber | "Some warning signs. Verify from the official source before acting." |
| 60–100 | **Dangerous** | red | "Very likely a scam. Do not click, pay, or share anything." |

Also compute `top_reasons`: merge rule signals and AI reasons, remove duplicates by category, sort by weight, keep top 6.

---

## 7. API contract (`routes.py`)

`POST /api/analyze`
```json
{ "type": "message" | "email" | "url" | "website", "content": "string" }
```
Response:
```json
{
  "id": "uuid",
  "score": 82,
  "verdict": "Dangerous",
  "scam_type": "bank_kyc",
  "summary": "...",
  "reasons": [ { "title": "", "detail": "", "evidence": "", "category": "", "source": "rules" | "ai", "weight": 0 } ],
  "highlights": [ { "start": 0, "end": 0, "category": "" } ],
  "urls": [ { "url": "", "score": 0, "breakdown": {}, "signals": [] } ],
  "safe_actions": [],
  "ai_used": true,
  "elapsed_ms": 640
}
```

Other endpoints:
- `GET /api/history` — last 50 scans (store content hash + first 120 chars only, never full personal content)
- `GET /api/stats` — counts per verdict and scam type
- `GET /api/samples` — demo cases from `samples/demo_cases.json`
- `GET /api/health`

Input limits: content max 20,000 chars, reject empty. Rate limit simple in-memory: 30 requests/minute per IP. CORS only for the frontend origin.

---

## 8. Frontend design (make it look genuinely premium)

**Style:** dark theme, deep navy/near-black background (`#0b0f1a`), glassy cards (`bg-white/5`, `backdrop-blur`, soft borders `border-white/10`), accent cyan (`#22d3ee`), verdict colours green/amber/red. Font: Inter. Rounded-2xl everywhere. Subtle framer-motion fade/slide on results. Fully responsive (mobile first).

### Scanner page
1. Hero: shield logo, "Is this a scam? Paste it. We'll tell you why." 
2. `InputTabs` — Message / Email / URL / Website with icons, large textarea or input, "Try an example" dropdown (loads samples), big **Analyze** button with loading shimmer.
3. Result panel:
   - `RiskGauge` — animated semi-circle gauge 0–100 with verdict label and colour.
   - Summary sentence in large friendly text + scam type chip.
   - `HighlightedText` — original content with suspicious phrases highlighted by category colour; hover shows the reason.
   - `ReasonCard` list — icon per category, title, one-line detail, evidence in a code-style pill, small badge "Rule" or "AI".
   - `UrlBreakdown` — for each link, show it split into coloured parts (subdomain / domain / TLD / path) with the suspicious part underlined in red and a tooltip explaining.
   - `SafetyTips` — "What should I do?" steps + fixed India helpful actions: report at **cybercrime.gov.in**, call **1930** (National Cyber Crime Helpline), forward spam SMS to **7726** where supported, and report via **Sanchar Saathi – Chakshu** portal.
   - "Copy report" button (plain-text summary to share with family).

### History page
Table/cards of past scans with verdict chips, plus simple stats (counts by verdict, pie of scam types using a tiny SVG, no heavy chart library).

### Learn page (security awareness — judges care about this)
- 6 short cards: "How to read a URL", "OTP is never asked by banks", "Digital arrest is not real", "Check the sender", "Too good to be true", "Urgency is a trick".
- `QuizCard`: "Spot the scam" — shows 8 sample messages one by one, user picks Safe/Scam, then reveals ScamScan's explanation. Show final score.

Accessibility: proper labels, keyboard navigable tabs, colour is never the only signal (always text verdict too).

---

## 9. Demo samples (`samples/demo_cases.json`)

Create at least 12 original samples (write them yourself), mixed types and verdicts, e.g.:
- SBI KYC SMS with `sbi-kyc-update.xyz` link → Dangerous
- Electricity bill disconnection tonight + call number → Dangerous
- "Digital arrest" CBI threat WhatsApp → Dangerous
- Telegram "like videos earn ₹5000 daily" → Dangerous
- Lottery KBC winner message → Dangerous
- Courier "parcel held, pay ₹25 redelivery" with shortened link → Dangerous
- Raw email pretending to be PayPal from gmail with Reply-To mismatch → Dangerous
- URL `http://paytmm-rewards.top/claim` → Dangerous
- URL `https://xn--googl-fsa.com` style punycode → Suspicious/Dangerous
- Legit OTP SMS "Do not share this OTP with anyone" → Looks Safe (make sure rules don't wrongly flag this — handle "do not share" negation)
- Normal Amazon order shipped email from real domain → Looks Safe
- Friend's casual Hinglish message → Looks Safe

**Negation handling:** if an OTP/password phrase is preceded within 5 words by "do not", "don't", "never", "mat", "kabhi nahi", do not fire the credentials signal.

---

## 10. Tests

pytest, simple and readable:
- Levenshtein and entropy correctness
- Each URL rule fires on a crafted example and not on the real brand domain
- Negation case for OTP
- Email Reply-To and display-name spoof
- Scoring thresholds and overrides
- Accuracy script `backend/tests/test_samples.py`: runs all demo cases rules-only and asserts verdict matches expected for ≥ 90%

Print a small accuracy table (expected vs got) when run with `-s`.

---

## 11. README.md

Include: problem, how it works (diagram in Mermaid showing Input → Rule engine + URL/Email/Website analysers → Groq AI → Score fusion → Explained result), setup steps, `.env` setup, how to run backend and frontend, screenshots placeholders, sample results, limitations, and future scope (browser extension, screenshot OCR with a Groq vision model, WhatsApp bot, domain age via WHOIS, community reporting).

Run commands:
```
cd backend && python -m venv venv && pip install -r requirements.txt && uvicorn app.main:app --reload
cd frontend && npm install && npm run dev
```

---

## 12. Build order (do it in this sequence, verify each step)

1. Backend skeleton + `/api/health`
2. `url_checks.py` + tests
3. `text_rules.py` + negation + tests
4. `email_checks.py` + tests
5. `scoring.py` + tests, then `/api/analyze` working rules-only
6. Groq integration with fallback and JSON validation
7. `website_checks.py` with safe fetch
8. History + stats in SQLite
9. Frontend scanner page with all result components
10. History and Learn pages + quiz
11. Demo samples + accuracy test
12. README, final polish, check that **no comments exist anywhere** (search the codebase for `#`, `//`, `/*`, `"""` and remove them)

---

## 13. Judging focus mapping

| Judging point | Where we win |
|---|---|
| Detection accuracy | Hybrid rules + LLM, lookalike/punycode/header checks, accuracy test on samples |
| Explanation | Every flag has title + detail + exact evidence, text highlighting, URL part breakdown |
| Usability | 4 input types, examples, one-click analyse, plain language, mobile friendly, copy report |
| Security awareness | Learn page, quiz, India helplines (1930, cybercrime.gov.in, Chakshu), safe actions |
| Technical implementation | Clean FastAPI + React, original heuristics, safe fetching, fallback when AI fails, tests |

Build it clean, simple, and beautiful.