import { createContext, useContext, useEffect, useLayoutEffect, useState, type ReactNode } from 'react';
import { isHydrating } from '@/lib/hydration';

/**
 * Idioma del *contenido de los exámenes* (enunciados y opciones), no de la
 * interfaz: la web está en español y así se queda. Cada examen existe como
 * una fila propia por idioma en la tabla `exams`, así que este valor es
 * simplemente el filtro con el que se pide el listado.
 */
export type ExamLanguage = 'es' | 'en';

const STORAGE_KEY = 'examLanguage';

interface LanguageContextType {
  language: ExamLanguage;
  setLanguage: (language: ExamLanguage) => void;
  toggleLanguage: () => void;
}

const DEFAULT_LANGUAGE: ExamLanguage = 'es';

function readStoredLanguage(): ExamLanguage {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'es' || stored === 'en') return stored;

  // Sin preferencia guardada: los exámenes oficiales de ISTQB están en
  // inglés, pero el público de la web es hispanohablante, así que el
  // idioma del navegador decide y en la duda se muestra español.
  return navigator.language?.toLowerCase().startsWith('en') ? 'en' : 'es';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<ExamLanguage>(() =>
    isHydrating() ? DEFAULT_LANGUAGE : readStoredLanguage()
  );

  // Al hidratar se empieza con el idioma del HTML prerenderizado.
  useLayoutEffect(() => {
    // Un único cambio al montar, antes de pintar: es justo lo que se busca.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (isHydrating()) setLanguage(readStoredLanguage());
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language);
  }, [language]);

  const toggleLanguage = () => setLanguage((prev) => (prev === 'es' ? 'en' : 'es'));

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage debe usarse dentro de un LanguageProvider');
  }
  return context;
}
