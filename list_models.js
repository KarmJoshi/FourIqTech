import dotenv from 'dotenv';
dotenv.config();

const rawKeys = process.env.VITE_GEMINI_API_KEYS || process.env.GEMINI_API_KEY || "";
const API_KEYS = rawKeys.split(",").map(k => k.trim()).filter(k => k.length > 0);
const apiKey = API_KEYS[0];

async function listModels() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  const res = await fetch(url);
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}

listModels();
