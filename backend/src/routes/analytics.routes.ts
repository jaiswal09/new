import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.get("/dashboard-stats", authMiddleware, (req, res) => {
  console.log("Analytics dashboard stats accessed");
  res.json({ 
    success: true, 
    data: {
      totalResources: 150,
      totalReservations: 45,
      totalUsers: 120,
      lowStockItems: 8
    }
  });
});

export default router;