import { db } from "./firebaseClient";
import { doc, getDoc } from "firebase/firestore";

export interface AdminUser {
  email: string;
  username: string;
  role: "admin" | "user";
  isAdmin: boolean;
  adminSecret?: string;
}

/**
 * Check if a user is an admin
 * @param uid - User ID from Firebase Auth
 * @returns true if user has isAdmin=true and role=admin
 */
export async function isUserAdmin(uid: string): Promise<boolean> {
  if (!db) {
    console.error("Firebase not initialized");
    return false;
  }

  try {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return false;
    }

    const userData = userSnap.data();
    return userData.isAdmin === true && userData.role === "admin";
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}

/**
 * Get admin user data
 * @param uid - User ID from Firebase Auth
 * @returns Admin user data or null if not admin
 */
export async function getAdminUser(uid: string): Promise<AdminUser | null> {
  if (!db) {
    console.error("Firebase not initialized");
    return null;
  }

  try {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return null;
    }

    const userData = userSnap.data();

    if (userData.isAdmin !== true || userData.role !== "admin") {
      return null;
    }

    return {
      email: userData.email,
      username: userData.username,
      role: userData.role,
      isAdmin: userData.isAdmin,
      adminSecret: userData.adminSecret,
    };
  } catch (error) {
    console.error("Error fetching admin user:", error);
    return null;
  }
}
