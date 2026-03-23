import { GoogleGenAI } from '@google/genai';
import nodemailer from 'nodemailer';
import fs from 'fs';

async function sendSample() {
  const API_KEY = process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEYS?.split(',')[0];
  const SMTP_USER = 'karm@fouriqtech.com';
  const SMTP_PASS = '#Fouriq26'; 

  if (!API_KEY) {
    console.error('❌ No API Key found in environment.');
    return;
  }

  const aiClient = new GoogleGenAI({ apiKey: API_KEY });
  const model = aiClient.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `
    You are an Elite B2B Sales Executive at FourIqTech, a premium global web development agency.
    Write a short, professional, and hyper-personalized cold email to a potential client.
    
    STRATEGY: 
    - You are helping them out-compete their local rival.
    - Mention their current status vs their competitor's status.
    
    PROSPECT: Gielly Green (Luxury Hair Salon in London)
    COMPETITOR: Haug London Haus (Nearby rival)
    TECHNICAL FLAW: Their site is beautiful but 2s slower than Haug London, causing 40% user dropoff.
    
    YOUR VOICE: Direct, technical, and high-status. Not pushy. 
    
    Keep it under 80 words. Include a call to action for a 10-minute discovery chat.
    
    Return ONLY JSON:
    {
      "subject": "subject line",
      "body": "email body in clean HTML (<p>, <br> tags only)"
    }
  `;

  console.log('🤖 Generating elite pitch using Gemini...');
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const pitch = JSON.parse(text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1));

  const transporter = nodemailer.createTransport({
    host: 'smtp.hostinger.com',
    port: 465,
    secure: true,
    auth: { user: SMTP_USER, pass: SMTP_PASS }
  });

  console.log('📨 Dispatching sample to kkarm664@gmail.com...');
  
  await transporter.sendMail({
    from: `"Karm Joshi | FourIqTech" <${SMTP_USER}>`,
    to: 'kkarm664@gmail.com',
    subject: pitch.subject,
    html: pitch.body
  });

  console.log('✅ Sample email sent successfully! Check your inbox.');
}

sendSample().catch(err => {
    console.error('💥 Execution Error:', err.message);
});
