import type { Express, RequestHandler } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { storage } from "./storage";
import { config } from 'dotenv';
config();

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRES_IN = "7d";

export interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

// Simple password validation
function validatePassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 6) {
    return { valid: false, message: "Password must be at least 6 characters long" };
  }
  return { valid: true };
}

// Hash password
async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

// Verify password
async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

// Generate JWT token
function generateToken(user: AuthUser): string {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// Verify JWT token
function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return {
      id: decoded.id,
      email: decoded.email,
      firstName: decoded.firstName,
      lastName: decoded.lastName,
      phone: decoded.phone
    };
  } catch (error) {
    return null;
  }
}

// Optional auth middleware - doesn't block requests
export const optionalAuth: RequestHandler = (req: any, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  
  if (token) {
    const user = verifyToken(token);
    if (user) {
      req.user = user;
    }
  }
  
  // Always continue - never block requests
  next();
};

// Setup simple auth routes
export function setupSimpleAuth(app: Express) {
  // Register endpoint
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, firstName, lastName, phone } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      
      // Validate password
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.valid) {
        return res.status(400).json({ message: passwordValidation.message });
      }
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }
      
      // Hash password and create user
      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone
      });
      
      // Generate token
      const token = generateToken({
        id: user.id,
        email: user.email,
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        phone: user.phone || undefined
      });
      
      // Send welcome email notification (async, don't wait for it)
      try {
        await fetch(`${process.env.BACKEND_URL || 'http://localhost:5000'}/api/notify-signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: user.id,
            email: user.email
          })
        });
        console.log(`Welcome email notification sent for user: ${user.email}`);
      } catch (error) {
        console.error("Failed to send welcome email notification:", error);
        // Don't fail registration if email notification fails
      }
      
      res.status(201).json({
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        },
        token
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });
  
  // Login endpoint
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      
      // Get user by email
      const user = await storage.getUserByEmail(email);
      if (!user || !user.password) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      // Verify password
      const isValidPassword = await verifyPassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      // Generate token
      const token = generateToken({
        id: user.id,
        email: user.email,
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        phone: user.phone || undefined
      });
      
      res.json({
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        },
        token
      });
    } catch (error: any) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });
  
  // Get current user endpoint - auto-create user if doesn't exist
  app.get("/api/auth/user", optionalAuth, async (req: any, res) => {
    try {
      if (!req.user) {
        return res.json(null);
      }

      // Ensure user exists in database (auto-create if missing)
      const userData = {
        id: req.user.id,
        email: req.user.email || `user-${req.user.id}@replit.com`,
        firstName: req.user.firstName || 'User',
        lastName: req.user.lastName || '',
        phone: req.user.phone || null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Upsert user to database (create if doesn't exist)
      const dbUser = await storage.upsertUser(userData);
      
      res.json(dbUser);
    } catch (error: any) {
      console.error("Error in /api/auth/user:", error);
      res.status(500).json({ message: "Error fetching user: " + error.message });
    }
  });
  
  // Logout endpoint (client-side token removal)
  app.post("/api/auth/logout", (req, res) => {
    res.json({ message: "Logged out successfully" });
  });
}