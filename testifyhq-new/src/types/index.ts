// Re-export database types
export type { Database } from './database.types';

// Exam related types
export interface QuestionOption {
  id: string;
  type: 'text' | 'image';
  content?: string;
  image_url?: string;
  alt?: string;
}

export interface Question {
  id: string;
  exam_id: number;
  question_type: 'text' | 'image' | 'mixed';
  question_text: string | null;
  question_image_url: string | null;
  question_image_alt: string | null;
  options: QuestionOption[];
  correct_answer: string;
  explanation: string | null;
  explanation_image_url: string | null;
  difficulty: 'easy' | 'medium' | 'hard' | null;
  tags: string[] | null;
  order_index: number | null;
}

export interface Exam {
  id: number;
  title: string;
  description: string | null;
  category: string;
  difficulty: 'foundation' | 'advanced' | 'expert' | null;
  duration_minutes: number;
  passing_score: number;
  total_questions: number;
  is_active: boolean;
}

export interface ExamAttempt {
  id: string;
  user_id: string;
  exam_id: number;
  answers: Record<string, string>;
  score: number | null;
  percentage: number | null;
  passed: boolean | null;
  started_at: string;
  completed_at: string | null;
  time_spent_seconds: number | null;
}

export interface UserProfile {
  id: string;
  email: string;
  display_name: string | null;
  photo_url: string | null;
  subscription_tier: 'free' | 'premium' | 'enterprise';
  subscription_expires_at: string | null;
}
