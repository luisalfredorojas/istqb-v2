import { mockQuestions } from '../data/mockQuestions';

// Note: This script is intended to be run locally with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
// For write operations to 'questions' table, you might need to temporarily disable RLS 
// or add a policy that allows anon inserts (NOT RECOMMENDED FOR PRODUCTION)
// OR use a SERVICE_ROLE_KEY if running from a secure backend environment.

// For this demo, we assume the user will run this in the browser console or we provide a UI button.
// Let's create a utility function that can be called from the app.

import { supabase } from '@/lib/supabase';

export const seedQuestions = async () => {
  console.log('Starting seed...');
  
  // 1. Get the exam ID (assuming ISTQB Foundation is ID 1)
  const { data: exams, error: examError } = await supabase
    .from('exams')
    .select('id')
    .eq('title', 'ISTQB Foundation Level')
    .single();

  if (examError || !exams) {
    console.error('Error finding exam:', examError);
    return;
  }

  const examId = (exams as any).id;
  console.log('Found Exam ID:', examId);

  // 2. Format questions for DB
  const questionsToInsert = mockQuestions.map(q => ({
    exam_id: examId,
    question_type: q.question_type,
    question_text: q.question_text,
    question_image_url: q.question_image_url,
    question_image_alt: q.question_image_alt,
    options: q.options as any, // Cast options to any for JSONB compatibility
    correct_answer: q.correct_answer,
    explanation: q.explanation,
    explanation_image_url: q.explanation_image_url,
    difficulty: q.difficulty,
    tags: q.tags,
    order_index: q.order_index
  }));

  // 3. Insert
  const { data, error } = await supabase
    .from('questions')
    .insert(questionsToInsert as any)
    .select();

  if (error) {
    console.error('Error inserting questions:', error);
    alert('Error al subir preguntas: ' + error.message);
  } else {
    console.log('Success! Inserted questions:', data);
    alert(`¡Éxito! Se subieron ${data.length} preguntas.`);
  }
};
