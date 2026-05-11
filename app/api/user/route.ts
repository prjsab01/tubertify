export const runtime = 'nodejs';

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "../../../lib/firebaseAdmin";
import type { UserProfile } from "../../../lib/types";

export async function POST(request: NextRequest) {
  try {
    const { uid, email, displayName, photoURL } = await request.json();

    if (!uid || !email) {
      return NextResponse.json({ error: "Missing required fields: uid, email" }, { status: 400 });
    }

    const userRef = adminDb.collection("users").doc(uid);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      return NextResponse.json({ message: "User profile already exists." });
    }

    const newUserProfile: UserProfile = {
      email,
      displayName: displayName || "",
      photoURL: photoURL || "",
      role: "learner", // default role
      createdAt: new Date().toISOString(),
    };

    await userRef.set(newUserProfile);

    return NextResponse.json({ message: "User profile created successfully." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create user profile." }, { status: 500 });
  }
}
