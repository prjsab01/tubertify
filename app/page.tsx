"use client";

export const runtime = 'edge';

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Course, Module } from "../lib/types";
import { useAuth } from "../components/Providers";
import { loginWithEmail, loginWithGoogle, logout, registerWithEmail } from "../lib/auth";
import { loadUserCourses } from "../lib/firestore";
import { createCourseWithModules } from "../lib/firestoreClient";

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [savedCourses, setSavedCourses] = useState<Course[]>([]);
  const [courseTitle, setCourseTitle] = useState("My Imported Course");
  const [playlistUrl, setPlaylistUrl] = useState("");
  const [assistantQuestion, setAssistantQuestion] = useState("");
  const [assistantAnswer, setAssistantAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { setSavedCourses([]); return; }
    const uid = user.uid;
    loadUserCourses(uid).then(setSavedCourses).catch(console.error);
  }, [user]);

  const importPlaylist = async () => {
    setMessage(null);
    if (!playlistUrl.trim()) { setMessage("Paste a valid YouTube playlist URL."); return; }
    if (!user) { setMessage("Please sign in to create a course."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/playlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playlistUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to fetch playlist.");
      const courseId = await createCourseWithModules(
        { title: courseTitle, ownerId: user.uid, modules: [], isPublished: false },
        [{ title: "Module 1", order: 1, videos: data.videos }]
      );
      setMessage(`Successfully imported course with ID: ${courseId}`);
      setSavedCourses(await loadUserCourses(user.uid));
    } catch (error: any) {
      setMessage(error?.message || "Import failed.");
    } finally {
      setLoading(false);
    }
  };

  const askAssistant = async () => {
    if (!assistantQuestion.trim()) { setMessage("Enter a question for the AI assistant."); return; }
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: assistantQuestion, context: courseTitle }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Assistant request failed.");
      setAssistantAnswer(data.answer);
    } catch (error: any) {
      setMessage(error?.message || "Unable to reach AI assistant.");
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSubmit = async () => {
    setMessage(null);
    setLoading(true);
    try {
      if (authMode === "register") {
        await registerWithEmail(authEmail, authPassword);
        setMessage("User registered. You are now signed in.");
      } else {
        await loginWithEmail(authEmail, authPassword);
        setMessage("Signed in successfully.");
      }
      setAuthEmail("");
      setAuthPassword("");
    } catch (error: any) {
      setMessage(error?.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setMessage(null);
    setLoading(true);
    try {
      await loginWithGoogle();
      setMessage("Signed in with Google.");
    } catch (error: any) {
      setMessage(error?.message || "Google sign in failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setMessage(null);
    await logout();
    setMessage("You have signed out.");
  };

  if (authLoading) {
    return <main className="container"><h1>Loading...</h1></main>;
  }

  return (
    <main className="container">
      <div className="header">
        <div>
          <h1>AI Course Builder</h1>
          <p>Create module-based courses from YouTube playlists and use Firebase auth + Firestore.</p>
        </div>
        {user && (
          <div>
            <p>Signed in as {user.email}</p>
            <button type="button" onClick={handleSignOut} disabled={loading}>Sign out</button>
          </div>
        )}
      </div>

      {!user ? (
        <section className="card">
          <h2 className="section-title">Sign in or Register</h2>
          <div className="form-group">
            <label htmlFor="authEmail">Email</label>
            <input
              id="authEmail"
              type="email"
              value={authEmail}
              onChange={(e) => setAuthEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div className="form-group">
            <label htmlFor="authPassword">Password</label>
            <input
              id="authPassword"
              type="password"
              value={authPassword}
              onChange={(e) => setAuthPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <button type="button" onClick={handleAuthSubmit} disabled={loading}>
            {authMode === "register" ? "Register" : "Sign In"}
          </button>
          <button
            type="button"
            onClick={() => setAuthMode(authMode === "register" ? "login" : "register")}
            style={{ marginLeft: "0.75rem", background: "#475569" }}
          >
            Switch to {authMode === "register" ? "Login" : "Register"}
          </button>
          <button
            type="button"
            onClick={handleGoogleSignIn}
            style={{ marginLeft: "0.75rem", background: "#0f172a" }}
            disabled={loading}
          >
            Sign in with Google
          </button>
        </section>
      ) : (
        <>
          <div className="grid grid-2">
            <section className="card">
              <h2 className="section-title">Import YouTube Playlist</h2>
              <div className="form-group">
                <label htmlFor="courseTitle">Course Title</label>
                <input id="courseTitle" value={courseTitle} onChange={(e) => setCourseTitle(e.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="playlistUrl">Playlist URL</label>
                <input
                  id="playlistUrl"
                  type="url"
                  placeholder="https://www.youtube.com/playlist?list=..."
                  value={playlistUrl}
                  onChange={(e) => setPlaylistUrl(e.target.value)}
                />
              </div>
              <button onClick={importPlaylist} disabled={loading}>
                {loading ? "Importing..." : "Import Playlist & Create Course"}
              </button>
            </section>

            <section className="card">
              <h2 className="section-title">AI Learning Assistant</h2>
              <p>Ask questions about your course and generate notes from your module structure.</p>
              <div className="form-group">
                <label htmlFor="assistantQuestion">Question</label>
                <textarea
                  id="assistantQuestion"
                  rows={4}
                  placeholder="What should I focus on for this module?"
                  value={assistantQuestion}
                  onChange={(e) => setAssistantQuestion(e.target.value)}
                />
              </div>
              <button type="button" onClick={askAssistant} disabled={loading}>
                {loading ? "Thinking..." : "Ask AI Assistant"}
              </button>
              {assistantAnswer && (
                <div className="note-box" style={{ marginTop: "1rem" }}>
                  <strong>AI Answer</strong>
                  <p>{assistantAnswer}</p>
                </div>
              )}
            </section>
          </div>

          {savedCourses.length > 0 && (
            <section className="card" style={{ marginTop: "1.5rem" }}>
              <h2 className="section-title">My Courses</h2>
              <div className="video-list">
                {savedCourses.map((course) => (
                  <Link key={course.id} href={`/course/${course.id}`} className="video-card">
                    <div>
                      <strong>{course.title}</strong>
                      <p>{course.modules.length} module(s)</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {message && <p className="toast">{message}</p>}
    </main>
  );
}
