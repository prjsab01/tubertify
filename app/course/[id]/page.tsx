"use client";

export const runtime = 'edge';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { Course, Module, VideoMeta, AINotes } from "../../../lib/types";
import { useAuth } from "../../../components/Providers";
import { getCourseWithModules } from "../../../lib/firestoreClient";
import { saveAINotes, getAINotesForVideo, checkAndIncrementUsage } from "../../../lib/firestore-tubertify";

export default function CoursePage() {
  const { user } = useAuth();
  const params = useParams();
  const courseId = params.id as string;
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<VideoMeta | null>(null);
  const [generatedNotes, setGeneratedNotes] = useState<AINotes | null>(null);
  const [isGeneratingNotes, setIsGeneratingNotes] = useState(false);
  const [assistantQuestion, setAssistantQuestion] = useState("");
  const [assistantAnswer, setAssistantAnswer] = useState("");
  const [isAskingAssistant, setIsAskingAssistant] = useState(false);

  useEffect(() => {
    if (!courseId) return;
    getCourseWithModules(courseId)
      .then((data) => {
        if (!data) throw new Error("Course not found.");
        setCourse(data);
      })
      .catch((err: any) => setError(err.message))
      .finally(() => setLoading(false));
  }, [courseId]);

  const handleGenerateNotes = async (video: VideoMeta, moduleId: string) => {
    if (!user) { alert("Please sign in to generate notes."); return; }
    setIsGeneratingNotes(true);
    setGeneratedNotes(null);
    try {
      const existing = await getAINotesForVideo(courseId, moduleId, video.youtubeId);
      if (existing) { setGeneratedNotes(existing); return; }
      const canGenerate = await checkAndIncrementUsage(user.uid, "notes", 5);
      if (!canGenerate) { alert("Daily limit reached for AI notes. Try again tomorrow."); return; }
      const res = await fetch("/api/ai-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: video.title, transcript: video.transcript }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate notes.");
      await saveAINotes({ courseId, moduleId, videoId: video.youtubeId, ...data.notes });
      setGeneratedNotes(data.notes);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsGeneratingNotes(false);
    }
  };

  const handleAskAssistant = async () => {
    if (!user) { alert("Please sign in to use the assistant."); return; }
    if (!assistantQuestion.trim()) return;
    setIsAskingAssistant(true);
    setAssistantAnswer("");
    try {
      const canAsk = await checkAndIncrementUsage(user.uid, "assistant", 10);
      if (!canAsk) { alert("Daily limit reached for AI assistant. Try again tomorrow."); return; }
      const context = `Course: ${course?.title}${selectedVideo ? `\nVideo: ${selectedVideo.title}` : ""}`;
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: assistantQuestion, context }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to ask the assistant.");
      setAssistantAnswer(data.answer);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsAskingAssistant(false);
    }
  };

  if (loading) return <main className="container"><h1>Loading course...</h1></main>;
  if (error) return <main className="container"><h1>Error: {error}</h1></main>;
  if (!course) return <main className="container"><h1>Course not found.</h1></main>;

  return (
    <main className="container">
      <div className="header">
        <h1>{course.title}</h1>
        <p>{course.description}</p>
      </div>
      <div className="grid grid-3">
        <div className="col-span-2">
          {selectedVideo ? (
            <div className="video-player">
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="video-player-placeholder">
              <p>Select a video to start learning.</p>
            </div>
          )}
          {generatedNotes && (
            <div className="note-box" style={{ marginTop: "1rem" }}>
              <h3>AI Generated Notes</h3>
              <h4>Summary</h4><p>{generatedNotes.summary}</p>
              <h4>Key Points</h4>
              <ul>{generatedNotes.keyPoints.map((p, i) => <li key={i}>{p}</li>)}</ul>
              <h4>Concepts</h4>
              <ul>{generatedNotes.concepts.map((c, i) => <li key={i}>{c}</li>)}</ul>
            </div>
          )}
        </div>
        <div>
          <h2>Modules</h2>
          {course.modules.map((mod: Module) => (
            <div key={mod.id} className="module-card">
              <h3>{mod.title}</h3>
              <ul className="video-list-sm">
                {mod.videos.map((video) => (
                  <li key={video.youtubeId}>
                    <span onClick={() => setSelectedVideo(video)}>{video.title}</span>
                    <button onClick={() => handleGenerateNotes(video, mod.id)} disabled={isGeneratingNotes}>
                      {isGeneratingNotes ? "Generating..." : "Generate Notes"}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="card" style={{ marginTop: "1.5rem" }}>
            <h2 className="section-title">AI Learning Assistant</h2>
            <div className="form-group">
              <textarea
                rows={4}
                placeholder="Ask a question about the course or video..."
                value={assistantQuestion}
                onChange={(e) => setAssistantQuestion(e.target.value)}
              />
            </div>
            <button onClick={handleAskAssistant} disabled={isAskingAssistant}>
              {isAskingAssistant ? "Thinking..." : "Ask Assistant"}
            </button>
            {assistantAnswer && (
              <div className="note-box" style={{ marginTop: "1rem" }}>
                <p>{assistantAnswer}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
