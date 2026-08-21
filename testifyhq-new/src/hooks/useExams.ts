import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/hooks/useLanguage';
import type { Exam } from '@/types';

/**
 * Exámenes activos del idioma seleccionado. Cada traducción es una fila
 * propia en `exams`, así que cambiar de idioma es cambiar de filtro; el
 * idioma forma parte de la queryKey para que cada uno tenga su caché.
 */
export function useExams() {
  const { language } = useLanguage();

  return useQuery({
    queryKey: ['exams', language],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exams')
        .select('*')
        .eq('is_active', true)
        .eq('language', language)
        .order('id', { ascending: true });

      if (error) {
        throw error;
      }

      return data as Exam[];
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });
}
