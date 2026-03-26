import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

SMTP_HOST = 'smtp.hostinger.com'
SMTP_PORT = 587
SMTP_USER = 'hello@fouriqtech.com'
SMTP_PASS = '#Fouriq26'
RECIPIENT = "221263107009setice@gmail.com"

msg = MIMEMultipart('alternative')
# Strict adherence to hello@fouriqtech.com. No Reply-To headers for karm@.
msg['From'] = f"Karm Joshi <{SMTP_USER}>"
msg['To'] = RECIPIENT
msg['Subject'] = "salon performance"

email_body = """Hi there,

Just checking in on the site performance. I noticed a few delayed render times on mobile for the main landing page.

Is this something your agency is already looking into?

Best,
Karm"""

msg.attach(MIMEText(email_body, 'plain'))

try:
    print(f"   🔒 Connecting to {SMTP_HOST}:{SMTP_PORT} (STARTTLS)...")
    server = smtplib.SMTP(SMTP_HOST, SMTP_PORT)
    server.starttls()
    server.login(SMTP_USER, SMTP_PASS)
    server.sendmail(SMTP_USER, RECIPIENT, msg.as_string())
    server.quit()
    print("✅ Strict Hello@ Test Email Sent Successfully.")
except Exception as e:
    print("❌ Failed SMTP:", e)
