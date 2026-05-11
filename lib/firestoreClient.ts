import { db } from "./firebaseClient";
import {
  doc, setDoc, getDoc, collection, query, where, getDocs, addDoc, orderBy,
} from "firebase/firestore";
import type { UserProfile, Course, Module, AINotes } from "./types";

function ensureDb() {
  if (!db) throw new Error("Firebase not initialized. Check NEXT_PUBLIC_FIREBASE_ env vars.");
  return db;
}

export async function createUserProfile(
  uid: string,
  email: string,
  displayName: string = "",
  photoURL: string = ""
): Promise<void> {
  const firestore = ensureDb();
  const userRef = doc(firestore, "users", uid);
  const userDoc = await getDoc(userRef);
  if (userDoc.exists()) return;
  const profile: UserProfile = {
    email,
    displayName,
    photoURL,
    role: "learner",
    createdAt: new Date().toISOString(),
  };
  await setDoc(userRef, profile);
}

export async function getCourseWithModules(
  courseId: string
): Promise<(Course & { id: string }) | null> {
  const firestore = ensureDb();
  const courseRef = doc(firestore, "courses", courseId);
  const courseDoc = await getDoc(courseRef);
  if (!courseDoc.exists()) return null;
  const course = { id: courseDoc.id, ...(courseDoc.data() as Course) };
  const modulesRef = collection(firestore, "courses", courseId, "modules");
  const q = query(modulesRef, orderBy("order", "asc"));
  const modulesSnapshot = await getDocs(q);
  course.modules = modulesSnapshot.docs.map((d) => ({
    ...(d.data() as Module),
    id: d.id,
  }));
  return course;
}

export async function createCourseWithModules(
  courseData: Omit<Course, "id">,
  modules: Omit<Module, "id">[]
): Promise<string> {
  const firestore = ensureDb();
  const coursesRef = collection(firestore, "courses");
  const courseDocRef = await addDoc(coursesRef, {
    ...courseData,
    createdAt: new Date().toISOString(),
  });
  const modulesRef = collection(firestore, "courses", courseDocRef.id, "modules");
  for (const mod of modules) {
    await addDoc(modulesRef, mod);
  }
  return courseDocRef.id;
}
