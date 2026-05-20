import dotenv from 'dotenv';
dotenv.config();

// ═══════════════════════════════════════════════════════════════════════
// 🐙 GITHUB API MODULE — Push code without git CLI
// ═══════════════════════════════════════════════════════════════════════
// Works from ANY environment (Render, GitHub Actions, local).
// No git clone, no filesystem dependency, no merge conflicts.
//
// Usage:
//   import { githubCreateFile, githubUpdateFile, githubCommitMultiple } from './github-api.mjs';
//   await githubCreateFile('src/pages/services/NewPage.tsx', code, 'Created new service page');
//   await githubCommitMultiple([{ path: 'file1.tsx', content: '...' }], 'Deployed 2 pages');
// ═══════════════════════════════════════════════════════════════════════

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = 'KarmJoshi';
const REPO_NAME = 'FourIqTech';
const BRANCH = 'main';
const API_BASE = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`;

function headers() {
  return {
    'Authorization': `token ${GITHUB_TOKEN}`,
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
}

// ═══════════════════════════════════════════════════════════════════════
// GET FILE — Check if file exists and get its SHA (needed for updates)
// ═══════════════════════════════════════════════════════════════════════
export async function githubGetFile(filePath) {
  try {
    const res = await fetch(`${API_BASE}/contents/${filePath}?ref=${BRANCH}`, { headers: headers() });
    if (res.ok) {
      const data = await res.json();
      return { exists: true, sha: data.sha, content: Buffer.from(data.content, 'base64').toString('utf8') };
    }
    return { exists: false, sha: null, content: null };
  } catch {
    return { exists: false, sha: null, content: null };
  }
}

// ═══════════════════════════════════════════════════════════════════════
// CREATE OR UPDATE FILE — Single file commit
// ═══════════════════════════════════════════════════════════════════════
export async function githubPutFile(filePath, content, commitMessage) {
  if (!GITHUB_TOKEN) {
    console.error('   ❌ GITHUB_TOKEN not set. Cannot push.');
    return { success: false, error: 'No token' };
  }

  // Check if file exists (need SHA for update)
  const existing = await githubGetFile(filePath);
  
  const body = {
    message: commitMessage,
    content: Buffer.from(content).toString('base64'),
    branch: BRANCH,
  };
  
  if (existing.exists) {
    body.sha = existing.sha; // Required for updates
  }

  const res = await fetch(`${API_BASE}/contents/${filePath}`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify(body),
  });

  if (res.ok) {
    const data = await res.json();
    console.log(`   ✅ GitHub: ${existing.exists ? 'Updated' : 'Created'} ${filePath}`);
    return { success: true, sha: data.content.sha, url: data.content.html_url };
  } else {
    const err = await res.json();
    console.error(`   ❌ GitHub API error: ${err.message}`);
    return { success: false, error: err.message };
  }
}

// Aliases
export const githubCreateFile = githubPutFile;
export const githubUpdateFile = githubPutFile;

// ═══════════════════════════════════════════════════════════════════════
// COMMIT MULTIPLE FILES — Atomic multi-file commit via Git Trees API
// ═══════════════════════════════════════════════════════════════════════
export async function githubCommitMultiple(files, commitMessage) {
  if (!GITHUB_TOKEN) {
    console.error('   ❌ GITHUB_TOKEN not set.');
    return { success: false, error: 'No token' };
  }

  if (files.length === 0) {
    return { success: true, message: 'No files to commit' };
  }

  try {
    // Step 1: Get the latest commit SHA on the branch
    const refRes = await fetch(`${API_BASE}/git/ref/heads/${BRANCH}`, { headers: headers() });
    if (!refRes.ok) throw new Error(`Failed to get branch ref: ${refRes.status}`);
    const refData = await refRes.json();
    const latestCommitSha = refData.object.sha;

    // Step 2: Get the tree SHA of the latest commit
    const commitRes = await fetch(`${API_BASE}/git/commits/${latestCommitSha}`, { headers: headers() });
    if (!commitRes.ok) throw new Error(`Failed to get commit: ${commitRes.status}`);
    const commitData = await commitRes.json();
    const baseTreeSha = commitData.tree.sha;

    // Step 3: Create blobs for each file
    const treeItems = [];
    for (const file of files) {
      const blobRes = await fetch(`${API_BASE}/git/blobs`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ content: file.content, encoding: 'utf-8' }),
      });
      if (!blobRes.ok) throw new Error(`Failed to create blob for ${file.path}`);
      const blobData = await blobRes.json();
      
      treeItems.push({
        path: file.path,
        mode: '100644', // Regular file
        type: 'blob',
        sha: blobData.sha,
      });
    }

    // Step 4: Create a new tree
    const treeRes = await fetch(`${API_BASE}/git/trees`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ base_tree: baseTreeSha, tree: treeItems }),
    });
    if (!treeRes.ok) throw new Error(`Failed to create tree: ${treeRes.status}`);
    const treeData = await treeRes.json();

    // Step 5: Create a new commit
    const newCommitRes = await fetch(`${API_BASE}/git/commits`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({
        message: commitMessage,
        tree: treeData.sha,
        parents: [latestCommitSha],
      }),
    });
    if (!newCommitRes.ok) throw new Error(`Failed to create commit: ${newCommitRes.status}`);
    const newCommitData = await newCommitRes.json();

    // Step 6: Update the branch reference to point to new commit
    const updateRefRes = await fetch(`${API_BASE}/git/refs/heads/${BRANCH}`, {
      method: 'PATCH',
      headers: headers(),
      body: JSON.stringify({ sha: newCommitData.sha }),
    });
    if (!updateRefRes.ok) throw new Error(`Failed to update ref: ${updateRefRes.status}`);

    console.log(`   ✅ GitHub: Committed ${files.length} files → ${newCommitData.sha.substring(0, 7)}`);
    return { success: true, sha: newCommitData.sha, files: files.length };
  } catch (err) {
    console.error(`   ❌ GitHub multi-commit failed: ${err.message}`);
    return { success: false, error: err.message };
  }
}

// ═══════════════════════════════════════════════════════════════════════
// DELETE FILE
// ═══════════════════════════════════════════════════════════════════════
export async function githubDeleteFile(filePath, commitMessage) {
  const existing = await githubGetFile(filePath);
  if (!existing.exists) return { success: true, message: 'File does not exist' };

  const res = await fetch(`${API_BASE}/contents/${filePath}`, {
    method: 'DELETE',
    headers: headers(),
    body: JSON.stringify({ message: commitMessage, sha: existing.sha, branch: BRANCH }),
  });

  if (res.ok) {
    console.log(`   ✅ GitHub: Deleted ${filePath}`);
    return { success: true };
  }
  const err = await res.json();
  return { success: false, error: err.message };
}

// ═══════════════════════════════════════════════════════════════════════
// HEALTH CHECK — Verify token works
// ═══════════════════════════════════════════════════════════════════════
export async function githubHealthCheck() {
  if (!GITHUB_TOKEN) return { ok: false, error: 'No GITHUB_TOKEN set' };
  
  const res = await fetch(`${API_BASE}`, { headers: headers() });
  if (res.ok) {
    const data = await res.json();
    return { ok: true, repo: data.full_name, private: data.private };
  }
  return { ok: false, error: `HTTP ${res.status}` };
}
