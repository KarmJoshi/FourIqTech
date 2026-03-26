import os
import json
import urllib.request
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

API_KEY = "AIzaSyAlDHQu3t0uAroK-YPYO_Yl5vSSqjDEfQw"

print("🧠 Generating Live AI Pitch for target: Hershesons...")

prompt = """
You are Karm Joshi, an expert technical founder.
Write a 1-sentence "Icebreaker" to open a cold email.

TARGET:
- Company: Hershesons
- Competitor: Larry King Hair (USE ONLY THE NAME, NOT THE URL)

RULES:
1. Sentence must compliment Hershesons but mention you noticed a mobile architecture gap compared to their competitor.
2. NEVER include URLs (banned by spam filters). Just use the competitor's raw name.
3. Keep it under 25 words. Super casual. Start with "I was checking out your site..."

Return a valid JSON object:
{
  "icebreaker": "I was checking out the site—love the branding, but noticed a slight mobile rendering delay compared to Larry King Hair."
}
"""

url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={API_KEY}"
data = {
    "contents": [{"parts":[{"text": prompt}]}],
    "generationConfig": {
        "responseMimeType": "application/json"
    }
}

try:
    req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req) as response:
        res_data = json.loads(response.read().decode('utf-8'))
        text_resp = res_data['candidates'][0]['content']['parts'][0]['text']
        ai_data = json.loads(text_resp)
        icebreaker = ai_data.get('icebreaker', 'I was reviewing your site and noticed a small mobile gap compared to others in your space.')
        print("✅ AI Generation Complete.")
        print(f"Icebreaker: {icebreaker}")
except Exception as e:
    print("❌ API Error:", e)
    import sys; sys.exit(1)

SMTP_HOST = 'smtp.hostinger.com'
SMTP_PORT = 587
SMTP_USER = 'hello@fouriqtech.com'
SMTP_PASS = '#Fouriq26'
RECIPIENT = "221263107009setice@gmail.com"

msg = MIMEMultipart('alternative')
msg['From'] = f"Karm Joshi <{SMTP_USER}>"
msg['To'] = RECIPIENT
msg['Subject'] = "london salon website"
msg['Reply-To'] = "karm@fouriqtech.com"

# The Verified Goldilocks Template (100% Inbox Placement Rate)
email_body = f"""Hi there,

{icebreaker}

Because the site currently utilizes client-side rendering, the browser processes a blank document before fetching the necessary JavaScript to display the interface. On cellular networks, this translates to a visual delay. For a luxury brand, that initial loading phase is where you immediately establish credibility.

We recently resolved this identical architecture issue for another boutique agency. By migrating their front-end to a Next.js static-generation framework, we eliminated the rendering delay and brought their global load times under 400 milliseconds. We also integrated fluid scroll animations to give the entire experience a premium feel.

I have mapped out the specific technical requirements to implement this upgrade for your site. Would you have a few minutes next week to review this architecture plan?

Best regards,

Karm Joshi
Founder, FourIqTech"""

msg.attach(MIMEText(email_body, 'plain'))

try:
    print(f"   🔒 Connecting to {SMTP_HOST}:{SMTP_PORT} (STARTTLS)...")
    server = smtplib.SMTP(SMTP_HOST, int(SMTP_PORT))
    server.starttls()
    server.login(SMTP_USER, SMTP_PASS)
    server.sendmail(SMTP_USER, RECIPIENT, msg.as_string())
    server.quit()
    print("✅ Live AI Pitch Sent Successfully.")
except Exception as e:
    print("❌ Failed SMTP:", e)
