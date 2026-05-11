import { NextRequest, NextResponse } from "next/server";
import { createUserProfile } from "../../../lib/firestoreClient";

export async function POST(request: NextRequest) {
  try {
    const { uid, email, displayName, photoURL } = await request.json();

    if (!uid || !email) {
      return NextResponse.json({ error: "Missing required fields: uid, email" }, { status: 400 });
    }

    await createUserProfile(uid, email, displayName, photoURL);

    return NextResponse.json({ message: "User profile created successfully." });
  } catch (error: any) {
    console.error("Error in user API:", error);
    return NextResponse.json({ error: error.message || "Failed to create user profile." }, { status: 500 });
  }
}
