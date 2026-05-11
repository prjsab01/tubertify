import { db } from "./firebaseClient";
import {
  collection, addDoc, getDocs, query, where, limit,
  doc, getDoc, setDoc, runTransaction, serverTimestamp,
} from "firebase/firestore";
import type { AINotes } from "./types";

function ensureDb() {
  if (!db) throw new Error("Firebase not initialized. Check NEXT_PUBLIC_FIREBASE_ env vars.");
  return db;
}

export async function saveAINotes(notes: Omit<AINotes, "id" | "generatedAt">) {
  const firestore = ensureDb();
  const ref = await addDoc(collection(firestore, "aiNotes"), {
    ...notes,
    generatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getAINotesForVideo(
  courseId: string,
  moduleId: string,
  videoId: string
): Promise<AINotes | null> {
  const firestore = ensureDb();
  const q = query(
    collection(firestore, "aiNotes"),
    where("courseId", "==", courseId),
    where("moduleId", "==", moduleId),
    where("videoId", "==", videoId),
    limit(1)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const d = snapshot.docs[0];
  return { id: d.id, ...(d.data() as AINotes) };
}

export async function checkAndIncrementUsage(
  userId: string,
  feature: "notes" | "assistant",
  dailyLimit: number
): Promise<boolean> {
  const firestore = ensureDb();
  const today = new Date().toISOString().split("T")[0];
  const usageRef = doc(firestore, "ai_usage", userId, "daily", today);

  try {
    await runTransaction(firestore, async (transaction) => {
      const usageDoc = await transaction.get(usageRef);
      if (!usageDoc.exists()) {
        transaction.set(usageRef, { [feature]: 1, date: today });
        return;
      }
      const current = (usageDoc.data()?.[feature] as number) || 0;
      if (current >= dailyLimit) throw new Error("Rate limit exceeded.");
      transaction.update(usageRef, { [feature]: current + 1 });
    });
    return true;
  } catch (error: any) {
    if (error.message === "Rate limit exceeded.") return false;
    throw error;
  }
}
