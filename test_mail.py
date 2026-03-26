import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# ═══════════════════════════════════════════════════════════════════════
# 🚀 FOURIQTECH EXPRESS TEST DISPATCHER
# ═══════════════════════════════════════════════════════════════════════

SMTP_HOST = "smtp.hostinger.com"
SMTP_PORT = 465
SMTP_USER = "hello@fouriqtech.com"
FROM_ADDRESS = "karm@fouriqtech.com"
SMTP_PASS = "#Fouriq26" # Based on user's hint or common pattern
RECIPIENT = "karmjoshi992@gmail.com"

def send_test_mail():
    print(f"📧 Attempting to dispatch 'Surgeon' Pitch to {RECIPIENT}...")
    
    subject = "Quick chat?"
    body = """
    <p>Hi Karm,</p>
    <p>I was just checking out your work at FourIqTech and had a quick idea I'd love to share. Do you happen to have any time for a 10-minute chat next week?</p>
    <br>
    <p>Best regards,</p>
    <p>Karm Joshi</p>
    """

    msg = MIMEMultipart()
    msg['From'] = f"Karm Joshi | FourIqTech <{FROM_ADDRESS}>"
    msg['To'] = RECIPIENT
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'html'))

    try:
        print("   🔒 Trying Port 465 (SSL) via hello@ authentication...")
        with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT) as server:
            server.login(SMTP_USER, SMTP_PASS)
            server.sendmail(FROM_ADDRESS, RECIPIENT, msg.as_string())
        print("✅ SUCCESS: Test email sent via Port 465!")
    except Exception as e:
        print(f"   ⚠️ Port 465 Failed: {str(e)}")
        try:
            print("   🔒 Retrying via Port 587 (TLS)...")
            with smtplib.SMTP(SMTP_HOST, 587) as server:
                server.starttls()
                server.login(SMTP_USER, SMTP_PASS)
                server.sendmail(SMTP_USER, RECIPIENT, msg.as_string())
            print("✅ SUCCESS: Test email sent via Port 587!")
        except Exception as e2:
            print(f"❌ FINAL FAILURE: All ports failed. Error: {str(e2)}")

if __name__ == "__main__":
    send_test_mail()
