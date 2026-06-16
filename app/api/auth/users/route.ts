import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { getSession } from "@/lib/auth";
import { eq, not } from "drizzle-orm";
import bcrypt from "bcryptjs";

// GET: List all users
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const allUsers = await db
      .select({
        id: users.id,
        username: users.username,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(users.username);

    return NextResponse.json(allUsers);
  } catch (error: any) {
    console.error("List users API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT: Update a user's details (username and/or password)
export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, username, password } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Check if target user exists
    const userList = await db.select().from(users).where(eq(users.id, id)).limit(1);
    if (userList.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updates: any = {};

    if (username) {
      if (username.length < 3) {
        return NextResponse.json({ error: "Username must be at least 3 characters long" }, { status: 400 });
      }

      // Check if username is taken by another user
      const taken = await db
        .select()
        .from(users)
        .where(eq(users.username, username))
        .limit(1);
      
      if (taken.length > 0 && taken[0].id !== id) {
        return NextResponse.json({ error: "Username is already taken" }, { status: 400 });
      }

      updates.username = username;
    }

    if (password) {
      if (password.length < 6) {
        return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 });
      }
      updates.passwordHash = await bcrypt.hash(password, 10);
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No update fields provided" }, { status: 400 });
    }

    await db.update(users).set(updates).where(eq(users.id, id));

    return NextResponse.json({ success: true, message: "User updated successfully" });
  } catch (error: any) {
    console.error("Update user API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Delete a user
export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const idStr = searchParams.get("id");

    if (!idStr) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const id = parseInt(idStr, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid User ID" }, { status: 400 });
    }

    // Prevent deleting yourself to avoid lockouts
    if (session.userId === id) {
      return NextResponse.json({ error: "You cannot delete your own account while logged in" }, { status: 400 });
    }

    // Ensure we don't delete the last admin user
    const userCount = await db.select().from(users);
    if (userCount.length <= 1) {
      return NextResponse.json({ error: "Cannot delete the last admin account" }, { status: 400 });
    }

    await db.delete(users).where(eq(users.id, id));

    return NextResponse.json({ success: true, message: "User deleted successfully" });
  } catch (error: any) {
    console.error("Delete user API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
