import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";
import { logActivity } from "../modules/logs/activity.service";

export const activityLogger = (action: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) return next(); // 🔥 very important

    console.log("📝 Activity logger triggered:", action);

    try {
      await logActivity({
        userId: req.user.id,
        action,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"]
      });
    } catch (error) {
      console.error("Activity log failed", error);
    }

    next();
  };
};
