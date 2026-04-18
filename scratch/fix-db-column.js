const { Client } = require('pg');
require('dotenv').config();

const c = new Client({ connectionString: process.env.DATABASE_URL });
async function run() {
  await c.connect();
  await c.query('ALTER TABLE "AgencyConfig" ADD COLUMN IF NOT EXISTS "isAutoCommit" BOOLEAN NOT NULL DEFAULT false;');
  console.log('Done');
  await c.end();
}
run().catch(console.error);
