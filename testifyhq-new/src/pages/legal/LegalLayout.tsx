import type { ReactNode } from 'react';
import { LEGAL_LAST_UPDATED, isPending } from '@/lib/legal';

interface LegalLayoutProps {
  title: string;
  intro?: string;
  children: ReactNode;
}

/** Marco común de las páginas legales, con tipografía legible. */
export function LegalLayout({ title, intro, children }: LegalLayoutProps) {
  return (
    <div className="bg-bg min-h-screen transition-colors">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-bold text-ds-text mb-3">{title}</h1>
        <p className="text-sm text-muted mb-8">
          Última actualización: {LEGAL_LAST_UPDATED}
        </p>
        {intro && <p className="text-muted leading-relaxed mb-8">{intro}</p>}
        <div className="legal-content space-y-8">{children}</div>
      </div>
    </div>
  );
}

/** Sección con encabezado, para estructurar los textos legales. */
export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="text-xl font-semibold text-ds-text mb-3">{title}</h2>
      <div className="text-muted leading-relaxed space-y-3">{children}</div>
    </section>
  );
}

/**
 * Muestra un dato del titular; si sigue sin rellenar, lo resalta para que
 * no pase desapercibido antes de publicar.
 */
export function LegalValue({ value }: { value: string }) {
  if (isPending(value)) {
    return (
      <span className="px-2 py-0.5 rounded bg-danger/10 text-danger font-medium">
        {value}
      </span>
    );
  }
  return <span className="text-ds-text font-medium">{value}</span>;
}
