const { Pool } = require("pg");
require("dotenv").config({ path: ".env" });

const pgPool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  try {
    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS alerts (
        id UUID PRIMARY KEY,
        user_id UUID REFERENCES users(id),
        severity VARCHAR(50) NOT NULL,
        reasons TEXT,
        resolved BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Migration successful");
  } catch (err) {
    console.error("Migration failed", err);
  } finally {
    process.exit(0);
  }
}
migrate();
