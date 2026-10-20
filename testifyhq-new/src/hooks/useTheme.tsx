import { useState, useEffect, useLayoutEffect, createContext, useContext, type ReactNode } from 'react';
import { isHydrating } from '@/lib/hydration';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const DEFAULT_THEME: Theme = 'dark';

function readStoredTheme(): Theme {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('theme') as Theme;
    if (stored) return stored;
  }
  return DEFAULT_THEME;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() =>
    isHydrating() ? DEFAULT_THEME : readStoredTheme()
  );

  // Al hidratar se empieza con el tema del HTML prerenderizado. El <html>
  // ya tiene la clase correcta desde el script de index.html.
  useLayoutEffect(() => {
    // Un único cambio al montar, antes de pintar: es justo lo que se busca.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (isHydrating()) setTheme(readStoredTheme());
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
