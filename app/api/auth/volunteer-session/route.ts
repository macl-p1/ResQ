import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const { idToken } = (await req.json()) as { idToken: string };
    if (!idToken) return NextResponse.json({ error: "idToken required" }, { status: 400 });

    const decodedToken = await adminAuth.verifyIdToken(idToken);

    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: 60 * 60 * 24 * 5 * 1000, // 5 days
    });

    cookies().set("session", sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 5,
      path: "/",
    });

    cookies().set("role", "volunteer", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 5,
      path: "/",
    });

    return NextResponse.json({ success: true, uid: decodedToken.uid });
  } catch (err) {
    console.error("Volunteer session error:", err);
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}
