import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useExams } from '@/hooks/useExams';
import { useExamAccess, FREE_ATTEMPT_LIMIT } from '@/hooks/useExamAccess';
import { useLanguage } from '@/hooks/useLanguage';
import { Lock, Crown, Sparkles } from 'lucide-react';

export function ExamListPage() {
  const { data: exams, isLoading, error } = useExams();
  const access = useExamAccess();
  const { language, setLanguage } = useLanguage();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-ds-border border-t-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-danger">Error al cargar los exámenes. Por favor intenta más tarde.</p>
      </div>
    );
  }

  return (
    <div className="bg-bg min-h-screen transition-colors">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-ds-text mb-2">Exámenes Disponibles</h1>
          <p className="text-base text-muted">
            {language === 'es'
              ? 'Preguntas traducidas al español. Cambia a EN arriba para practicar con el enunciado original en inglés.'
              : 'Preguntas con el enunciado original en inglés. Cambia a ES arriba para practicar en español.'}
          </p>
        </div>

        {/* Aviso de plan gratuito */}
        {!access.isLoading && !access.isPremium && (
          <div className="mb-8 p-4 rounded-[12px] border border-primary-soft-border bg-primary-soft flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-ds-text">
                  Plan gratuito: solo el Examen A, hasta {FREE_ATTEMPT_LIMIT} simulacros.
                </p>
                <p className="text-sm text-muted">
                  Te quedan <strong>{access.freeAttemptsRemaining}</strong> de {FREE_ATTEMPT_LIMIT} simulacros. Hazte Premium para acceso ilimitado a todos los exámenes.
                </p>
              </div>
            </div>
            <Link
              to="/pricing"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[8px] bg-primary text-white text-sm font-medium px-4 h-10 hover:bg-primary-hover transition-colors"
            >
              <Crown className="w-4 h-4" /> Hazte Premium
            </Link>
          </div>
        )}

        {exams?.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-ds-text font-medium mb-1">
                Todavía no hay exámenes en {language === 'es' ? 'español' : 'inglés'}.
              </p>
              <p className="text-sm text-muted mb-4">
                Puedes practicar mientras tanto con los exámenes en{' '}
                {language === 'es' ? 'inglés' : 'español'}.
              </p>
              <button
                type="button"
                onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
                className="inline-flex items-center justify-center rounded-[8px] bg-primary text-white text-sm font-medium px-4 h-10 hover:bg-primary-hover transition-colors"
              >
                Ver exámenes en {language === 'es' ? 'inglés' : 'español'}
              </button>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams?.map((exam) => {
            const reason = access.lockReason(exam);
            const locked = reason !== null;
            const to = locked ? '/pricing' : `/exam/${exam.id}`;

            return (
              <Link key={exam.id} to={to}>
                <Card
                  className={`relative h-full transition-colors cursor-pointer ${
                    locked ? 'opacity-90 hover:border-primary' : 'hover:border-primary'
                  }`}
                >
                  {locked && (
                    <div className="absolute top-3 right-3 z-10 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-ds-text/85 text-white text-xs font-semibold">
                      <Lock className="w-3 h-3" />
                      {reason === 'attempts_exhausted' ? 'Límite alcanzado' : 'Premium'}
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-primary-soft text-primary text-xs font-semibold rounded-full">{exam.category}</span>
                        {exam.is_free && (
                          <span className="px-3 py-1 bg-success-soft text-success text-xs font-semibold rounded-full">Gratis</span>
                        )}
                        {exam.title.toLowerCase().includes('extra') && (
                          <span className="px-3 py-1 bg-emerald-500/15 text-emerald-400 text-xs font-semibold rounded-full">Extra</span>
                        )}
                      </div>
                      <span className="text-xs font-medium text-muted">{exam.difficulty}</span>
                    </div>
                    <CardTitle>{exam.title}</CardTitle>
                    <CardDescription>{exam.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-muted">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span>{exam.duration_minutes} minutos</span>
                      </div>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        <span>{exam.total_questions} preguntas</span>
                      </div>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span>Puntaje mínimo: {exam.passing_score}%</span>
                      </div>
                    </div>
                    {locked && (
                      <p className="mt-4 text-sm font-medium text-primary">
                        {reason === 'attempts_exhausted'
                          ? 'Has agotado tus simulacros gratis · Hazte Premium'
                          : 'Disponible con Premium →'}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
