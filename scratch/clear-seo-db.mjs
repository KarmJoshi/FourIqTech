import dotenv from 'dotenv';
dotenv.config();
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function clearSeoTables() {
  try {
    console.log('Starting DB clean-up for fresh SEO starting...');
    
    const blogRes = await pool.query('DELETE FROM "BlogPost"');
    console.log('Deleted from BlogPost:', blogRes.rowCount, 'entries');

    const serviceRes = await pool.query('DELETE FROM "ServicePage"');
    console.log('Deleted from ServicePage:', serviceRes.rowCount, 'entries');

    const stagingRes = await pool.query('DELETE FROM "StagingItem"');
    console.log('Deleted from StagingItem:', stagingRes.rowCount, 'entries');

    const keywordRes = await pool.query('DELETE FROM "KeywordMemory"');
    console.log('Deleted from KeywordMemory:', keywordRes.rowCount, 'entries');

    const logRes = await pool.query('DELETE FROM "ActivityLog"');
    console.log('Deleted from ActivityLog:', logRes.rowCount, 'entries');
    
    console.log('Successfully completed database clean-up!');
  } catch (error) {
    console.error('Error during database clean-up:', error);
  } finally {
    await pool.end();
  }
}

clearSeoTables();
