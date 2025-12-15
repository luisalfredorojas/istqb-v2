import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary-50 to-white py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Prepárate para tu certificación profesional
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Practica con exámenes reales, obtén retroalimentación instantánea y
            alcanza tus objetivos profesionales con TestifyHQ.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" className="text-lg px-8">
                Comenzar Gratis
              </Button>
            </Link>
            <Link to="/exams">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Ver Exámenes
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            ¿Por qué elegir TestifyHQ?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-primary-600"
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
                </div>
                <CardTitle>Exámenes Reales</CardTitle>
                <CardDescription>
                  Practica con preguntas basadas en exámenes de certificación reales
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-primary-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <CardTitle>Retroalimentación Instantánea</CardTitle>
                <CardDescription>
                  Obtén explicaciones detalladas de cada respuesta al instante
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-primary-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <CardTitle>Seguimiento de Progreso</CardTitle>
                <CardDescription>
                  Monitorea tu avance y identifica áreas de mejora
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600 py-16 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            ¿Listo para comenzar?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Únete a miles de profesionales que ya están mejorando sus habilidades
          </p>
          <Link to="/signup">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Crear Cuenta Gratis
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
