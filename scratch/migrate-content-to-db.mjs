import pkgPg from 'pg';
const { Pool } = pkgPg;
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
dotenv.config();

// ═══════════════════════════════════════════════════════════════════════
// 📦 CONTENT MIGRATION — Seed existing blog posts into PostgreSQL
// ═══════════════════════════════════════════════════════════════════════

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrateBlogPosts() {
  const client = await pool.connect();
  
  try {
    console.log('📝 Migrating blog posts to PostgreSQL...\n');

    // Read the raw blogPosts.ts file and extract post objects
    const blogFile = fs.readFileSync(
      path.join(process.cwd(), 'src/data/blogPosts.ts'), 'utf8'
    );

    // Extract slugs to find individual posts
    const slugMatches = [...blogFile.matchAll(/slug:\s*'([^']+)'/g)];
    const titleMatches = [...blogFile.matchAll(/title:\s*'([^']+)'/g)];
    const excerptMatches = [...blogFile.matchAll(/excerpt:\s*'([^']+)'/g)];
    const dateMatches = [...blogFile.matchAll(/date:\s*'([^']+)'/g)];
    const readTimeMatches = [...blogFile.matchAll(/readTime:\s*'([^']+)'/g)];
    const categoryMatches = [...blogFile.matchAll(/category:\s*'([^']+)'/g)];
    const authorMatches = [...blogFile.matchAll(/author:\s*'([^']+)'/g)];

    // Extract content blocks (between content: ` and `,)
    const contentMatches = [...blogFile.matchAll(/content:\s*`([\s\S]*?)`,?\s*\n\s*\}/g)];

    const postCount = slugMatches.length;
    console.log(`   Found ${postCount} blog posts in blogPosts.ts\n`);

    let migrated = 0;
    let skipped = 0;

    for (let i = 0; i < postCount; i++) {
      const slug = slugMatches[i]?.[1];
      const title = titleMatches[i]?.[1] || 'Untitled';
      const excerpt = excerptMatches[i]?.[1] || '';
      const date = dateMatches[i]?.[1] || new Date().toISOString().split('T')[0];
      const readTime = readTimeMatches[i]?.[1] || '5 min read';
      const category = categoryMatches[i]?.[1] || 'Engineering';
      const author = authorMatches[i]?.[1] || 'FouriqTech Engineering';
      const content = contentMatches[i]?.[1]?.trim() || '';

      if (!slug) continue;

      // Check if already exists
      const existing = await client.query(
        'SELECT "id" FROM "BlogPost" WHERE "slug" = $1', [slug]
      );

      if (existing.rows.length > 0) {
        console.log(`   ⏭️  Skipped: "${slug}" (already exists)`);
        skipped++;
        continue;
      }

      await client.query(`
        INSERT INTO "BlogPost" (
          "id", "slug", "title", "excerpt", "date", "readTime",
          "category", "author", "content", "isLive", "createdAt", "updatedAt"
        ) VALUES (
          gen_random_uuid()::text, $1, $2, $3, $4, $5,
          $6, $7, $8, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )
      `, [slug, title, excerpt, date, readTime, category, author, content]);

      console.log(`   ✅ Migrated: "${title}" (${slug})`);
      migrated++;
    }

    console.log(`\n📊 Migration Summary:`);
    console.log(`   Migrated: ${migrated}`);
    console.log(`   Skipped:  ${skipped}`);
    console.log(`   Total:    ${postCount}`);

    // Verify
    const count = await client.query('SELECT COUNT(*) FROM "BlogPost"');
    console.log(`\n   📋 BlogPost table now has ${count.rows[0].count} rows`);

  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

migrateBlogPosts();
