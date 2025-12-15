import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { ExamAttempt } from '@/types';

export function useExamAttempts() {
  const queryClient = useQueryClient();

  const saveAttempt = useMutation({
    mutationFn: async (attempt: Omit<ExamAttempt, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('exam_attempts')
        .insert(attempt as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam_attempts'] });
    },
  });

  return {
    saveAttempt,
  };
}

export function useUserAttempts(userId: string | undefined) {
  return useQuery({
    queryKey: ['exam_attempts', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('exam_attempts')
        .select(`
          *,
          exams (
            title,
            category,
            difficulty
          )
        `)
        .eq('user_id', userId)
        .order('completed_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}
