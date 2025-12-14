-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- App configuration table
CREATE TABLE app_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(255) UNIQUE NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert admin email hash (SHA-256 of admin email)
INSERT INTO app_config (key, value) VALUES ('admin_email_hash', 'your_admin_email_hash_here');

-- Users table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  display_name VARCHAR(100),
  avatar_url TEXT,
  role VARCHAR(20) DEFAULT 'learner' CHECK (role IN ('learner', 'admin')),
  learning_goals TEXT[],
  preferred_topics TEXT[],
  time_commitment VARCHAR(50),
  total_points INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_login_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Courses table
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(500) NOT NULL,
  description TEXT,
  youtube_url TEXT,
  youtube_playlist_id VARCHAR(100),
  thumbnail_url TEXT,
  duration_minutes INTEGER,
  tags TEXT[],
  difficulty_level VARCHAR(20) DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  created_by UUID REFERENCES profiles(id),
  is_featured BOOLEAN DEFAULT FALSE,
  is_admin_created BOOLEAN DEFAULT FALSE,
  unlock_points INTEGER DEFAULT 0,
  total_modules INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Course modules/videos table
CREATE TABLE course_modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  youtube_video_id VARCHAR(20) NOT NULL,
  duration_seconds INTEGER,
  module_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Course progress tracking
CREATE TABLE course_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  progress_percentage DECIMAL(5,2) DEFAULT 0,
  last_watched_module_id UUID REFERENCES course_modules(id),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- Video progress tracking
CREATE TABLE video_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  module_id UUID REFERENCES course_modules(id) ON DELETE CASCADE,
  watched_seconds INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  last_watched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, module_id)
);

-- Bookmarks table
CREATE TABLE bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  module_id UUID REFERENCES course_modules(id) ON DELETE CASCADE,
  bookmark_type VARCHAR(20) NOT NULL CHECK (bookmark_type IN ('course', 'video')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, course_id, module_id)
);

-- Wishlist table
CREATE TABLE wishlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- Tests table
CREATE TABLE tests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  questions JSONB NOT NULL,
  passing_score INTEGER DEFAULT 80,
  time_limit_minutes INTEGER DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Test attempts table
CREATE TABLE test_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  test_id UUID REFERENCES tests(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  answers JSONB,
  score INTEGER,
  passed BOOLEAN DEFAULT FALSE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  time_taken_minutes INTEGER
);

-- Certificates table
CREATE TABLE certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  certificate_url TEXT,
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- Books/Library table
CREATE TABLE books (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(500) NOT NULL,
  author VARCHAR(255),
  google_drive_url TEXT NOT NULL,
  file_type VARCHAR(10) CHECK (file_type IN ('pdf', 'doc', 'docx', 'epub')),
  tags TEXT[],
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reading progress table
CREATE TABLE reading_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  book_id UUID REFERENCES books(id) ON DELETE CASCADE,
  pages_read INTEGER DEFAULT 0,
  total_pages INTEGER,
  is_completed BOOLEAN DEFAULT FALSE,
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, book_id)
);

-- Points ledger table
CREATE TABLE points_ledger (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  points_delta INTEGER NOT NULL,
  reason VARCHAR(100) NOT NULL,
  related_entity_type VARCHAR(50),
  related_entity_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Login streaks table
CREATE TABLE login_streaks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  login_date DATE NOT NULL,
  streak_count INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, login_date)
);

-- AI usage limits table
CREATE TABLE ai_usage_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  usage_type VARCHAR(50) NOT NULL,
  usage_date DATE NOT NULL,
  usage_count INTEGER DEFAULT 0,
  entity_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, usage_type, usage_date, entity_id)
);

-- AI generated content flags
CREATE TABLE ai_content_flags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  content_type VARCHAR(50) NOT NULL,
  is_generated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(entity_type, entity_id, content_type)
);

-- Course summaries table
CREATE TABLE course_summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  summary_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(course_id)
);

-- Video summaries table
CREATE TABLE video_summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id UUID REFERENCES course_modules(id) ON DELETE CASCADE,
  summary_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(module_id)
);

-- Study notes table
CREATE TABLE study_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  notes_content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(course_id)
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_courses_created_by ON courses(created_by);
CREATE INDEX idx_courses_featured ON courses(is_featured);
CREATE INDEX idx_courses_tags ON courses USING GIN(tags);
CREATE INDEX idx_course_modules_course_id ON course_modules(course_id);
CREATE INDEX idx_course_progress_user_id ON course_progress(user_id);
CREATE INDEX idx_course_progress_course_id ON course_progress(course_id);
CREATE INDEX idx_video_progress_user_id ON video_progress(user_id);
CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX idx_wishlists_user_id ON wishlists(user_id);
CREATE INDEX idx_test_attempts_user_id ON test_attempts(user_id);
CREATE INDEX idx_points_ledger_user_id ON points_ledger(user_id);
CREATE INDEX idx_ai_usage_limits_user_date ON ai_usage_limits(user_id, usage_date);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_content_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_notes ENABLE ROW LEVEL SECURITY;