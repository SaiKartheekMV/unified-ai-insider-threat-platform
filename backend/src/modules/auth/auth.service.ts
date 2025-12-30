import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import { pgPool } from "../../config/db";
import { v4 as uuidv4 } from "uuid";

export const registerUser = async (
  email: string,
  password: string,
  role: string
) => {
  const hash = await bcrypt.hash(password, 12);

  await pgPool.query(
    "INSERT INTO users (id, email, password_hash, role) VALUES ($1,$2,$3,$4)",
    [uuidv4(), email, hash, role]
  );
};

export const loginUser = async (email: string, password: string) => {
  const result = await pgPool.query(
    "SELECT * FROM users WHERE email=$1 AND is_active=true",
    [email]
  );

  if (result.rowCount === 0) throw new Error("Invalid credentials");

  const user = result.rows[0];
  const match = await bcrypt.compare(password, user.password_hash);

  if (!match) throw new Error("Invalid credentials");

  const token = jwt.sign(
    { id: user.id, role: user.role },
    env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  return token;
};
