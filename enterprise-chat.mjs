/* enterprise-chat.mjs */
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';
import path from 'path';
import readline from 'readline';

// Manual .env parser for Zero-Dependency mode
function loadEnv() {
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      if (line.includes('=')) {
        const [key, value] = line.split('=');
        process.env[key.trim()] = value.trim().replace(/^"(.*)"$/, '$1');
      }
    }
    console.log("✅ .env file loaded.");
  }
}

loadEnv();

const API_KEYS = process.env.VITE_GEMINI_API_KEYS ? process.env.VITE_GEMINI_API_KEYS.split(',') : [];
const CONTEXT_PATH = path.join(process.cwd(), 'business-context.txt');

if (API_KEYS.length === 0) {
  console.error("❌ ERROR: No API keys found in .env file.");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEYS[0]);
const model = genAI.getGenerativeModel({ 
  model: "gemini-1.5-pro",
  systemInstruction: "You are the Lead Engineer and Strategic Advisor for FourIqTech. You have been provided with the entire project context (code, leads, services). Your goal is to help the founder develop their 'Autonomous SEO & Outreach Agency'. Speak professionally but directly. Always reference the existing code or services when giving advice."
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function startChat() {
  console.log("--------------------------------------------------");
  console.log("🚀 FOURIQTECH ENTERPRISE CHIP (Bypassing Policies)");
  console.log("--------------------------------------------------");

  let context = "";
  if (fs.existsSync(CONTEXT_PATH)) {
    console.log("🧠 Loading Business Brain (220k tokens)...");
    context = fs.readFileSync(CONTEXT_PATH, 'utf8');
    console.log("✅ Brain Loaded. AI is ready to discuss your project.");
  } else {
    console.warn("⚠️ Warning: business-context.txt not found. AI wont have full folder context.");
  }

  const chat = model.startChat({
    history: [
      {
        role: "user",
        parts: [{ text: `Here is my entire business folder as context for our conversation:\n\n${context}` }],
      },
      {
        role: "model",
        parts: [{ text: "I have reviewed your entire FourIqTech codebase, your services, and your leads. I am ready to help you develop your Autonomous Agency. What is your vision for what we are building today?" }],
      },
    ],
  });

  console.log("\nAI: I have reviewed everything. What are we trying to develop today? (Type 'exit' to quit)\n");

  const askQuestion = () => {
    rl.question("YOU: ", async (userInput) => {
      if (userInput.toLowerCase() === 'exit') {
        rl.close();
        return;
      }

      console.log("\nAI thinking...");
      try {
        const result = await chat.sendMessage(userInput);
        const response = await result.response;
        console.log("\nAI: " + response.text() + "\n");
      } catch (err) {
        console.error("❌ Error talking to Gemini:", err.message);
      }
      
      askQuestion();
    });
  };

  askQuestion();
}

startChat();
