import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from '../config/db';
import { authMiddleware } from '../middleware/auth.middleware';
import { eq } from 'drizzle-orm';

const router = Router();

// Mock users table structure (since we don't have the schema file working)
interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  department?: string;
  created_at: Date;
}

// In-memory users storage for testing (replace with actual database later)
const users: User[] = [];

// Register route
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;

    console.log("Registration attempt for:", email);

    if (!name || !email || !password || !role) {
      return res.status(400).json({ 
        message: 'Name, email, password, and role are required' 
      });
    }

    // Check if user already exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      console.log("User already exists:", email);
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      email,
      password: hashedPassword,
      role,
      department,
      created_at: new Date()
    };

    users.push(newUser);

    console.log("User registered successfully:", email);

    // Return success (don't include password)
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: userWithoutPassword
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error during registration' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("Login attempt for:", email);

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user by email
    const user = users.find(u => u.email === email);
    if (!user) {
      console.log("User not found:", email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log("Invalid password for:", email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error("JWT_SECRET not configured");
      return res.status(500).json({ message: 'Server configuration error' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    console.log("Login successful for:", email);

    // Return user data and token (don't include password)
    const { password: _, ...userWithoutPassword } = user;
    res.json({
      success: true,
      data: {
        user: userWithoutPassword,
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error during login' });
  }
});

// Get current user route
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.userId;
    
    console.log("Get current user for ID:", userId);

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Find user by ID
    const user = users.find(u => u.id === userId);
    if (!user) {
      console.log("User not found for ID:", userId);
      return res.status(404).json({ message: 'User not found' });
    }

    // Return user data (don't include password)
    const { password: _, ...userWithoutPassword } = user;
    res.json({
      success: true,
      data: userWithoutPassword
    });

  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;