import { useLanguage, type ExamLanguage } from '@/hooks/useLanguage';
import { cn } from '@/lib/utils';

const OPTIONS: { value: ExamLanguage; label: string; title: string }[] = [
  { value: 'es', label: 'ES', title: 'Exámenes en español' },
  { value: 'en', label: 'EN', title: 'Exámenes en inglés' },
];

/**
 * Selector del idioma de los exámenes. Se pinta como un switch de dos
 * posiciones con la pastilla deslizante detrás de las etiquetas, para que
 * se lea igual que el toggle de tema que tiene al lado.
 */
export function LanguageSwitch({ className }: { className?: string }) {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      role="radiogroup"
      aria-label="Idioma de los exámenes"
      className={cn(
        'relative flex h-8 items-center rounded-full border border-ds-border bg-surface-alt p-0.5',
        className
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'absolute top-0.5 h-6 w-[calc(50%-2px)] rounded-full bg-surface border border-ds-border shadow-sm transition-all duration-300',
          language === 'es' ? 'left-0.5' : 'left-[calc(50%+1px)]'
        )}
      />
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={language === option.value}
          title={option.title}
          onClick={() => setLanguage(option.value)}
          className={cn(
            'relative z-10 h-6 w-9 rounded-full text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
            language === option.value ? 'text-primary' : 'text-muted hover:text-ds-text'
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
