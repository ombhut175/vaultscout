const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function seedOrganization() {
  try {
    const result = await pool.query(`
      INSERT INTO organizations (name, pinecone_namespace)
      VALUES ('Test Organization', '__default__')
      ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
      RETURNING id, name, pinecone_namespace
    `);
    
    console.log('✓ Organization created/verified:');
    console.log('  ID:', result.rows[0].id);
    console.log('  Name:', result.rows[0].name);
    console.log('  Namespace:', result.rows[0].pinecone_namespace);
    console.log('\nUse this org_id in your API requests!');
  } catch (error) {
    console.error('✗ Error:', error.message);
  } finally {
    await pool.end();
  }
}

seedOrganization();
