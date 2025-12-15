import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function ExamListPage() {
  // Mock data - will be replaced with Supabase data later
  const exams = [
    {
      id: 1,
      title: 'ISTQB Foundation Level',
      description: 'Certificación base en testing de software',
      category: 'ISTQB',
      difficulty: 'Foundation',
      duration: 60,
      totalQuestions: 40,
      passingScore: 65,
    },
    {
      id: 2,
      title: 'ISTQB Advanced Level',
      description: 'Certificación avanzada en testing',
      category: 'ISTQB',
      difficulty: 'Advanced',
      duration: 90,
      totalQuestions: 60,
      passingScore: 70,
    },
  ];

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exams.map((exam) => (
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
                    <span>{exam.duration} minutos</span>
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
                    <span>{exam.totalQuestions} preguntas</span>
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
                    <span>Puntaje mínimo: {exam.passingScore}%</span>
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
