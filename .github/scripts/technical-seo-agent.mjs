import fs from 'fs';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import yaml from 'js-yaml';

// ═══════════════════════════════════════════════════════════════════════
// ⚙️ FOURIQTECH TECHNICAL SEO & PERFORMANCE AGENT — V1.0
// ═══════════════════════════════════════════════════════════════════════
// This agent is a separate "Technical Team" responsible for:
//   🚀 PERFORMANCE  → Core Web Vitals (LCP, CLS, FID), asset optimization
//   🛠️ ON-PAGE SEO  → Meta tags, Canonical URLs, H1-H6 hierarchy, Image Alt tags
//   📦 STRUCTURE    → JSON-LD, Robots.txt, Sitemap health
//
// Architecture:
//   🔍 SITE AUDITOR     → Scans code for technical debt, performance bottlenecks
//   🧠 TECHNICAL MANAGER → 15-year SEO Architect; decides on high-ROI/low-risk fixes
//   🛠️ EXECUTION AGENT   → Applies changes to index.html, components, or config
// ═══════════════════════════════════════════════════════════════════════

// ── Paths ──
const INDEX_HTML_PATH = path.join(process.cwd(), 'index.html');
const SEO_COMPONENT_PATH = path.join(process.cwd(), 'src/components/SEO.tsx');
const CONFIG_PATH = path.join(process.cwd(), 'fouriqtech-seo-config.yaml');
const TECHNICAL_LOG_PATH = path.join(process.cwd(), '.github/technical_seo_log.json');

// ── API Setup (Same as V8) ──
const API_KEYS = (process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '')
  .split(',').map(k => k.trim()).filter(k => k.length > 0);

let aiClient = API_KEYS.length > 0 ? new GoogleGenAI({ apiKey: API_KEYS[0] }) : null;

async function smartCall(models, contents, agentName = 'AI') {
  for (const model of models) {
    try {
      const resp = await aiClient.models.generateContent({
        model, contents, config: { responseMimeType: "application/json" }
      });
      return resp.candidates[0].content.parts[0].text;
    } catch (err) {
      console.error(`   ⚠️ [\${agentName}] Model \${model} failed, falling back...`);
    }
  }
  throw new Error('All models exhausted.');
}

// ── Special String Call for the Execution Agent (Not JSON) ──
async function executionCall(models, contents) {
  for (const model of models) {
    try {
      const resp = await aiClient.models.generateContent({
        model, contents
      });
      return resp.candidates[0].content.parts[0].text;
    } catch (err) {
      console.error(`   ⚠️ [Execution] Model \${model} failed, falling back...`);
    }
  }
  throw new Error('All models exhausted.');
}

// ═══════════════════════════════════════════════════════════════════════
// 🔍 SITE AUDITOR
// ═══════════════════════════════════════════════════════════════════════
async function getAuditReport() {
  const indexHtml = fs.readFileSync(INDEX_HTML_PATH, 'utf8');
  const seoComponent = fs.readFileSync(SEO_COMPONENT_PATH, 'utf8');
  
  const raw = await smartCall(['gemini-3-flash-preview', 'gemini-2.5-flash'], `
    You are a Senior Technical SEO Auditor with 15 years of experience. Audit the following files for:
    1. Performance/Speed: Render-blocking resources, preconnects, asset loading.
    2. On-Page SEO: Missing/duplicate meta tags, canonicals, schema issues.
    3. Core Web Vitals: Areas prone to CLS or slow LCP.

    index.html:
    \${indexHtml.substring(0, 5000)}

    SEO.tsx:
    \${seoComponent.substring(0, 5000)}

    Return a valid JSON audit with findings and technical metrics.
  `, 'Auditor');

  return JSON.parse(raw);
}

// ═══════════════════════════════════════════════════════════════════════
// 🧠 TECHNICAL MANAGER
// ═══════════════════════════════════════════════════════════════════════
async function getManagerDecision(audit) {
  const raw = await smartCall(['gemini-3.1-flash-lite-preview', 'gemini-3-flash-preview'], `
    You are the Technical SEO Director. This is an autonomous sandbox. Only approve HIGH-ROI and LOW-RISK fixes.
    DO NOT touch the blog logic — that is handled by a separate team.
    
    AUDIT FINDINGS:
    \${JSON.stringify(audit)}

    Select the top 3 critical technical or performance fixes for today.
    Return valid JSON with 'approved_fixes' as an array. Each fix should include:
    - "issue": "" (The problem identified)
    - "action": "" (How to fix it)
    - "target_file": "" (The exact path of the file to modify, MUST be 'index.html' or 'src/components/SEO.tsx')
  `, 'Technical Manager');

  return JSON.parse(raw);
}

// ═══════════════════════════════════════════════════════════════════════
// 🛠️ EXECUTION AGENT
// ═══════════════════════════════════════════════════════════════════════
async function applyFixes(decisions) {
  console.log(`\\n⚙️ EXECUTION: Applying \${decisions.approved_fixes.length} fixes...`);
  
  for (const fix of decisions.approved_fixes) {
    console.log(`\\n   🛠️ Issue: \${fix.issue}`);
    console.log(`   💡 Action: \${fix.action}`);
    console.log(`   📄 Target: \${fix.target_file}`);
    
    // Safety check - we only allow the sandbox to touch specific approved files
    const approvedFiles = ['index.html', 'src/components/SEO.tsx'];
    
    if (!fix.target_file || !approvedFiles.some(f => fix.target_file.includes(f))) {
      console.log(`   ⚠️ Skipped: File \${fix.target_file || 'Undefined'} is outside the allowed sandbox.`);
      continue;
    }

    try {
      const cleanPath = fix.target_file.startsWith('/') ? fix.target_file.slice(1) : fix.target_file;
      const fullPath = path.join(process.cwd(), cleanPath);
      const targetBaseName = path.basename(fullPath);
      const originalCode = fs.readFileSync(fullPath, 'utf8');

      console.log(`   🧠 [Execution Agent] Rewriting \${targetBaseName}...`);
      
      const rawRes = await executionCall(['gemini-3.1-flash-lite-preview', 'gemini-3-flash-preview'], `
        You are an elite Senior Staff UI/UX Engineer and Performance Architect.
        Your task is to implement a specific technical SEO / performance fix.
        
        TARGET FILE: ${fix.target_file}
        ISSUE TO FIX: ${fix.issue}
        ACTION TO TAKE: ${fix.action}
        
        CURRENT FILE CONTENT:
        \`\`\`
        ${originalCode}
        \`\`\`
        
        Return ONLY the raw updated file content. Do not include markdown code block formatting like \`\`\`html or \`\`\`tsx. Do not include any explanation. Just return the raw code that will replace the entire file exactly as it should be written.
      `);
      
      // Clean up markdown block if the model included it despite instructions
      let cleanCode = rawRes.trim();
      if (cleanCode.startsWith('\`\`\`')) {
        cleanCode = cleanCode.replace(/^\`\`\`[a-z]*\\n/, '').replace(/\\n\`\`\`$/, '');
      }
      
      fs.writeFileSync(fullPath, cleanCode);
      console.log(`   ✅ Successfully patched \${targetBaseName}`);
    } catch (e) {
      console.error(`   ❌ Failed to patch \${fix.target_file}: \${e.message}`);
    }
  }
  
  fs.writeFileSync(TECHNICAL_LOG_PATH, JSON.stringify({
    last_run: new Date().toISOString(),
    applied_fixes: decisions.approved_fixes
  }, null, 2));
}

// ═══════════════════════════════════════════════════════════════════════
// 🚀 MAIN PIPELINE
// ═══════════════════════════════════════════════════════════════════════
async function main() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║  🛠️ FOURIQTECH TECHNICAL SEO AGENT — Autonomous Site Health ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  
  if (API_KEYS.length === 0) {
     console.error('❌ No API keys found.');
     process.exit(1);
  }

  const audit = await getAuditReport();
  const decision = await getManagerDecision(audit);
  
  if (decision.approved_fixes && decision.approved_fixes.length > 0) {
    await applyFixes(decision);
  } else {
    console.log('   ✅ No critical technical issues found today.');
  }

  console.log('\\n⚙️ TECHNICAL TEAM: Signing off. ✅');
}

main().catch(err => {
  console.error('💥 FATAL:', err.message);
  process.exit(1);
});
