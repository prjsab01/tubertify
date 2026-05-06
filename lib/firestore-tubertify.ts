import { collection, addDoc, getDocs, query, where, serverTimestamp, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { adminDb } from "./firebaseAdmin";
import type { AINotes, AIUsageLimit } from "./types";

function ensureDb() {
  if (!adminDb) {
    throw new Error("Firestore Admin is not initialized.");
  }
  return adminDb;
}

export async function saveAINotes(notes: Omit<AINotes, "id" | "generatedAt">) {
  const db = ensureDb();
  const notesCollection = collection(db, "aiNotes");
  const document = await addDoc(notesCollection, {
    ...notes,
    generatedAt: serverTimestamp(),
  });
  return document.id;
}

export async function getAINotesForVideo(courseId: string, moduleId: string, videoId: string): Promise<AINotes | null> {
  const db = ensureDb();
  const notesCollection = collection(db, "aiNotes");
  const q = query(
    notesCollection,
    where("courseId", "==", courseId),
    where("moduleId", "==", moduleId),
    where("videoId", "==", videoId)
  );
  const snapshot = await getDocs(q);
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
  const usageDocRef = doc(db, "ai_usage", userId, "daily", today);

  try {
    await db.runTransaction(async (transaction) => {
      const usageDoc = await transaction.get(usageDocRef);

      if (!usageDoc.exists()) {
        transaction.set(usageDocRef, { [feature]: 1, date: today });
        return;
      }

      const currentUsage = usageDoc.data()?.[feature] || 0;
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
