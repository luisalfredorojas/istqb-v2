import { useState, useEffect } from 'react';

const STORAGE_KEY = 'testifyhq_exam_count';
const EXAMS_BEFORE_PROMPT = 2;

interface DonationPromptState {
  shouldShowPrompt: boolean;
  examCount: number;
  incrementExamCount: () => void;
  dismissPrompt: () => void;
}

/**
 * Hook para manejar cuándo mostrar el modal de donación
 * Se muestra cada 2 exámenes completados
 */
export function useDonationPrompt(): DonationPromptState {
  const [examCount, setExamCount] = useState<number>(() => {
    if (typeof window === 'undefined') return 0;
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? parseInt(stored, 10) : 0;
  });
  
  const [shouldShowPrompt, setShouldShowPrompt] = useState(false);

  // Guardar en localStorage cuando cambia
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, examCount.toString());
  }, [examCount]);

  const incrementExamCount = () => {
    const newCount = examCount + 1;
    setExamCount(newCount);
    
    // Mostrar prompt cada 2 exámenes
    if (newCount > 0 && newCount % EXAMS_BEFORE_PROMPT === 0) {
      setShouldShowPrompt(true);
    }
  };

  const dismissPrompt = () => {
    setShouldShowPrompt(false);
  };

  return {
    shouldShowPrompt,
    examCount,
    incrementExamCount,
    dismissPrompt,
  };
}
