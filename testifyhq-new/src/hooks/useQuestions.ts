import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Question } from '@/types';

export function useQuestions(examId: number) {
  return useQuery({
    queryKey: ['questions', examId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('questions')
        .select(`
          *,
          explanation_video_url
        `)
        .eq('exam_id', examId)
        .order('order_index', { ascending: true });

      if (error) {
        throw error;
      }

      return data as Question[];
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
    refetchOnWindowFocus: false,
  });
}
