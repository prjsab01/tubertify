"use client";

export const runtime = 'edge';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { Course, Module, VideoMeta, AINotes } from "../../../lib/types";
import { useAuth } from "../../../components/Providers";

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

  useEffect(() => {
    if (!courseId) return;

    async function fetchCourse() {
      try {
        const response = await fetch(`/api/course/${courseId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch course data.");
        }
        const data = await response.json();
        setCourse(data.course);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchCourse();
  }, [courseId]);

  const handleGenerateNotes = async (video: VideoMeta, moduleId: string) => {
    if (!user) {
      alert("Please sign in to generate notes.");
      return;
    }
    setIsGeneratingNotes(true);
    setGeneratedNotes(null);
    try {
      const response = await fetch("/api/ai-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          courseId,
          moduleId,
          videoId: video.youtubeId,
          title: video.title,
          transcript: video.transcript,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate notes.");
      }
      setGeneratedNotes(data.notes);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsGeneratingNotes(false);
    }
  };

  const [assistantQuestion, setAssistantQuestion] = useState("");
  const [assistantAnswer, setAssistantAnswer] = useState("");
  const [isAskingAssistant, setIsAskingAssistant] = useState(false);

  const handleAskAssistant = async () => {
    if (!user) {
      alert("Please sign in to use the assistant.");
      return;
    }
    if (!assistantQuestion.trim()) {
      return;
    }
    setIsAskingAssistant(true);
    setAssistantAnswer("");
    try {
      const context = `Course: ${course?.title}${selectedVideo ? `\nVideo: ${selectedVideo.title}` : ""}`;
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          question: assistantQuestion,
          context,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to ask the assistant.");
      }
      setAssistantAnswer(data.answer);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsAskingAssistant(false);
    }
  };

  if (loading) {
    return <main className="container"><h1>Loading course...</h1></main>;
  }

  if (error) {
    return <main className="container"><h1>Error: {error}</h1></main>;
  }

  if (!course) {
    return <main className="container"><h1>Course not found.</h1></main>;
  }

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
              ></iframe>
            </div>
          ) : (
            <div className="video-player-placeholder">
              <p>Select a video to start learning.</p>
            </div>
          )}
          {generatedNotes && (
            <div className="note-box" style={{ marginTop: "1rem" }}>
              <h3>AI Generated Notes</h3>
              <h4>Summary</h4>
              <p>{generatedNotes.summary}</p>
              <h4>Key Points</h4>
              <ul>
                {generatedNotes.keyPoints.map((point, index) => (
                  <li key={index}>{point}</li>
                ))}
              </ul>
              <h4>Concepts</h4>
              <ul>
                {generatedNotes.concepts.map((concept, index) => (
                  <li key={index}>{concept}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div>
          <h2>Modules</h2>
          {course.modules.map((module: Module) => (
            <div key={module.id} className="module-card">
              <h3>{module.title}</h3>
              <ul className="video-list-sm">
                {module.videos.map((video) => (
                  <li key={video.youtubeId}>
                    <span onClick={() => setSelectedVideo(video)}>{video.title}</span>
                    <button onClick={() => handleGenerateNotes(video, module.id)} disabled={isGeneratingNotes}>
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
