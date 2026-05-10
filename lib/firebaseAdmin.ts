import admin from "firebase-admin";
import fs from "fs";
import path from "path";

const firebaseAdminSdkKeyPath = process.env.FIREBASE_ADMIN_SDK_KEY;

if (!firebaseAdminSdkKeyPath) {
  throw new Error("Missing FIREBASE_ADMIN_SDK_KEY in environment.");
}

const serviceAccount = JSON.parse(fs.readFileSync(path.resolve(firebaseAdminSdkKeyPath), "utf8"));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
