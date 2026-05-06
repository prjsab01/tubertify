import admin from "firebase-admin";

const firebaseAdminSdkKey = process.env.FIREBASE_ADMIN_SDK_KEY;

if (!firebaseAdminSdkKey) {
  throw new Error("Missing FIREBASE_ADMIN_SDK_KEY in environment.");
}

const serviceAccount = JSON.parse(firebaseAdminSdkKey);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
