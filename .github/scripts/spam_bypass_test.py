import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

SMTP_HOST = 'smtp.hostinger.com'
SMTP_PORT = 587
SMTP_USER = 'hello@fouriqtech.com'
SMTP_PASS = '#Fouriq26'
RECIPIENT = "221263107009setice@gmail.com"

msg = MIMEMultipart('alternative')
msg['From'] = f"Karm Joshi <{SMTP_USER}>"
msg['To'] = RECIPIENT
msg['Subject'] = "salon performance"
msg['Reply-To'] = "karm@fouriqtech.com"

# The "Conversational Opener" Template
# New domains MUST use this extremely short format to skip the spam folder.
# You cannot send detailed technical pitches in the very first email.
email_body = """Hey there,

Just found the site. The branding for Hershesons looks great. 

I was browsing on my phone and noticed it takes a few seconds for the page to fully load compared to Larry King Hair. 

We actually help London agencies fix this mobile delay so you don't lose potential clients who bounce. 

Mind if I send over a quick video showing what I mean?

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
    print("✅ Ultra-Short Conversational Email Sent Successfully.")
except Exception as e:
    print("❌ Failed SMTP:", e)
