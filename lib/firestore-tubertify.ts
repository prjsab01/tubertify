import admin from "firebase-admin";
import { adminDb } from "./firebaseAdmin";
import type { AINotes } from "./types";

function ensureDb() {
  if (!adminDb) {
    throw new Error("Firestore Admin is not initialized.");
  }
  return adminDb;
}

export async function saveAINotes(notes: Omit<AINotes, "id" | "generatedAt">) {
  const db = ensureDb();
  const documentRef = await db.collection("aiNotes").add({
    ...notes,
    generatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  return documentRef.id;
}

export async function getAINotesForVideo(courseId: string, moduleId: string, videoId: string): Promise<AINotes | null> {
  const db = ensureDb();
  const snapshot = await db
    .collection("aiNotes")
    .where("courseId", "==", courseId)
    .where("moduleId", "==", moduleId)
    .where("videoId", "==", videoId)
    .limit(1)
    .get();

  if (snapshot.empty) {
    return null;
  }

  const doc = snapshot.docs[0];
  return { id: doc.id, ...(doc.data() as AINotes) };
}

export async function checkAndIncrementUsage(
  userId: string,
  feature: "notes" | "assistant",
  limit: number
): Promise<boolean> {
  const db = ensureDb();
  const today = new Date().toISOString().split("T")[0];
  const usageDocRef = db.collection("ai_usage").doc(userId).collection("daily").doc(today);

  try {
    await db.runTransaction(async (transaction) => {
      const usageDoc = await transaction.get(usageDocRef);

      if (!usageDoc.exists) {
        transaction.set(usageDocRef, { [feature]: 1, date: today });
        return;
      }

      const currentUsage = (usageDoc.data()?.[feature] as number) || 0;
      if (currentUsage >= limit) {
        throw new Error("Rate limit exceeded.");
      }

      transaction.update(usageDocRef, { [feature]: currentUsage + 1 });
    });
    return true;
  } catch (error: any) {
    if (error.message === "Rate limit exceeded.") {
      return false;
    }
    throw error;
  }
}
