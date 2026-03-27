import { Request, Response } from "express";
import { loginUser, registerUser } from "./auth.service";

export const register = async (req: Request, res: Response) => {
  const { email, password, role } = req.body;
  const normalizedRole = String(role || "EMPLOYEE").toUpperCase();
  const allowedRoles = ["ADMIN", "EMPLOYEE"];
  if (!allowedRoles.includes(normalizedRole)) {
    return res.status(400).json({ error: "Invalid role. Use ADMIN or EMPLOYEE." });
  }
  await registerUser(email, password, normalizedRole);
  res.status(201).json({ message: "User registered" });
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const token = await loginUser(email, password);
    res.json({ token });
  } catch (err: any) {
    res.status(401).json({ error: err.message });
  }
};
