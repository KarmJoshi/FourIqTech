import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import csv
from datetime import datetime

SMTP_HOST = "smtp.hostinger.com"
SMTP_PORT = 587
SMTP_USER = "hello@fouriqtech.com"
SMTP_PASS = "#Fouriq26"
RECIPIENT = "221263107009setice@gmail.com"
CSV_PATH = ".github/outreach_log.csv"

def log_to_csv(company, email, subject, status, details):
    headers = ['Date', 'Company', 'Email', 'Subject', 'Status', 'Details']
    row = [datetime.now().isoformat(), company, email, subject, status, details]
    
    file_exists = os.path.exists(CSV_PATH)
    with open(CSV_PATH, mode='a', newline='') as f:
        writer = csv.writer(f)
        if not file_exists:
            writer.writerow(headers)
        writer.writerow(row)

def dispatch():
    print(f"🚀 FINAL INBOX TEST: Sending detailed pitch to {RECIPIENT}...")
    # Low-profile, human subject line
    subject = "your website" 
    company = "TEST BUSINESS 2"

    msg = MIMEMultipart()
    msg['From'] = f"Karm Joshi <{SMTP_USER}>"
    msg['To'] = RECIPIENT
    msg['Subject'] = subject
    msg['Reply-To'] = "karm@fouriqtech.com"

    # Detailed, professional, but zero 'marketing' keywords
    body = """Hi there,

I was reviewing the digital setup for your site today. You've done a great job with the branding, but I noticed a specific technical bottleneck that is likely slowing down your mobile experience for potential clients.

Right now, the site relies heavily on client-side rendering, which creates a slight delay before the content actually appears on mobile networks. For a premium brand, that initial half-second is where you either win or lose a customer.

We've been helping firms move to a more modern Next.js architecture which eliminates this delay entirely. It makes the site feel much faster and more "premium" to the end user.

I've put together a few technical notes on how this would look for your specific site. Would you be open to a quick chat next week to see if it makes sense for you?

Best,

Karm Joshi
Founder, FourIqTech"""

    # Strictly Plain-Text. No HTML. This is the highest deliverability possible.
    msg.attach(MIMEText(body, 'plain'))

    try:
        print(f"   🔒 Connecting to {SMTP_HOST}:{SMTP_PORT} (STARTTLS)...")
        server = smtplib.SMTP(SMTP_HOST, SMTP_PORT)
        server.starttls()
        server.login(SMTP_USER, SMTP_PASS)
        server.sendmail(SMTP_USER, RECIPIENT, msg.as_string())
        server.quit()
        print(f"✅ SUCCESS: Detailed email delivered to {RECIPIENT}!")
        log_to_csv(company, RECIPIENT, subject, "sent", "Final Detailed Plaintext Test")
    except Exception as e:
        print(f"❌ FAILURE: {str(e)}")
        log_to_csv(company, RECIPIENT, subject, "failed", str(e))

if __name__ == "__main__":
    dispatch()
