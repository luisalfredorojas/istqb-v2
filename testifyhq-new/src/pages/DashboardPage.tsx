import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useUserAttempts } from '@/hooks/useExamAttempts';
import { useUserRole } from '@/hooks/useUserRole';

export function DashboardPage() {
  const { user } = useAuth();
  const { data: attemptsData, isLoading } = useUserAttempts(user?.id);
  const { data: roleData } = useUserRole(user?.id);
  const attempts = attemptsData as any[] | undefined;

  const totalExams = attempts?.length || 0;
  const averageScore = totalExams > 0
    ? Math.round(attempts!.reduce((acc: number, curr: any) => acc + (curr.score || 0), 0) / totalExams)
    : 0;
  const totalTimeSeconds = attempts?.reduce((acc: number, curr: any) => acc + (curr.time_spent_seconds || 0), 0) || 0;
  const totalTimeHours = (totalTimeSeconds / 3600).toFixed(1);

  const stats = [
    { label: 'Exámenes completados', value: totalExams.toString(), icon: '📝' },
    { label: 'Promedio de puntaje', value: `${averageScore}%`, icon: '📊' },
    { label: 'Tiempo total estudiado', value: `${totalTimeHours}h`, icon: '⏱️' },
    { label: 'Racha actual', value: '1 día', icon: '🔥' },
  ];

  return (
    <div className="bg-bg min-h-screen transition-colors">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-ds-text">Hola, {user?.email?.split('@')[0]}</h1>
          <p className="text-muted mt-1">Continúa tu progreso y alcanza tus metas</p>
        </div>

        {roleData?.isAdmin && (
          <div className="mb-8 p-4 bg-primary-soft border border-primary-soft-border rounded-[12px] flex items-center justify-between transition-colors">
            <div>
              <h3 className="font-bold text-primary">Zona Administrativa</h3>
              <p className="text-sm text-ds-text">Gestiona exámenes y contenido de la plataforma</p>
            </div>
            <Link to="/admin/exams">
              <Button variant="outline" className="bg-surface border-primary-soft-border text-primary hover:bg-primary-soft">
                ⚙️ Gestionar Exámenes
              </Button>
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
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
              <CardDescription>Tus últimos intentos de examen</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted">Cargando actividad...</div>
              ) : attempts && attempts.length > 0 ? (
                <div className="space-y-3">
                  {attempts.slice(0, 5).map((attempt: any) => (
                    <Link key={attempt.id} to={`/results/${attempt.exam_id}?attemptId=${attempt.id}`}
                      className="flex items-center justify-between p-4 bg-bg rounded-[8px] border border-ds-border hover:border-ds-border-hover transition-colors"
                    >
                      <div>
                        <h3 className="font-medium text-ds-text">{attempt.exams?.title || 'Examen'}</h3>
                        <p className="text-sm text-muted">{new Date(attempt.completed_at).toLocaleDateString()}</p>
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
                <div className="text-center py-8 text-muted">No has realizado ningún examen aún.</div>
              )}
              <Link to="/exams" className="block mt-4">
                <Button variant="outline" className="w-full">Ver todos los resultados</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Acciones Rápidas</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Link to="/exams"><Button className="w-full">Comenzar Examen</Button></Link>
              <Link to="/donate"><Button variant="outline" className="w-full">❤️ Apoyar el Proyecto</Button></Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
