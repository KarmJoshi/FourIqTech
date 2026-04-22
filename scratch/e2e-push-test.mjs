import { submitToStaging } from '../.github/scripts/agency-core.mjs';
import { spawn } from 'child_process';

async function e2eTest() {
  console.log('═══════════════════════════════════════════════');
  console.log('🧪 E2E TEST: Simulating Dev Agent → Publisher → GitHub');
  console.log('═══════════════════════════════════════════════\n');

  // 1. Create a mock landing page (exactly what seo-dev-agent.mjs does)
  const mockCode = `import React from 'react';
const E2EVerificationPage = () => (
  <div style={{ padding: '100px 20px', textAlign: 'center', background: '#0f172a', color: 'white', minHeight: '100vh' }}>
    <h1 style={{ fontSize: '3rem' }}>E2E Pipeline Verified</h1>
    <p style={{ color: '#94a3b8', marginTop: '1rem' }}>
      Timestamp: ${new Date().toISOString()}
    </p>
    <p style={{ color: '#22c55e', marginTop: '2rem', fontSize: '1.5rem' }}>
      ✅ This page was auto-generated, auto-approved, and auto-pushed to GitHub.
    </p>
  </div>
);
export default E2EVerificationPage;`;

  const payload = JSON.stringify({
    target_file: 'src/pages/services/E2EVerificationPage.tsx',
    route: '/services/e2e-verification',
    code: mockCode
  });

  // 2. Submit to staging (agency-core checks isAutoCommit and auto-approves)
  console.log('📦 Step 1: Submitting to staging (auto-approve if isAutoCommit=true)...');
  const stagingId = await submitToStaging({
    type: 'landing_page',
    department: 'Structural Team',
    title: 'E2EVerificationPage.tsx',
    content: payload,
    metadata: { test: true, purpose: 'e2e_verification' }
  });
  console.log(`   ✅ Staging ID: ${stagingId}\n`);

  // 3. Trigger publisher (exactly what seo-dev-agent.mjs and seo-auto-poster.mjs do)
  console.log('🚀 Step 2: Triggering Publisher...');
  const pub = spawn('node', ['--env-file=.env', '.github/scripts/publisher.mjs'], {
    cwd: process.cwd(),
    stdio: 'inherit'
  });

  pub.on('close', (code) => {
    console.log('\n═══════════════════════════════════════════════');
    if (code === 0) {
      console.log('✅ E2E TEST PASSED — Page should now be on GitHub!');
    } else {
      console.log(`❌ E2E TEST FAILED — Publisher exited with code ${code}`);
    }
    console.log('═══════════════════════════════════════════════');
  });
}

e2eTest().catch(err => {
  console.error('💥 Test script error:', err.message);
  process.exit(1);
});
