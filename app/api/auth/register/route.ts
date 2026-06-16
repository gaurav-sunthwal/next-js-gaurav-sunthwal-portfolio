import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { getSession } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    // Only logged-in admin users can register new users to prevent public sign-ups
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
    }

    if (username.length < 3) {
      return NextResponse.json({ error: "Username must be at least 3 characters long" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 });
    }

    // Check if user already exists
    const existing = await db.select().from(users).where(eq(users.username, username));
    if (existing.length > 0) {
      return NextResponse.json({ error: "Username is already taken" }, { status: 400 });
    }

    // Hash password and insert user
    const passwordHash = await bcrypt.hash(password, 10);
    await db.insert(users).values({
      username,
      passwordHash,
    });

    return NextResponse.json({ success: true, message: "User created successfully" });
  } catch (error: any) {
    console.error("Register API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
