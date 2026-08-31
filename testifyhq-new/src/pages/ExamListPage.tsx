import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useExams } from '@/hooks/useExams';
import { useLanguage } from '@/hooks/useLanguage';
import { Sparkles } from 'lucide-react';

export function ExamListPage() {
  const { data: exams, isLoading, error } = useExams();
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

        {/* Todos los exámenes son gratuitos y no requieren cuenta. */}
        <div className="mb-8 p-4 rounded-[12px] border border-primary-soft-border bg-primary-soft flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-ds-text">
              Todos los exámenes son gratuitos, sin registro y sin límite de intentos.
            </p>
            <p className="text-sm text-muted">
              Tu progreso se guarda en este navegador, así que no necesitas crear ninguna cuenta.
            </p>
          </div>
        </div>

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
            return (
              <Link key={exam.id} to={`/exam/${exam.id}`}>
                <Card className="relative h-full transition-colors cursor-pointer hover:border-primary">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-primary-soft text-primary text-xs font-semibold rounded-full">{exam.category}</span>
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
