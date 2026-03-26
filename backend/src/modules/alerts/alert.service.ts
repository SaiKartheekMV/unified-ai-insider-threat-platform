import { pgPool } from "../../config/db";
import { randomUUID } from "crypto";

export const raiseAlert = async (userId: string, risk: string, reasons: string[]) => {
  console.warn(`🚨 ALERT: User ${userId} risk level = ${risk}`);
  
  await pgPool.query(
    "INSERT INTO alerts (id, user_id, severity, reasons) VALUES ($1, $2, $3, $4)",
    [randomUUID(), userId, risk, JSON.stringify(reasons)]
  );

  if (risk === "HIGH") {
    console.warn(`🔒 AUTO-LOCKING User ${userId} due to HIGH severity anomaly.`);
    await pgPool.query(
      "UPDATE users SET is_active = false WHERE id = $1",
      [userId]
    );
  }
};
