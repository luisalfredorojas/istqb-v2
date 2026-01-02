import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useExams } from '@/hooks/useExams';
import { useAuth } from '@/hooks/useAuth';
import { useDailyAttempts } from '@/hooks/useDailyAttempts';
import { AttemptCounter } from '@/components/exam/AttemptCounter';

export function ExamListPage() {
  const { user } = useAuth();
  const { data: exams, isLoading, error } = useExams();
  const { data: dailyAttemptsData, isLoading: isLoadingAttempts } = useDailyAttempts(user?.id);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-red-500">Error al cargar los exámenes. Por favor intenta más tarde.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Exámenes Disponibles
        </h1>
        <p className="text-lg text-gray-600">
          Selecciona un examen para comenzar a practicar
        </p>
      </div>

      {/* Daily Attempts Counter */}
      {!isLoadingAttempts && dailyAttemptsData && (
        <div className="mb-8">
          <AttemptCounter 
            remaining={dailyAttemptsData.remaining}
            todayAttempts={dailyAttemptsData.todayAttempts}
            isPremium={dailyAttemptsData.isPremium}
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exams?.map((exam) => (
          <Link key={exam.id} to={`/exam/${exam.id}`}>
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-3 py-1 bg-primary-100 text-primary-700 text-xs font-semibold rounded-full">
                    {exam.category}
                  </span>
                  <span className="text-sm text-gray-500">{exam.difficulty}</span>
                </div>
                <CardTitle className="text-xl">{exam.title}</CardTitle>
                <CardDescription>{exam.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>{exam.duration_minutes} minutos</span>
                  </div>
                  <div className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <span>{exam.total_questions} preguntas</span>
                  </div>
                  <div className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>Puntaje mínimo: {exam.passing_score}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
