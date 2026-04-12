import pkg from 'pg';
const { Client } = pkg;
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

async function applySchema() {
  const connectionString = process.env.DATABASE_URL;
  const sql = fs.readFileSync('schema.sql', 'utf8').replace(/^\uFEFF/, ''); 

  console.log("Connecting to Supabase...");
  const client = new Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("Connected. Applying schema.sql...");
    
    // Better parser: remove comments entirely first, then split by ;
    const cleanedSql = sql
      .replace(/--.*$/gm, '') // Remove single line comments
      .replace(/\/\*[\s\S]*?\*\//g, ''); // Remove multi-line comments
      
    const statements = cleanedSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (let statement of statements) {
      console.log(`Executing: ${statement.substring(0, 50)}...`);
      await client.query(statement);
    }
    
    const verify = await client.query("SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'");
    console.log("✅ Tables created:", verify.rows.map(r => r.tablename));
    
  } catch (err) {
    console.error("❌ Failed to apply schema:", err.message);
  } finally {
    await client.end();
  }
}

applySchema();
