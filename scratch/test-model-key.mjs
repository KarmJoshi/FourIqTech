import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const key = (process.env.GEMINI_API_KEYS || '')
  .replace(/['"]/g, '').split(',')[0].trim();

const ai = new GoogleGenAI({ apiKey: key });

// Test the failing models with full response logging
const modelsToTest = ['gemini-3-flash-preview', 'gemini-2.5-flash'];

for (const model of modelsToTest) {
  console.log(`\n--- ${model} ---`);
  try {
    const resp = await ai.models.generateContent({
      model,
      contents: 'Reply ONLY with valid JSON: {"ok":true}',
      config: { responseMimeType: 'application/json', maxOutputTokens: 20 }
    });
    console.log('Full resp keys:', Object.keys(resp));
    console.log('candidates:', JSON.stringify(resp.candidates, null, 2));
    // Try alternate access paths used by @google/genai SDK
    const text = resp.text?.() ?? resp.candidates?.[0]?.content?.parts?.[0]?.text ?? 'NO_TEXT';
    console.log('text:', text);
  } catch (e) {
    console.log('Error:', e.status, e.message?.substring(0, 120));
    // If it's a response parse issue, check if resp was set
  }
}

// Also test the SDK's recommended way
console.log('\n--- SDK .text property test on gemini-2.5-flash ---');
try {
  const resp = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: 'Say hello',
    config: { maxOutputTokens: 20 }
  });
  console.log('resp.text type:', typeof resp.text);
  // Try calling it as a method or as property
  const txt = typeof resp.text === 'function' ? resp.text() : resp.text;
  console.log('text result:', txt);
} catch (e) {
  console.log('Error:', e.message?.substring(0, 120));
}
