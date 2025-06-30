import { Router } from 'express';
import { register, login, getMe, forgotPassword } from '../controllers/auth.controller';
import { protect } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { registerSchema, loginSchema } from '../utils/validation.util';

const router = Router();

// Register a new user
router.post('/register', validate(registerSchema), register);

// Login user
router.post('/login', validate(loginSchema), login);

// Get current user
router.get('/me', protect, getMe);

// Forgot password
router.post('/forgot-password', forgotPassword);

export default router;
