import admin from "firebase-admin";
import fs from "fs";
import path from "path";

const firebaseAdminSdkKey = process.env.FIREBASE_ADMIN_SDK_KEY;

if (!firebaseAdminSdkKey) {
  throw new Error("Missing FIREBASE_ADMIN_SDK_KEY in environment.");
}

let serviceAccount: any;

if (fs.existsSync(path.resolve(firebaseAdminSdkKey))) {
  serviceAccount = JSON.parse(fs.readFileSync(path.resolve(firebaseAdminSdkKey), "utf8"));
} else {
  serviceAccount = JSON.parse(firebaseAdminSdkKey);
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
