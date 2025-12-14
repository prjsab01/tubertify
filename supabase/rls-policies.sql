-- RLS Policies for TUBERTIFY

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  admin_hash TEXT;
  user_hash TEXT;
BEGIN
  SELECT value INTO admin_hash FROM app_config WHERE key = 'admin_email_hash';
  user_hash := encode(digest(user_email, 'sha256'), 'hex');
  RETURN user_hash = admin_hash;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins can update any profile" ON profiles FOR UPDATE USING (
  is_admin((SELECT email FROM profiles WHERE id = auth.uid()))
);

-- Courses policies
CREATE POLICY "Anyone can view courses" ON courses FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create courses" ON courses FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update own courses" ON courses FOR UPDATE USING (created_by = auth.uid());
CREATE POLICY "Admins can update any course" ON courses FOR UPDATE USING (
  is_admin((SELECT email FROM profiles WHERE id = auth.uid()))
);
CREATE POLICY "Admins can delete courses" ON courses FOR DELETE USING (
  is_admin((SELECT email FROM profiles WHERE id = auth.uid()))
);

-- Course modules policies
CREATE POLICY "Anyone can view course modules" ON course_modules FOR SELECT USING (true);
CREATE POLICY "Course creators can manage modules" ON course_modules FOR ALL USING (
  EXISTS (SELECT 1 FROM courses WHERE id = course_id AND created_by = auth.uid())
);
CREATE POLICY "Admins can manage any modules" ON course_modules FOR ALL USING (
  is_admin((SELECT email FROM profiles WHERE id = auth.uid()))
);

-- Course progress policies
CREATE POLICY "Users can view own progress" ON course_progress FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can manage own progress" ON course_progress FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Admins can view all progress" ON course_progress FOR SELECT USING (
  is_admin((SELECT email FROM profiles WHERE id = auth.uid()))
);

-- Video progress policies
CREATE POLICY "Users can view own video progress" ON video_progress FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can manage own video progress" ON video_progress FOR ALL USING (user_id = auth.uid());

-- Bookmarks policies
CREATE POLICY "Users can manage own bookmarks" ON bookmarks FOR ALL USING (user_id = auth.uid());

-- Wishlists policies
CREATE POLICY "Users can manage own wishlist" ON wishlists FOR ALL USING (user_id = auth.uid());

-- Tests policies
CREATE POLICY "Anyone can view tests" ON tests FOR SELECT USING (true);
CREATE POLICY "Course creators can manage tests" ON tests FOR ALL USING (
  EXISTS (SELECT 1 FROM courses WHERE id = course_id AND created_by = auth.uid())
);
CREATE POLICY "Admins can manage any tests" ON tests FOR ALL USING (
  is_admin((SELECT email FROM profiles WHERE id = auth.uid()))
);

-- Test attempts policies
CREATE POLICY "Users can view own test attempts" ON test_attempts FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create test attempts" ON test_attempts FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own test attempts" ON test_attempts FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Admins can view all test attempts" ON test_attempts FOR SELECT USING (
  is_admin((SELECT email FROM profiles WHERE id = auth.uid()))
);

-- Certificates policies
CREATE POLICY "Users can view own certificates" ON certificates FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "System can create certificates" ON certificates FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage certificates" ON certificates FOR ALL USING (
  is_admin((SELECT email FROM profiles WHERE id = auth.uid()))
);

-- Books policies
CREATE POLICY "Anyone can view books" ON books FOR SELECT USING (true);
CREATE POLICY "Admins can manage books" ON books FOR ALL USING (
  is_admin((SELECT email FROM profiles WHERE id = auth.uid()))
);

-- Reading progress policies
CREATE POLICY "Users can manage own reading progress" ON reading_progress FOR ALL USING (user_id = auth.uid());

-- Points ledger policies
CREATE POLICY "Users can view own points ledger" ON points_ledger FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "System can create points entries" ON points_ledger FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins can view all points" ON points_ledger FOR SELECT USING (
  is_admin((SELECT email FROM profiles WHERE id = auth.uid()))
);

-- Login streaks policies
CREATE POLICY "Users can manage own streaks" ON login_streaks FOR ALL USING (user_id = auth.uid());

-- AI usage limits policies
CREATE POLICY "Users can view own AI usage" ON ai_usage_limits FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own AI usage" ON ai_usage_limits FOR ALL USING (user_id = auth.uid());

-- AI content flags policies
CREATE POLICY "Anyone can view AI content flags" ON ai_content_flags FOR SELECT USING (true);
CREATE POLICY "System can manage AI flags" ON ai_content_flags FOR ALL USING (true);

-- Course summaries policies
CREATE POLICY "Anyone can view course summaries" ON course_summaries FOR SELECT USING (true);
CREATE POLICY "System can manage summaries" ON course_summaries FOR ALL USING (true);

-- Video summaries policies
CREATE POLICY "Anyone can view video summaries" ON video_summaries FOR SELECT USING (true);
CREATE POLICY "System can manage video summaries" ON video_summaries FOR ALL USING (true);

-- Study notes policies
CREATE POLICY "Anyone can view study notes" ON study_notes FOR SELECT USING (true);
CREATE POLICY "System can manage study notes" ON study_notes FOR ALL USING (true);