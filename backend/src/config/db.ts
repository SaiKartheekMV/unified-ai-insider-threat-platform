import { Pool } from "pg";
import { env } from "./env";

export const pgPool = new Pool({
  connectionString: env.DATABASE_URL
});

export const connectPostgres = async () => {
  try {
    await pgPool.query("SELECT 1");
    console.log("✅ PostgreSQL connected");
  } catch (error) {
    console.error("❌ PostgreSQL connection failed");
    console.error(error);
    process.exit(1);
  }
};
