import { submitToStaging } from '../.github/scripts/agency-core.mjs';
import { spawn } from 'child_process';
import path from 'path';

async function triggerLiveDeployment() {
  console.log('🧪 Triggering Live Deployment...');
  
  const mockCode = `
import React from 'react';

const TriggerLiveDeploy = () => {
  return (
    <div className="pt-24 pb-12 px-6">
      <h1>Deployment Verification Page</h1>
    </div>
  );
};
export default TriggerLiveDeploy;
  `;

  const payload = JSON.stringify({
    target_file: 'src/pages/services/TriggerLiveDeploy.tsx',
    route: '/services/trigger-live-deploy',
    code: mockCode
  });

  await submitToStaging({
    type: 'landing_page',
    department: 'Structural Team',
    title: 'TriggerLiveDeploy.tsx',
    content: payload,
    metadata: { test: true }
  });

  const pub = spawn('node', ['--env-file=.env', '.github/scripts/publisher.mjs'], {
    cwd: process.cwd(),
    stdio: 'inherit'
  });
}

triggerLiveDeployment().catch(console.error);
