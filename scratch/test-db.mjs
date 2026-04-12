import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
dotenv.config();

async function testConnection() {
  const connectionString = process.env.DATABASE_URL;
  console.log("Testing connection string (sanitized)...");
  console.log(connectionString.replace(/:[^:@]+@/, ':****@'));

  const client = new Client({
    connectionString: connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log("Connecting...");
    await client.connect();
    console.log("Successfully connected!");
    const res = await client.query('SELECT NOW()');
    console.log("Database time:", res.rows[0]);
  } catch (err) {
    console.error("Connection error Details:", err.message);
  } finally {
    await client.end();
  }
}

testConnection();
