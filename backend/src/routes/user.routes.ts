import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.get("/", authMiddleware, (req, res) => {
  res.json({ success: true, data: [] });
});

export default router;