export type VideoMeta = {
  youtubeId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  playlistPosition: number;
  videoUrl: string;
  transcript?: string;
};

export type PlaylistImportRequest = {
  playlistUrl: string;
};

export type AssistantRequest = {
  question: string;
  context: string;
};

export type AssistantResponse = {
  answer: string;
};

export type Module = {
  id: string;
  title: string;
  description?: string;
  videos: VideoMeta[];
  order: number;
};

export type Course = {
  id?: string;
  title: string;
  description?: string;
  ownerId: string;
  modules: Module[];
  createdAt?: any;
  updatedAt?: any;
  isPublished?: boolean;
};

export type AINotes = {
  id?: string;
  courseId: string;
  moduleId: string;
  videoId: string;
  summary: string;
  keyPoints: string[];
  concepts: string[];
  generatedAt?: any;
};

export type MCQQuestion = {
  id?: string;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
};

export type MCQTest = {
  id?: string;
  courseId: string;
  moduleId: string;
  videoId?: string;
  questions: MCQQuestion[];
  generatedAt?: any;
  difficulty?: "easy" | "medium" | "hard";
};

export type UserProgress = {
  id?: string;
  userId: string;
  courseId: string;
  moduleId?: string;
  videoId?: string;
  completed: boolean;
  score?: number;
  completedAt?: any;
  lastAccessedAt?: any;
};

export type UserProfile = {
  email: string;
  displayName: string;
  full_name?: string;
  photoURL: string;
  role: string;
  createdAt: string;
};

export type Achievement = {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: string;
};

export type UserAchievement = {
  id?: string;
  userId: string;
  achievementId: string;
  unlockedAt?: any;
};

export type GamificationStats = {
  id?: string;
  userId: string;
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  coursesCompleted: number;
  testsCompleted: number;
  achievements: string[];
  lastActivityDate?: any;
};

export type AIUsageLimit = {
  id?: string;
  userId: string;
  feature: "summary" | "notes" | "quiz" | "assistant";
  date: string;
  usageCount: number;
  limit: number;
};

export type AIContentFlag = {
  id?: string;
  courseId: string;
  moduleId?: string;
  videoId?: string;
  contentType: "summary" | "notes" | "quiz";
  isGenerated: boolean;
  generatedAt?: any;
};

export type PointsLedger = {
  id?: string;
  userId: string;
  action: "course_complete" | "test_pass" | "achievement_unlock" | "daily_login";
  points: number;
  courseId?: string;
  recordedAt?: any;
};
