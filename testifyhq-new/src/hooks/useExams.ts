import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Exam } from '@/types';

export function useExams() {
  return useQuery({
    queryKey: ['exams'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exams')
        .select('*')
        .eq('is_active', true)
        .order('id', { ascending: true });

      if (error) {
        throw error;
      }

      return data as Exam[];
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });
}
