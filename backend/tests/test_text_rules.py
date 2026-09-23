from app.analyzers.text_rules import analyze_text_rules

def test_legitimate_otp_with_negation():
    text = "Dear Customer, 482910 is your secret code. Do not share this OTP with anyone, including bank staff."
    signals, highlights = analyze_text_rules(text)
    signal_ids = [s.id for s in signals]
    assert "text_credentials" not in signal_ids

def test_malicious_otp_request():
    text = "Kindly share OTP received on your mobile to verify your transaction."
    signals, highlights = analyze_text_rules(text)
    signal_ids = [s.id for s in signals]
    assert "text_credentials" in signal_ids

def test_hinglish_negation():
    text = "Yeh confidential code hai, apna OTP kabhi mat share karna kisi se."
    signals, highlights = analyze_text_rules(text)
    signal_ids = [s.id for s in signals]
    assert "text_credentials" not in signal_ids

def test_urgency_and_threat_signals():
    text = "URGENT: Legal action initiated against your PAN card. CBI digital arrest warrant issued. Contact police immediately within 24 hours."
    signals, highlights = analyze_text_rules(text)
    signal_ids = [s.id for s in signals]
    assert "text_urgency" in signal_ids
    assert "text_threat" in signal_ids

def test_reward_lottery_signal():
    text = "Congratulations you won ₹500000 in KBC lucky draw! Claim prize now."
    signals, highlights = analyze_text_rules(text)
    signal_ids = [s.id for s in signals]
    assert "text_reward" in signal_ids

def test_remote_access_signal():
    text = "Customer care: please install AnyDesk on your mobile phone to complete setup."
    signals, highlights = analyze_text_rules(text)
    signal_ids = [s.id for s in signals]
    assert "text_remote_access" in signal_ids

def test_job_task_signal():
    text = "Work from home part time job. Like YouTube videos and get daily income ₹3000 on telegram task."
    signals, highlights = analyze_text_rules(text)
    signal_ids = [s.id for s in signals]
    assert "text_job" in signal_ids
