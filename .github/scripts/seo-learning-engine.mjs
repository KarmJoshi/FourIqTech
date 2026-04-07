import fs from 'fs';
import path from 'path';

const CWD = process.cwd();
const MEMORY_DIR = path.join(CWD, '.github/seo-memory');
const ACTION_HISTORY = path.join(MEMORY_DIR, 'action-history.json');
const OUTCOME_HISTORY = path.join(MEMORY_DIR, 'outcome-history.json');
const PLAYBOOK_SCORES = path.join(MEMORY_DIR, 'playbook-scores.json');
const GSC_REPORT = path.join(CWD, '.github/gsc-reports/latest.json');

function readJson(filePath, fallback) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return fallback;
  }
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2));
}

function ensureDir() {
  if (!fs.existsSync(MEMORY_DIR)) fs.mkdirSync(MEMORY_DIR, { recursive: true });
}

function extractPageMap(report) {
  const map = {};
  const categories = report?.categories || {};
  for (const items of Object.values(categories)) {
    if (!Array.isArray(items)) continue;
    for (const item of items) {
      if (!item?.slug) continue;
      map[item.slug] = {
        slug: item.slug,
        page: item.page || null,
        clicks: Number(item.clicks || 0),
        impressions: Number(item.impressions || 0),
        ctr: Number(item.ctr || 0),
        position: Number(item.position || 100),
      };
    }
  }
  return map;
}

export function recordDirectorAction(payload) {
  ensureDir();
  const history = readJson(ACTION_HISTORY, []);
  history.push({
    id: `act-${Date.now()}`,
    timestamp: new Date().toISOString(),
    ...payload,
  });
  writeJson(ACTION_HISTORY, history.slice(-200));
}

export function evaluateOutcomes() {
  ensureDir();
  const report = readJson(GSC_REPORT, {});
  const currentPages = extractPageMap(report);
  const actions = readJson(ACTION_HISTORY, []);
  const outcomes = readJson(OUTCOME_HISTORY, []);

  for (const action of actions) {
    if (!action.target_slug) continue;
    if (outcomes.some((outcome) => outcome.action_id === action.id)) continue;

    const current = currentPages[action.target_slug];
    if (!current) continue;

    const baseline = action.baseline || {};
    const delta = {
      clicks: Number((current.clicks - Number(baseline.clicks || 0)).toFixed(2)),
      impressions: Number((current.impressions - Number(baseline.impressions || 0)).toFixed(2)),
      ctr: Number((current.ctr - Number(baseline.ctr || 0)).toFixed(2)),
      position: Number((Number(baseline.position || 100) - current.position).toFixed(2)),
    };

    const successScore = Number((
      delta.clicks * 1.5 +
      delta.impressions * 0.1 +
      delta.ctr * 2 +
      delta.position * 3
    ).toFixed(2));

    outcomes.push({
      action_id: action.id,
      evaluated_at: new Date().toISOString(),
      department: action.department,
      playbook: action.playbook || action.department,
      target_slug: action.target_slug,
      baseline,
      current,
      delta,
      success_score: successScore,
      verdict: successScore > 0 ? 'positive' : successScore < -2 ? 'negative' : 'neutral',
    });
  }

  writeJson(OUTCOME_HISTORY, outcomes.slice(-400));
  return outcomes;
}

export function buildPlaybookScores() {
  ensureDir();
  const outcomes = evaluateOutcomes();
  const grouped = {};

  for (const outcome of outcomes) {
    const key = outcome.playbook || outcome.department || 'unknown';
    if (!grouped[key]) {
      grouped[key] = { runs: 0, total: 0, positives: 0, negatives: 0 };
    }
    grouped[key].runs += 1;
    grouped[key].total += outcome.success_score;
    if (outcome.verdict === 'positive') grouped[key].positives += 1;
    if (outcome.verdict === 'negative') grouped[key].negatives += 1;
  }

  const scores = Object.entries(grouped).map(([playbook, data]) => ({
    playbook,
    runs: data.runs,
    average_success: Number((data.total / data.runs).toFixed(2)),
    positive_rate: Number(((data.positives / data.runs) * 100).toFixed(1)),
    negative_rate: Number(((data.negatives / data.runs) * 100).toFixed(1)),
  })).sort((a, b) => b.average_success - a.average_success);

  writeJson(PLAYBOOK_SCORES, {
    generated_at: new Date().toISOString(),
    scores,
  });

  return scores;
}
