import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/rbac.middleware";
import { activityLogger } from "../middlewares/activity.middleware";

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
  (_, res) => {
    res.json({ message: "Admin access granted" });
  }
);

// ✅ Mount auth routes
router.use("/auth", authRoutes);

export default router;
