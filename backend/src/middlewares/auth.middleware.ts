import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { JwtUser } from "../modules/auth/auth.types";

export interface AuthRequest extends Request {
  user?: JwtUser;
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const token = authHeader.split(" ")[1];
    req.user = jwt.verify(token, env.JWT_SECRET) as JwtUser;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
};
