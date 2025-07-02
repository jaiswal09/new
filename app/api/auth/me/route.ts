import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { db, users } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    console.log("Get Current User API - Token:", token ? "Present" : "Missing");

    if (!token) {
      return NextResponse.json(
        { message: 'Access denied. No token provided.' },
        { status: 401 }
      );
    }

    // Verify token
    const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_key';
    const decoded = jwt.verify(token, jwtSecret) as { userId: string; email: string; role: string };

    // Find user by ID in database
    const userResults = await db.select().from(users).where(eq(users.id, decoded.userId));
    if (userResults.length === 0) {
      console.log("Get Current User API - User not found in database for ID:", decoded.userId);
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    const user = userResults[0];

    console.log("Get Current User API - Success for:", user.email);

    // Return user data (don't include password)
    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json({
      success: true,
      data: userWithoutPassword
    });

  } catch (error) {
    console.error('Get Current User API - Error:', error);
    return NextResponse.json(
      { message: 'Invalid token or server error' },
      { status: 401 }
    );
  }
}