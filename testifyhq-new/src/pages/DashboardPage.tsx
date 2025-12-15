import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function DashboardPage() {
  // Mock user data
  const user = {
    name: 'Usuario Demo',
    email: 'demo@testifyhq.com',
    subscription: 'free',
  };

  // Mock stats
  const stats = [
    { label: 'Exámenes completados', value: '12', icon: '📝' },
    { label: 'Promedio de puntaje', value: '78%', icon: '📊' },
    { label: 'Tiempo total estudiado', value: '8.5h', icon: '⏱️' },
    { label: 'Racha actual', value: '5 días', icon: '🔥' },
  ];

  // Mock recent exams
  const recentExams = [
    { id: 1, title: 'ISTQB Foundation', score: 85, date: '15 Dic 2025', passed: true },
    { id: 2, title: 'ISTQB Foundation', score: 72, date: '10 Dic 2025', passed: true },
    { id: 3, title: 'ISTQB Advanced', score: 58, date: '5 Dic 2025', passed: false },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Bienvenido, {user.name}
        </h1>
        <p className="text-gray-600 mt-2">
          Continúa tu progreso y alcanza tus metas
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <span className="text-4xl">{stat.icon}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>Tus últimos intentos de examen</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentExams.map((exam) => (
                <div
                  key={exam.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <h3 className="font-medium text-gray-900">{exam.title}</h3>
                    <p className="text-sm text-gray-600">{exam.date}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${exam.passed ? 'text-success-500' : 'text-error-500'}`}>
                      {exam.score}%
                    </p>
                    <span className={`text-xs ${exam.passed ? 'text-success-500' : 'text-error-500'}`}>
                      {exam.passed ? '✓ Aprobado' : '✗ Reprobado'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/exams" className="block mt-4">
              <Button variant="outline" className="w-full">
                Ver todos los resultados
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link to="/exams">
              <Button className="w-full">
                Comenzar Examen
              </Button>
            </Link>
            <Link to="/profile">
              <Button variant="outline" className="w-full">
                Ver Perfil
              </Button>
            </Link>
            <Link to="/pricing">
              <Button variant="outline" className="w-full">
                Mejorar a Premium
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
