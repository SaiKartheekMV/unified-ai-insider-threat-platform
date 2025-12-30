import { Request, Response } from "express";
import { loginUser, registerUser } from "./auth.service";

export const register = async (req: Request, res: Response) => {
  const { email, password, role } = req.body;
  await registerUser(email, password, role);
  res.status(201).json({ message: "User registered" });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const token = await loginUser(email, password);
  res.json({ token });
};
