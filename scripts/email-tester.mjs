import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

// ═══════════════════════════════════════════════════════════════════════
// 📧 SMTP CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════
const smtpConfig = {
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
};

async function sendTestEmail(targetEmail, subject, body) {
  if (!smtpConfig.host || !smtpConfig.auth.user || !smtpConfig.auth.pass) {
    console.error("❌ SMTP credentials missing in .env (SMTP_HOST, SMTP_USER, SMTP_PASS)");
    process.exit(1);
  }

  const transporter = nodemailer.createTransport(smtpConfig);

  console.log(`\n📧 Sending test outreach to: ${targetEmail}...`);
  console.log(`   Host: ${smtpConfig.host}:${smtpConfig.port}`);
  console.log(`   From: ${smtpConfig.auth.user}\n`);

  try {
    const info = await transporter.sendMail({
      from: `"Karm Joshi (FourIqTech)" <${smtpConfig.auth.user}>`,
      to: targetEmail,
      subject: subject || "Quick question about your website performance",
      text: body || "Hi,\n\nI noticed a few technical issues on your site that might be affecting your Google ranking.\n\nWould you be open to a quick 15-minute call?\n\nBest,\nKarm Joshi",
    });

    console.log(`✅ Email sent successfully!`);
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`\n💡 TIP: Check your spam folder at ${targetEmail} to verify deliverability.`);
  } catch (error) {
    console.error(`❌ Failed to send email: ${error.message}`);
    if (error.code === 'EAUTH') {
      console.log("   👉 Hint: Check your SMTP password. If using Gmail, you need an 'App Password'.");
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════
// 🏠 MAIN
// ═══════════════════════════════════════════════════════════════════════
const args = process.argv.slice(2);
const target = args[0];

if (!target) {
  console.log("❌ Usage: node scripts/email-tester.mjs [target-email]");
  console.log("   Example: node scripts/email-tester.mjs test@gmail.com");
  process.exit(1);
}

sendTestEmail(target);
