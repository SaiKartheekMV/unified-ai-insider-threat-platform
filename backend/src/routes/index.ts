import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/rbac.middleware";
import { activityLogger } from "../middlewares/activity.middleware";
import { getRecentLogsByUser } from "../modules/logs/activity.fetch";
import { analyzeLogsWithAI } from "../services/ai.service";
import { raiseAlert } from "../modules/alerts/alert.service";
import { AuthRequest } from "../middlewares/auth.middleware";
import { pgPool } from "../config/db";
import { logActivity } from "../modules/logs/activity.service";

const router = Router();

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Service is healthy
 */
router.get("/health", async (_, res) => {
  res.json({
    status: "OK",
    postgres: "connected",
    redis: "connected"
  });
});

/**
 * @swagger
 * /api/admin:
 *   get:
 *     summary: Admin-only endpoint
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Admin access granted
 *       403:
 *         description: Access denied
 */


router.get(
  "/admin",
  authenticate,
  authorize(["ADMIN"]),
  activityLogger("ADMIN_ENDPOINT_ACCESSED"),
  async (req: AuthRequest, res) => {
    const userId = req.user!.id;

    const logs = await getRecentLogsByUser(userId);
    const aiResult = await analyzeLogsWithAI(logs);

    if (aiResult.severity === "HIGH") {
      await raiseAlert(userId, aiResult.severity, aiResult.reasons);
    }

    res.json({
      message: "Admin access granted",
      risk: aiResult
    });
  }
);

router.get("/admin/alerts", authenticate, authorize(["ADMIN"]), async (req, res) => {
  const result = await pgPool.query("SELECT a.*, u.email FROM alerts a JOIN users u ON a.user_id = u.id ORDER BY a.created_at DESC");
  res.json(result.rows);
});

router.get("/admin/logs", authenticate, authorize(["ADMIN"]), async (req, res) => {
  try {
    const result = await pgPool.query("SELECT l.*, u.email FROM activity_logs l JOIN users u ON l.user_id = u.id ORDER BY l.created_at DESC LIMIT 50");
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/admin/timeline", authenticate, authorize(["ADMIN"]), async (req, res) => {
  try {
    const alerts = await pgPool.query(`SELECT date_trunc('hour', created_at) as time, COUNT(*) as count FROM alerts GROUP BY time ORDER BY time DESC LIMIT 24`);
    const logs = await pgPool.query(`SELECT date_trunc('hour', created_at) as time, COUNT(*) as count FROM activity_logs GROUP BY time ORDER BY time DESC LIMIT 24`);
    res.json({ alerts: alerts.rows, logs: logs.rows });
  } catch(e) {
    res.json({ alerts: [], logs: [] });
  }
});

router.post("/admin/unlock/:id", authenticate, authorize(["ADMIN"]), async (req, res) => {
  const userId = req.params.id;
  await pgPool.query("UPDATE users SET is_active = true WHERE id = $1", [userId]);
  await pgPool.query("UPDATE alerts SET resolved = true WHERE user_id = $1", [userId]);
  res.json({ message: "User unlocked successfully" });
});

router.post("/platform/ingest", async (req, res) => {
  try {
    const { userId, action, ipAddress, userAgent } = req.body;
    if (!userId || !action) return res.status(400).json({ error: "Missing required fields" });
    
    // Check if user is already locked to prevent alert spam
    const userCheck = await pgPool.query("SELECT role, is_active FROM users WHERE id = $1", [userId]);
    const { role, is_active } = userCheck.rows[0];
    if (!is_active) {
      return res.status(201).json({ message: "Log rejected. User is quarantined.", risk: "HIGH" });
    }

    const isEmployee = role === "EMPLOYEE";
    const isEditAttempt = action === "EDIT_EMPLOYEE_RECORD";
    const isAddAttempt = action === "ADD_NEW_EMPLOYEE_RECORD";
    const isDeleteAttempt = action === "DELETE_EMPLOYEE_RECORD";

    // Privilege Escalation Trapdoor!
    // Medium risk for edit/add attempts, high risk for delete attempts.
    if (isEmployee && (isEditAttempt || isAddAttempt || isDeleteAttempt)) {
      await logActivity({ userId, action: "PRIVILEGE_ESCALATION_ATTEMPT", ipAddress, userAgent });
      if (isDeleteAttempt) {
        await raiseAlert(userId, "HIGH", ["Unauthorized Privilege Escalation: Attempted to delete employee records."]);
        return res.status(201).json({ message: "quarantined", risk: "HIGH" });
      }
      await raiseAlert(userId, "MEDIUM", ["Unauthorized Privilege Escalation: Attempted to edit/add employee records."]);
      return res.status(201).json({ message: "flagged", risk: "MEDIUM" });
    }

    await logActivity({ userId, action, ipAddress, userAgent });

    // Zero-Trust Evaluation Pipeline
    const recentLogs = await getRecentLogsByUser(userId);
    const aiResult = await analyzeLogsWithAI(recentLogs);

    if (aiResult.severity === "HIGH") {
      await raiseAlert(userId, aiResult.severity, aiResult.reasons);
    }

    res.status(201).json({ message: "Log ingested", risk: aiResult.severity });
  } catch (err: any) {
    console.error("Ingestion fault:", err.message);
    res.status(500).json({ error: "Ingestion failed" });
  }
});

router.post("/platform/capture", async (req, res) => {
  try {
    const { userId, image } = req.body;
    if (!userId || !image) return res.status(400).json({ error: "Missing data" });
    
    // Attach the covert webcam image to the most recent Active Alert for this user
    await pgPool.query(
      `UPDATE alerts SET capture_image = $1 WHERE id = (
         SELECT id FROM alerts WHERE user_id = $2 AND resolved = false ORDER BY created_at DESC LIMIT 1
       )`, [image, userId]
    );
    res.json({ success: true });
  } catch (err: any) {
    console.error("Camera storage fault:", err.message);
    res.status(500).json({ error: "Camera storage failed" });
  }
});



router.get("/users", authenticate, authorize(["ADMIN"]), async (req, res) => {
  const result = await pgPool.query("SELECT id, email, role, is_active, created_at FROM users ORDER BY created_at DESC");
  res.json(result.rows);
});

router.post("/admin/lock/:id", authenticate, authorize(["ADMIN"]), async (req, res) => {
  const userId = req.params.id;
  await pgPool.query("UPDATE users SET is_active = false WHERE id = $1", [userId]);
  res.json({ message: "User locked manually" });
});

import emsRoutes from "./ems.routes";

// Mount API subsets
router.use("/ems", emsRoutes);
router.use("/auth", authRoutes);

export default router;
