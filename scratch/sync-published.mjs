import pkgPrisma from '@prisma/client';
const { PrismaClient } = pkgPrisma;
import pkgPg from 'pg';
const { Pool } = pkgPg;
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function syncPublished() {
  const publishedItems = await prisma.stagingItem.findMany({
    where: { status: 'published' }
  });

  let changed = false;

  for (const item of publishedItems) {
    if (item.type === 'technical_patch') {
      const payload = JSON.parse(item.content || '{}');
      const cleanPath = payload.target_file?.startsWith('/') 
        ? payload.target_file.slice(1) : payload.target_file;
      
      if (cleanPath && payload.code) {
        const fullPath = path.join(process.cwd(), cleanPath);
        if (!fs.existsSync(fullPath) || fs.readFileSync(fullPath, 'utf8') !== payload.code) {
          fs.writeFileSync(fullPath, payload.code, 'utf8');
          console.log(`Synced missing tech patch: ${cleanPath}`);
          changed = true;
        }
      }
    } else if (item.type === 'landing_page' || item.type === 'structural_page') {
      const payload = JSON.parse(item.content || '{}');
      let finalCode = payload.code || '';
      try {
        const inner = JSON.parse(finalCode);
        if (inner.content) finalCode = inner.content;
      } catch {}
      
      if (payload.target_file) {
        const fullPath = path.join(process.cwd(), payload.target_file);
        if (!fs.existsSync(fullPath)) {
          const dirPath = path.dirname(fullPath);
          if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
          fs.writeFileSync(fullPath, finalCode, 'utf8');
          console.log(`Synced missing landing page: ${payload.target_file}`);
          changed = true;
        }
      }
    }
  }

  if (changed) {
    console.log('Force pushing recovered files to GitHub...');
    execSync('git add .');
    execSync('git commit -m "[AI-PUBLISH] Recovered missing deployed items from database [skip ci]"');
    execSync('git push origin main');
    console.log('Done!');
  } else {
    console.log('All published items are already synced locally.');
  }

  process.exit(0);
}
syncPublished();
