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
    const userCheck = await pgPool.query("SELECT is_active FROM users WHERE id = $1", [userId]);
    if (userCheck.rows[0] && !userCheck.rows[0].is_active) {
      return res.status(201).json({ message: "Log rejected. User is quarantined.", risk: "HIGH" });
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



router.get("/users", authenticate, authorize(["ADMIN"]), async (req, res) => {
  const result = await pgPool.query("SELECT id, email, role, is_active, created_at FROM users ORDER BY created_at DESC");
  res.json(result.rows);
});

router.post("/admin/lock/:id", authenticate, authorize(["ADMIN"]), async (req, res) => {
  const userId = req.params.id;
  await pgPool.query("UPDATE users SET is_active = false WHERE id = $1", [userId]);
  res.json({ message: "User locked manually" });
});

// Mount auth routes
router.use("/auth", authRoutes);

export default router;
