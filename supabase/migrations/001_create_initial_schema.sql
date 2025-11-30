-- Create enum types
CREATE TYPE user_type AS ENUM ('CUSTOMER', 'ANSWERER', 'ADMIN');
CREATE TYPE answerer_type AS ENUM ('KOREAN_NATIVE', 'LONG_TERM_RESIDENT');
CREATE TYPE post_type AS ENUM ('QUESTION', 'ANSWER');
CREATE TYPE category_type AS ENUM ('TRANSPORT', 'FOOD', 'ACCOMMODATION', 'CULTURE', 'ACTIVITIES', 'VISA_DOCUMENTS', 'SAFETY');

-- User Profiles Table
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  language_preference VARCHAR(10) DEFAULT 'en',
  user_type user_type NOT NULL DEFAULT 'CUSTOMER',
  answerer_type answerer_type,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Questions Table
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  category category_type NOT NULL,
  body TEXT NOT NULL, -- Tiptap JSON format
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Answers Table
CREATE TABLE answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE SET NULL,
  body TEXT NOT NULL, -- Tiptap JSON format
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Comments Table
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_type post_type NOT NULL,
  post_id UUID NOT NULL, -- Can reference either question or answer
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE SET NULL,
  body TEXT NOT NULL, -- Plain text only
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Attachments Table
CREATE TABLE attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_type post_type NOT NULL,
  post_id UUID NOT NULL, -- Can reference either question or answer
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_name TEXT,
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes
CREATE INDEX idx_questions_user_id ON questions(user_id);
CREATE INDEX idx_questions_category ON questions(category);
CREATE INDEX idx_questions_created_at ON questions(created_at DESC);
CREATE INDEX idx_questions_title_text ON questions USING GIN(to_tsvector('english', title));
CREATE INDEX idx_questions_body_text ON questions USING GIN(to_tsvector('english', body));

CREATE INDEX idx_answers_question_id ON answers(question_id);
CREATE INDEX idx_answers_user_id ON answers(user_id);
CREATE INDEX idx_answers_created_at ON answers(created_at DESC);

CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);

CREATE INDEX idx_attachments_post_id ON attachments(post_id);

-- Row Level Security (RLS) Policies

-- user_profiles RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access on user_profiles"
  ON user_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- questions RLS
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access on questions"
  ON questions FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create questions"
  ON questions FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own questions"
  ON questions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can delete any question"
  ON questions FOR DELETE
  USING (
    auth.uid() IN (
      SELECT id FROM user_profiles WHERE user_type = 'ADMIN'
    ) OR auth.uid() = user_id
  );

-- answers RLS
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access on answers"
  ON answers FOR SELECT
  USING (true);

CREATE POLICY "Authenticated ANSWERER users can create answers"
  ON answers FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    auth.uid() IN (
      SELECT id FROM user_profiles WHERE user_type IN ('ANSWERER', 'ADMIN')
    )
  );

CREATE POLICY "Users can update own answers"
  ON answers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can delete any answer"
  ON answers FOR DELETE
  USING (
    auth.uid() IN (
      SELECT id FROM user_profiles WHERE user_type = 'ADMIN'
    ) OR auth.uid() = user_id
  );

-- comments RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access on comments"
  ON comments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create comments"
  ON comments FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete own comments"
  ON comments FOR DELETE
  USING (auth.uid() = user_id);

-- attachments RLS
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access on attachments"
  ON attachments FOR SELECT
  USING (true);

-- Note: File uploads are handled via API routes with authentication checks
-- No INSERT/UPDATE/DELETE policies needed for direct client access
