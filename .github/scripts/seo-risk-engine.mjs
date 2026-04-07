import fs from 'fs';
import path from 'path';

const CWD = process.cwd();
const MEMORY_DIR = path.join(CWD, '.github/seo-memory');
const RISK_REPORT = path.join(MEMORY_DIR, 'risk-report.json');

function ensureDir() {
  if (!fs.existsSync(MEMORY_DIR)) fs.mkdirSync(MEMORY_DIR, { recursive: true });
}

function classify(opportunity) {
  const playbook = String(opportunity.playbook || '').toLowerCase();
  const type = String(opportunity.type || '').toLowerCase();
  const riskLevel = opportunity.risk_level || 'low';

  if (riskLevel === 'high') {
    return { execution: 'blocked', reason: 'duplicate_intent_risk' };
  }
  if (playbook === 'technical_fix' || type.includes('technical')) {
    return { execution: 'review_required', reason: 'technical_changes_need_review' };
  }
  if (playbook === 'content_refresh') {
    return { execution: 'safe_auto', reason: 'existing_page_refresh' };
  }
  if (playbook === 'cluster_support' || playbook === 'ctr_optimization') {
    return { execution: 'safe_auto', reason: 'support_or_ctr_iteration' };
  }
  if (playbook === 'pillar_expansion') {
    return { execution: 'review_required', reason: 'new_pillar_content' };
  }
  return { execution: 'review_required', reason: 'default_review_gate' };
}

export function buildRiskReport(opportunities = []) {
  ensureDir();
  const report = {
    generated_at: new Date().toISOString(),
    safe_auto: [],
    review_required: [],
    blocked: [],
  };

  for (const opportunity of opportunities) {
    const decision = classify(opportunity);
    const item = {
      id: opportunity.id,
      target: opportunity.target,
      department: opportunity.department,
      playbook: opportunity.playbook,
      score: opportunity.score,
      reason: decision.reason,
    };
    report[decision.execution].push(item);
  }

  fs.writeFileSync(RISK_REPORT, JSON.stringify(report, null, 2));
  return report;
}
