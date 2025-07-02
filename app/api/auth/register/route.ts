import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { db, users, initializeDatabase } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, role, department } = await request.json();

    console.log("Registration API - Attempt for:", email);

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { message: 'Name, email, password, and role are required' },
        { status: 400 }
      );
    }

    // Initialize database tables if needed
    await initializeDatabase();

    // Check if user already exists
    const existingUsers = await db.select().from(users).where(eq(users.email, email));
    if (existingUsers.length > 0) {
      console.log("Registration API - User already exists:", email);
      return NextResponse.json(
        { message: 'User already exists with this email' },
        { status: 400 }
      );
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user in database
    const newUsers = await db.insert(users).values({
      name,
      email,
      password: hashedPassword,
      role,
      department,
    }).returning({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      department: users.department,
      created_at: users.created_at,
    });

    const newUser = newUsers[0];
    console.log("Registration API - User registered successfully in database:", email, "ID:", newUser.id);

    // Return success
    return NextResponse.json({
      success: true,
      message: 'User registered successfully',
      data: newUser
    }, { status: 201 });

  } catch (error) {
    console.error('Registration API - Error:', error);
    return NextResponse.json(
      { message: 'Internal server error during registration' },
      { status: 500 }
    );
  }
}