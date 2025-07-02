import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.get("/", authMiddleware, (req, res) => {
  console.log("Categories route accessed");
  res.json({ success: true, data: [] });
});

export default router;