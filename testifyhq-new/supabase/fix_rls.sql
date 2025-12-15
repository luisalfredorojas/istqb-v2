-- Allow authenticated users to insert exams
CREATE POLICY "Authenticated users can insert exams" 
  ON exams FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to insert questions
CREATE POLICY "Authenticated users can insert questions" 
  ON questions FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');
