export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          display_name: string | null
          photo_url: string | null
          subscription_tier: 'free' | 'premium' | 'enterprise'
          subscription_expires_at: string | null
          firebase_uid: string | null
          created_at: string
          last_login: string | null
          preferences: Json
        }
        Insert: {
          id: string
          email: string
          display_name?: string | null
          photo_url?: string | null
          subscription_tier?: 'free' | 'premium' | 'enterprise'
          subscription_expires_at?: string | null
          firebase_uid?: string | null
          created_at?: string
          last_login?: string | null
          preferences?: Json
        }
        Update: {
          id?: string
          email?: string
          display_name?: string | null
          photo_url?: string | null
          subscription_tier?: 'free' | 'premium' | 'enterprise'
          subscription_expires_at?: string | null
          firebase_uid?: string | null
          created_at?: string
          last_login?: string | null
          preferences?: Json
        }
      }
      exams: {
        Row: {
          id: number
          title: string
          description: string | null
          category: string
          difficulty: 'foundation' | 'advanced' | 'expert' | null
          duration_minutes: number
          passing_score: number
          total_questions: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          title: string
          description?: string | null
          category: string
          difficulty?: 'foundation' | 'advanced' | 'expert' | null
          duration_minutes: number
          passing_score: number
          total_questions: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          title?: string
          description?: string | null
          category?: string
          difficulty?: 'foundation' | 'advanced' | 'expert' | null
          duration_minutes?: number
          passing_score?: number
          total_questions?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      questions: {
        Row: {
          id: string
          exam_id: number
          question_type: 'text' | 'image' | 'mixed'
          question_text: string | null
          question_image_url: string | null
          question_image_alt: string | null
          options: Json
          correct_answer: string
          explanation: string | null
          explanation_image_url: string | null
          difficulty: 'easy' | 'medium' | 'hard' | null
          tags: string[] | null
          order_index: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          exam_id: number
          question_type: 'text' | 'image' | 'mixed'
          question_text?: string | null
          question_image_url?: string | null
          question_image_alt?: string | null
          options: Json
          correct_answer: string
          explanation?: string | null
          explanation_image_url?: string | null
          difficulty?: 'easy' | 'medium' | 'hard' | null
          tags?: string[] | null
          order_index?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          exam_id?: number
          question_type?: 'text' | 'image' | 'mixed'
          question_text?: string | null
          question_image_url?: string | null
          question_image_alt?: string | null
          options?: Json
          correct_answer?: string
          explanation?: string | null
          explanation_image_url?: string | null
          difficulty?: 'easy' | 'medium' | 'hard' | null
          tags?: string[] | null
          order_index?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      user_exam_attempts: {
        Row: {
          id: string
          user_id: string
          exam_id: number
          answers: Json
          score: number | null
          percentage: number | null
          passed: boolean | null
          started_at: string
          completed_at: string | null
          time_spent_seconds: number | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          exam_id: number
          answers: Json
          score?: number | null
          percentage?: number | null
          passed?: boolean | null
          started_at: string
          completed_at?: string | null
          time_spent_seconds?: number | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          exam_id?: number
          answers?: Json
          score?: number | null
          percentage?: number | null
          passed?: boolean | null
          started_at?: string
          completed_at?: string | null
          time_spent_seconds?: number | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
      payment_orders: {
        Row: {
          id: string
          user_id: string
          plan_type: 'monthly' | 'yearly'
          amount: number
          currency: string
          status: 'pending' | 'completed' | 'failed' | 'cancelled'
          payment_provider: string
          payphone_transaction_id: string | null
          created_at: string
          completed_at: string | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          user_id: string
          plan_type: 'monthly' | 'yearly'
          amount: number
          currency?: string
          status?: 'pending' | 'completed' | 'failed' | 'cancelled'
          payment_provider?: string
          payphone_transaction_id?: string | null
          created_at?: string
          completed_at?: string | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          user_id?: string
          plan_type?: 'monthly' | 'yearly'
          amount?: number
          currency?: string
          status?: 'pending' | 'completed' | 'failed' | 'cancelled'
          payment_provider?: string
          payphone_transaction_id?: string | null
          created_at?: string
          completed_at?: string | null
          metadata?: Json | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
