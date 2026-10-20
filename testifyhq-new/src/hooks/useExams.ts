import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useLanguage, type ExamLanguage } from '@/hooks/useLanguage';
import type { Exam } from '@/types';

export const examsQueryKey = (language: ExamLanguage) => ['exams', language] as const;

/** También la usa el prerender para meter la lista real en el HTML estático. */
export async function fetchExams(language: ExamLanguage): Promise<Exam[]> {
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
}

/**
 * Exámenes activos del idioma seleccionado. Cada traducción es una fila
 * propia en `exams`, así que cambiar de idioma es cambiar de filtro; el
 * idioma forma parte de la queryKey para que cada uno tenga su caché.
 */
export function useExams() {
  const { language } = useLanguage();

  return useQuery({
    queryKey: examsQueryKey(language),
    queryFn: () => fetchExams(language),
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });
}
