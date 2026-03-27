require("dotenv").config({ path: ".env" });
const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const { randomUUID } = require("crypto");

async function upsertEmployeeUser() {
  const email = "employee@enterprise.com";
  const password = "Employee@123";
  const role = "EMPLOYEE";

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  const existing = await pool.query(
    "SELECT id, role FROM users WHERE email = $1",
    [email]
  );

  if (existing.rowCount > 0) {
    await pool.query("UPDATE users SET role = $2 WHERE email = $1", [email, role]);
    console.log("Updated existing user to EMPLOYEE:", existing.rows[0].id);
  } else {
    const hash = await bcrypt.hash(password, 12);
    const id = randomUUID();
    await pool.query(
      "INSERT INTO users (id, email, password_hash, role) VALUES ($1,$2,$3,$4)",
      [id, email, hash, role]
    );
    console.log("Inserted EMPLOYEE user:", id);
  }

  await pool.end();
}

upsertEmployeeUser().catch((e) => {
  console.error(e);
  process.exit(1);
});
