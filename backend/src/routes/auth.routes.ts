import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.post("/login", authController.login);
router.post("/register", authController.register);
router.get("/me", authMiddleware, authController.getCurrentUser);

export default router;