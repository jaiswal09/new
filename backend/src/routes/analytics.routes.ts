import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.get("/dashboard-stats", authMiddleware, (req, res) => {
  res.json({ 
    success: true, 
    data: {
      totalResources: 150,
      totalUsers: 45,
      activeReservations: 12,
      lowStockItems: 8
    }
  });
});

router.get("/resource-usage", authMiddleware, (req, res) => {
  res.json({ success: true, data: [] });
});

router.get("/popular-resources", authMiddleware, (req, res) => {
  res.json({ success: true, data: [] });
});

router.get("/inventory-value", authMiddleware, (req, res) => {
  res.json({ success: true, data: [] });
});

router.get("/user-activity", authMiddleware, (req, res) => {
  res.json({ success: true, data: [] });
});

export default router;