import { submitToStaging } from '../.github/scripts/agency-core.mjs';
import { spawn } from 'child_process';
import path from 'path';

async function testAutomatedPush() {
  console.log('🧪 Starting Automated Push Test...');
  
  const mockCode = `
import React from 'react';

const AutomatedTestService = () => {
  return (
    <div className="pt-24 pb-12 px-6 bg-slate-900 text-white min-h-screen">
      <h1 className="text-5xl font-bold mb-8">Automated Verification Page</h1>
      <p className="text-xl text-slate-400">If you see this on GitHub, the Auto-Commit pipeline is fully stabilized.</p>
      <div className="mt-12 p-8 border border-emerald-500/30 bg-emerald-500/5 rounded-2xl">
        <h2 className="text-2xl font-semibold mb-4 text-emerald-400">Pipeline Status: ✅ ACTIVE</h2>
        <ul className="space-y-3 text-slate-300">
          <li>• Auto-Approval: Functional</li>
          <li>• Agent-to-Publisher Trigger: Functional</li>
          <li>• Git Authentication: Verified</li>
        </ul>
      </div>
    </div>
  );
};

export default AutomatedTestService;
  `;

  const payload = JSON.stringify({
    target_file: 'src/pages/services/AutomatedTestService.tsx',
    route: '/services/automated-test-verification',
    code: mockCode
  });

  console.log('📦 Submitting mock service page to staging...');
  await submitToStaging({
    type: 'landing_page',
    department: 'Structural Team',
    title: 'AutomatedTestService.tsx',
    content: payload,
    metadata: { test: true, trigger: 'agentic_verification' }
  });

  console.log('🚀 Triggering Publisher (simulating Agent end-of-task)...');
  const pub = spawn('node', ['--env-file=.env', '.github/scripts/publisher.mjs'], {
    cwd: process.cwd(),
    stdio: 'inherit'
  });

  pub.on('close', (code) => {
    console.log(`\n🏁 Test finished. Publisher exited with code ${code}`);
    if (code === 0) {
      console.log('✅ SUCCESS: The page should now be live on GitHub.');
    } else {
      console.log('❌ FAILURE: Check the logs above for Git errors.');
    }
  });
}

testAutomatedPush().catch(console.error);
