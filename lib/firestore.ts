import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebaseClient";
import type { Course } from "./types";

function ensureDb() {
  if (!db) {
    throw new Error("Firestore is not initialized. Check your NEXT_PUBLIC_FIREBASE_ environment variables.");
  }
  return db;
}

export async function saveCourse(course: Course) {
  const courseCollection = collection(ensureDb(), "courses");
  const document = await addDoc(courseCollection, {
    ...course,
    createdAt: serverTimestamp(),
  });
  return document.id;
}

export async function loadUserCourses(userId: string): Promise<Course[]> {
  const courseCollection = collection(ensureDb(), "courses");
  const q = query(courseCollection, where("ownerId", "==", userId), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Course) }));
}
