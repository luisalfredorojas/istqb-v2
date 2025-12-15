-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. EXAMS TABLE
CREATE TABLE IF NOT EXISTS exams (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('Foundation', 'Advanced', 'Expert')),
  duration_minutes INTEGER NOT NULL,
  passing_score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 2. QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exam_id INTEGER REFERENCES exams(id) ON DELETE CASCADE,
  question_type TEXT NOT NULL CHECK (question_type IN ('text', 'image', 'mixed')),
  question_text TEXT,
  question_image_url TEXT,
  question_image_alt TEXT,
  options JSONB NOT NULL, -- Stores the array of options
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  explanation_image_url TEXT,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  tags TEXT[],
  order_index INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 3. EXAM ATTEMPTS (RESULTS) TABLE
CREATE TABLE IF NOT EXISTS exam_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  exam_id INTEGER REFERENCES exams(id) ON DELETE CASCADE,
  answers JSONB NOT NULL, -- Stores user answers {"q_id": "option_id"}
  score INTEGER,
  passed BOOLEAN,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  completed_at TIMESTAMP WITH TIME ZONE,
  time_spent_seconds INTEGER
);

-- 4. ROW LEVEL SECURITY (RLS) POLICIES

-- Enable RLS
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_attempts ENABLE ROW LEVEL SECURITY;

-- Policies for Exams (Public Read)
CREATE POLICY "Exams are viewable by everyone" 
  ON exams FOR SELECT 
  USING (true);

-- Policies for Questions (Public Read)
CREATE POLICY "Questions are viewable by everyone" 
  ON questions FOR SELECT 
  USING (true);

-- Allow authenticated users to insert (for migration)
CREATE POLICY "Authenticated users can insert exams" 
  ON exams FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert questions" 
  ON questions FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

-- Policies for Attempts (Users can see/create their own)
CREATE POLICY "Users can view own attempts" 
  ON exam_attempts FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own attempts" 
  ON exam_attempts FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own attempts" 
  ON exam_attempts FOR UPDATE 
  USING (auth.uid() = user_id);

-- 5. INSERT INITIAL DATA (ISTQB Foundation)
INSERT INTO exams (title, description, category, difficulty, duration_minutes, passing_score, total_questions)
VALUES 
  ('ISTQB Foundation Level', 'Certificación base en testing de software', 'ISTQB', 'Foundation', 60, 65, 40);
