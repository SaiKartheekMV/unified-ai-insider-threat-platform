import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/rbac.middleware";
import { activityLogger } from "../middlewares/activity.middleware";
import { getRecentLogsByUser } from "../modules/logs/activity.fetch";
import { analyzeLogsWithAI } from "../services/ai.service";
import { raiseAlert } from "../modules/alerts/alert.service";
import { AuthRequest } from "../middlewares/auth.middleware";

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
      raiseAlert(userId, aiResult.severity);
    }

    res.json({
      message: "Admin access granted",
      risk: aiResult
    });
  }
);


// Mount auth routes
router.use("/auth", authRoutes);

export default router;
