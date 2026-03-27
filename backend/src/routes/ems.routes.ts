import { Router } from "express";
import { pgPool } from "../config/db";
import { authenticate, AuthRequest } from "../middlewares/auth.middleware";

const router = Router();

const getActingUserRole = async (req: AuthRequest) => {
  const actingUserId = req.header("x-acting-user-id") || req.user?.id;
  if (!actingUserId) return null;
  const result = await pgPool.query("SELECT role FROM users WHERE id = $1", [actingUserId]);
  return result.rows[0]?.role || null;
};

// GET all employees
router.get("/employees", authenticate, async (req, res) => {
  try {
    const result = await pgPool.query("SELECT * FROM employees ORDER BY id DESC");
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST new employee
router.post("/employees", authenticate, async (req: AuthRequest, res) => {
  try {
    const actingRole = await getActingUserRole(req);
    if (actingRole === "EMPLOYEE") {
      return res.status(403).json({ error: "Access denied for EMPLOYEE role" });
    }
    const { name, role, dept, salary, status } = req.body;
    const result = await pgPool.query(
      "INSERT INTO employees (name, role, dept, salary, status) VALUES ($1,$2,$3,$4,$5) RETURNING *", 
      [name, role, dept, salary, status || "Active"]
    );
    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE employee
router.delete("/employees/:id", authenticate, async (req: AuthRequest, res) => {
  try {
    const role = await getActingUserRole(req);
    if (role === "EMPLOYEE") {
      return res.status(403).json({ error: "Access denied for EMPLOYEE role" });
    }
    const { id } = req.params;
    await pgPool.query("DELETE FROM employees WHERE id = $1", [id]);
    res.json({ message: "Employee terminated." });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
