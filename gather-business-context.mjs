/* gather-business-context.mjs */
import fs from 'fs';
import path from 'path';

// Directories and file types relevant to the Business Brain
const TARGET_DIRS = ['src', '.github', 'public'];
const TARGET_EXTENSIONS = ['.ts', '.tsx', '.mjs', '.md', '.csv', '.json', '.yaml', '.yml'];
const EXCLUDE_DIRS = ['node_modules', '.git', 'dist', '.gemini', '.orchids', '.agents'];

async function gatherContext() {
  console.log("🚀 Starting Business Brain Context Collection...");
  let context = "--- FOURIQTECH BUSINESS CONTEXT ---\n";
  context += `Collected on: ${new Date().toISOString()}\n\n`;

  function walk(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const relativePath = path.relative(process.cwd(), fullPath);
      
      if (fs.statSync(fullPath).isDirectory()) {
        if (!EXCLUDE_DIRS.some(ex => file === ex || fullPath.includes(ex))) {
          walk(fullPath);
        }
      } else if (TARGET_EXTENSIONS.includes(path.extname(file))) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          context += `--- FILE: ${relativePath} ---\n${content}\n\n`;
        } catch (err) {
          console.error(`Could not read ${relativePath}: ${err.message}`);
        }
      }
    }
  }

  TARGET_DIRS.forEach(dir => walk(path.join(process.cwd(), dir)));

  // also include some root config files
  ['package.json', 'README.md'].forEach(file => {
    const fullPath = path.join(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      context += `--- FILE: ${file} ---\n${fs.readFileSync(fullPath, 'utf8')}\n\n`;
    }
  });

  const outputPath = path.join(process.cwd(), 'business-context.txt');
  fs.writeFileSync(outputPath, context);
  
  console.log("✅ SUCCESS: Business Brain context saved to business-context.txt");
  console.log(`📏 Character count: ${context.length}`);
  console.log(`🧠 Estimated Context Window: ~${Math.ceil(context.length / 4)} tokens`);
  console.log("--------------------------------------------------");
}

gatherContext().catch(err => {
  console.error("❌ FAILED to gather context:", err);
});
