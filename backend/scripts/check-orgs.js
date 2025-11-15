const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function checkOrgs() {
  try {
    const result = await pool.query('SELECT id, name FROM organizations');
    console.log('Organizations in database:', result.rows);
    console.log('Total count:', result.rowCount);
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkOrgs();
