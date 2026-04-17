import fs from 'fs';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import yaml from 'js-yaml';
import { submitToStaging, logActivity, getModelsForRole, smartCall } from './agency-core.mjs';

const INDEX_HTML_PATH = path.join(process.cwd(), 'index.html');
const SEO_COMPONENT_PATH = path.join(process.cwd(), 'src/components/SEO.tsx');
const TECHNICAL_LOG_PATH = path.join(process.cwd(), '.github/technical_seo_log.json');

// ═══════════════════════════════════════════════════════════════════════
// 🔍 SITE AUDITOR
// ═══════════════════════════════════════════════════════════════════════
async function getAuditReport() {
  const indexHtml = fs.readFileSync(INDEX_HTML_PATH, 'utf8');
  const seoComponent = fs.readFileSync(SEO_COMPONENT_PATH, 'utf8');
  
  const models = await getModelsForRole('qa');
  const raw = await smartCall(models, `
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
  const models = await getModelsForRole('manager');
  const raw = await smartCall(models, `
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
      
      const models = await getModelsForRole('builder');
      const rawRes = await smartCall(models, `
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
      `, 'Execution Agent', { json: false });
      
      // Clean up markdown block if the model included it despite instructions
      let cleanCode = rawRes.trim();
      if (cleanCode.startsWith('\`\`\`')) {
        cleanCode = cleanCode.replace(/^\`\`\`[a-z]*\\n/, '').replace(/\\n\`\`\`$/, '');
      }
      
      const payload = JSON.stringify({
        target_file: fix.target_file,
        code: cleanCode
      });
      
      console.log(`   📦 SUBMITTING to Manager Staging Queue...`);
      await submitToStaging({
        type: 'technical_patch',
        department: 'Technical Team',
        title: `Tech Patch: ${fix.issue}`,
        content: payload,
        metadata: { action: fix.action, target: fix.target_file }
      });
      await logActivity('Technical Team', `🔧 Submitted technical patch for "${fix.target_file}" to Staging Queue.`, "publish");

      console.log(`   ✅ Successfully queued patch for ${targetBaseName}`);
    } catch (e) {
      console.error(`   ❌ Failed to generate patch for ${fix.target_file}: ${e.message}`);
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
  
  console.log('╚═══════════════════════════════════════════════════════════╝');

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
