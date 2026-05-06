import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "./firebaseClient";

function ensureAuth() {
  if (!auth) {
    throw new Error("Firebase is not initialized. Check your NEXT_PUBLIC_FIREBASE_ environment variables.");
  }
  return auth;
}

export async function registerWithEmail(email: string, password: string) {
  return createUserWithEmailAndPassword(ensureAuth(), email, password);
}

export async function loginWithEmail(email: string, password: string) {
  return signInWithEmailAndPassword(ensureAuth(), email, password);
}

export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(ensureAuth(), provider);
}

export async function logout() {
  return firebaseSignOut(ensureAuth());
}
