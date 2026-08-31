import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAttemptHistory } from '@/hooks/useAttemptHistory';

/**
 * Progreso del visitante. No hay cuentas: el historial es el que guarda este
 * navegador, así que las estadísticas se calculan sobre él.
 */
export function DashboardPage() {
  const { attempts, clear } = useAttemptHistory();

  const totalExams = attempts.length;
  const averageScore = totalExams > 0
    ? Math.round(attempts.reduce((acc, a) => acc + a.score, 0) / totalExams)
    : 0;
  const bestScore = totalExams > 0 ? Math.max(...attempts.map((a) => a.score)) : 0;
  const totalTimeHours = (
    attempts.reduce((acc, a) => acc + a.timeSpentSeconds, 0) / 3600
  ).toFixed(1);

  const stats = [
    { label: 'Simulacros completados', value: totalExams.toString(), icon: '📝' },
    { label: 'Promedio de puntaje', value: `${averageScore}%`, icon: '📊' },
    { label: 'Mejor puntaje', value: `${bestScore}%`, icon: '🏆' },
    { label: 'Tiempo total practicado', value: `${totalTimeHours}h`, icon: '⏱️' },
  ];

  const handleClear = () => {
    if (confirm('Se borrará el historial guardado en este navegador. ¿Continuar?')) {
      clear();
    }
  };

  return (
    <div className="bg-bg min-h-screen transition-colors">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-ds-text">Tu progreso</h1>
          <p className="text-muted mt-1">
            Guardado en este navegador, sin necesidad de cuenta.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted">{stat.label}</p>
                    <p className="text-2xl font-bold text-ds-text mt-1 tabular-nums">{stat.value}</p>
                  </div>
                  <span className="text-3xl">{stat.icon}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Actividad Reciente</CardTitle>
              <CardDescription>Tus últimos simulacros en este dispositivo</CardDescription>
            </CardHeader>
            <CardContent>
              {attempts.length > 0 ? (
                <div className="space-y-3">
                  {attempts.slice(0, 5).map((attempt) => (
                    <Link key={attempt.id} to={`/results/${attempt.examId}?attemptId=${attempt.id}`}
                      className="flex items-center justify-between p-4 bg-bg rounded-[8px] border border-ds-border hover:border-ds-border-hover transition-colors"
                    >
                      <div>
                        <h3 className="font-medium text-ds-text">{attempt.examTitle}</h3>
                        <p className="text-sm text-muted">{new Date(attempt.completedAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold tabular-nums ${attempt.passed ? 'text-success' : 'text-danger'}`}>{attempt.score}%</p>
                        <span className={`text-xs font-medium ${attempt.passed ? 'text-success' : 'text-danger'}`}>
                          {attempt.passed ? '✓ Aprobado' : '✗ Reprobado'}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted">
                  Todavía no has hecho ningún simulacro en este navegador.
                </div>
              )}
              <Link to="/exams" className="block mt-4">
                <Button variant="outline" className="w-full">Ver exámenes disponibles</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Acciones Rápidas</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Link to="/exams"><Button className="w-full">Comenzar Examen</Button></Link>
              {attempts.length > 0 && (
                <Button variant="outline" className="w-full" onClick={handleClear}>
                  Borrar mi historial
                </Button>
              )}
              <p className="text-xs text-muted leading-relaxed pt-2">
                Este historial vive solo en tu navegador: no se envía a ningún
                servidor y se pierde si borras los datos del sitio o cambias de
                dispositivo.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
