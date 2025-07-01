import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/auth.util";
import { validateInput } from "../utils/validation.util";

export const authController = {
  async login(req: Request, res: Response) {
    try {
      console.log("Login attempt:", req.body.email);
      
      const { email, password } = req.body;
      
      // Mock user data - replace with database query
      const mockUser = {
        id: "1",
        name: "John Doe",
        email: "admin@school.com",
        password: "$2b$10$mockhashedpassword", // bcrypt hash for "password123"
        role: "admin",
        department: "IT"
      };
      
      // For demo, accept any email and password "password123"
      if (password === "password123") {
        const token = generateToken({ userId: mockUser.id, email: mockUser.email });
        
        console.log("Login successful for:", email);
        
        res.cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        
        res.json({
          success: true,
          data: {
            token,
            user: {
              id: mockUser.id,
              name: mockUser.name,
              email: mockUser.email,
              role: mockUser.role,
              department: mockUser.department
            }
          }
        });
      } else {
        res.status(401).json({
          success: false,
          message: "Invalid credentials"
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  },

  async register(req: Request, res: Response) {
    try {
      console.log("Registration attempt:", req.body.email);
      
      const { name, email, password, role, department } = req.body;
      
      // Mock registration success
      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: {
          id: Date.now().toString(),
          name,
          email,
          role,
          department
        }
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  },

  async getCurrentUser(req: Request, res: Response) {
    try {
      // Mock current user data
      const user = {
        id: "1",
        name: "John Doe",
        email: "admin@school.com",
        role: "admin",
        department: "IT"
      };
      
      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error("Get current user error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  }
};