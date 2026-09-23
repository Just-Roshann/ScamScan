from app.analyzers.email_checks import analyze_email_content

def test_email_reply_to_mismatch():
    raw_email = (
        "From: service@paypal.com\n"
        "Reply-To: attacker@hacker-server.net\n"
        "Subject: Account alert\n\n"
        "Please check your account details."
    )
    signals, highlights, urls, body = analyze_email_content(raw_email)
    signal_ids = [s.id for s in signals]
    assert "email_replyto_mismatch" in signal_ids

def test_display_name_freemail_spoof():
    raw_email = (
        "From: State Bank of India Support <sbi.alerts9921@gmail.com>\n"
        "Subject: KYC pending\n\n"
        "Your account is pending verification."
    )
    signals, highlights, urls, body = analyze_email_content(raw_email)
    signal_ids = [s.id for s in signals]
    assert "email_display_spoof" in signal_ids
    assert "email_freemail_spoof" in signal_ids

def test_auth_failure_header():
    raw_email = (
        "From: alerts@hdfcbank.com\n"
        "Authentication-Results: mx.google.com; dkim=fail; spf=softfail\n"
        "Subject: Transaction Notice\n\n"
        "Security update required."
    )
    signals, highlights, urls, body = analyze_email_content(raw_email)
    signal_ids = [s.id for s in signals]
    assert "email_auth_fail" in signal_ids

def test_link_text_target_mismatch():
    raw_email = (
        "From: support@amazon.in\n"
        "Subject: Order update\n"
        "Content-Type: text/html\n\n"
        "<html><body>Click here: <a href='http://evil-phish.xyz/login'>amazon.in/orders</a></body></html>"
    )
    signals, highlights, urls, body = analyze_email_content(raw_email)
    signal_ids = [s.id for s in signals]
    assert "email_hidden_link_target" in signal_ids

def test_dangerous_attachment_mention():
    raw_email = (
        "From: hr@recruitment-desk.com\n"
        "Subject: Job Offer Letter\n\n"
        "Please find the enclosed offer_details.exe and run it."
    )
    signals, highlights, urls, body = analyze_email_content(raw_email)
    signal_ids = [s.id for s in signals]
    assert "email_dangerous_attachment" in signal_ids

def test_legitimate_order_email():
    raw_email = (
        "From: auto-confirm@amazon.in\n"
        "Subject: Your order has been dispatched\n\n"
        "Thank you for shopping. Track your package on our official app."
    )
    signals, highlights, urls, body = analyze_email_content(raw_email)
    signal_ids = [s.id for s in signals]
    assert "email_display_spoof" not in signal_ids
    assert "email_replyto_mismatch" not in signal_ids
