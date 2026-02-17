import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

export function HomePage() {
  const { user } = useAuth();

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden transition-colors"
      style={{
        background: `
          radial-gradient(ellipse 80% 60% at 70% 20%, var(--primary-soft) 0%, transparent 50%),
          radial-gradient(ellipse 60% 50% at 20% 80%, var(--primary-soft) 0%, transparent 40%),
          radial-gradient(ellipse 100% 100% at 50% 50%, var(--bg) 0%, var(--bg) 100%)
        `,
      }}
    >
      {/* Animated floating gradient blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/3 -right-1/4 w-[700px] h-[700px] rounded-full bg-primary/8 blur-[120px] animate-[drift_20s_ease-in-out_infinite]" />
        <div className="absolute -bottom-1/4 -left-1/4 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[100px] animate-[drift_25s_ease-in-out_infinite_reverse]" />
        <div className="absolute top-1/4 left-1/2 w-[400px] h-[400px] rounded-full bg-success/3 blur-[100px] animate-[drift_30s_ease-in-out_2s_infinite]" />
      </div>

      <div className="relative container mx-auto px-4 flex items-center min-h-[calc(100vh-4rem)]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center w-full py-12 lg:py-0">

          {/* Left — Text Content */}
          <div className="max-w-xl">
            <div className="animate-[fadeSlideUp_0.6s_ease-out_both]">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-soft text-primary text-sm font-semibold mb-6">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Preparación ISTQB Foundation
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-bold text-ds-text leading-[1.1] mb-6 animate-[fadeSlideUp_0.6s_ease-out_0.1s_both]">
              Domina tu certificación{' '}
              <span className="text-primary">ISTQB</span>{' '}
              con práctica real
            </h1>

            <p className="text-lg text-muted leading-relaxed mb-8 animate-[fadeSlideUp_0.6s_ease-out_0.2s_both]">
              Exámenes simulados con retroalimentación instantánea,
              explicaciones detalladas y seguimiento de tu progreso.
              Todo lo que necesitas para aprobar a la primera.
            </p>

            <div className="flex gap-4 flex-wrap animate-[fadeSlideUp_0.6s_ease-out_0.3s_both]">
              {user ? (
                <Link to="/dashboard">
                  <Button size="lg" className="text-base px-8 shadow-lg shadow-primary/25">
                    Ir al Dashboard →
                  </Button>
                </Link>
              ) : (
                <Link to="/signup">
                  <Button size="lg" className="text-base px-8 shadow-lg shadow-primary/25">
                    Comenzar Gratis →
                  </Button>
                </Link>
              )}
              <Link to="/exams">
                <Button size="lg" variant="outline" className="text-base px-8">
                  Ver Exámenes
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="flex gap-8 mt-12 animate-[fadeSlideUp_0.6s_ease-out_0.4s_both]">
              {[
                { value: '500+', label: 'Preguntas' },
                { value: '24/7', label: 'Disponible' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl font-bold text-ds-text tabular-nums">{stat.value}</div>
                  <div className="text-xs text-muted mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Exam Preview Mock */}
          <div className="relative animate-[fadeSlideUp_0.8s_ease-out_0.3s_both]">
            {/* Decorative glow */}
            <div className="absolute inset-0 bg-primary/10 rounded-[24px] blur-2xl scale-95" />

            {/* Main card */}
            <div className="relative bg-surface border border-ds-border rounded-[16px] shadow-xl shadow-black/5 p-6 transition-colors">
              {/* Mock header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-danger" />
                  <div className="w-3 h-3 rounded-full bg-warning" />
                  <div className="w-3 h-3 rounded-full bg-success" />
                </div>
                <div className="flex items-center gap-2 text-xs text-muted">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="tabular-nums font-medium">45:00</span>
                </div>
              </div>

              {/* Mock progress bar */}
              <div className="mb-5">
                <div className="flex justify-between text-xs text-muted mb-1.5">
                  <span>Pregunta 7 de 40</span>
                  <span className="text-primary font-medium">18%</span>
                </div>
                <div className="w-full bg-ds-border rounded-full h-1.5">
                  <div className="bg-primary h-1.5 rounded-full w-[18%] transition-all" />
                </div>
              </div>

              {/* Mock question */}
              <div className="mb-5">
                <h3 className="text-sm font-semibold text-ds-text mb-4">
                  ¿Cuál es el principal objetivo de las pruebas de software?
                </h3>

                {/* Mock options */}
                <div className="space-y-2.5">
                  {[
                    { id: 'A', text: 'Demostrar que el software no tiene defectos', selected: false },
                    { id: 'B', text: 'Encontrar defectos y evaluar la calidad', selected: true },
                    { id: 'C', text: 'Asegurar que el software cumple todos los requisitos', selected: false },
                    { id: 'D', text: 'Verificar que el código esté bien documentado', selected: false },
                  ].map((opt) => (
                    <div
                      key={opt.id}
                      className={`flex items-center gap-3 p-3 rounded-[8px] border-2 text-sm transition-all ${
                        opt.selected
                          ? 'border-primary bg-primary-soft'
                          : 'border-ds-border'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                        opt.selected ? 'border-primary bg-primary' : 'border-ds-border-hover'
                      }`}>
                        {opt.selected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <span className={opt.selected ? 'text-ds-text font-medium' : 'text-muted'}>
                        {opt.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mock navigation buttons */}
              <div className="flex justify-between items-center pt-3 border-t border-ds-border">
                <span className="text-xs text-muted">← Anterior</span>
                <div className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-xs font-medium rounded-[8px]">
                  Siguiente →
                </div>
              </div>
            </div>

            {/* Floating badge */}
            <div className="absolute -top-4 -right-4 bg-surface border border-ds-border rounded-[12px] shadow-lg p-3 animate-[float_3s_ease-in-out_infinite] transition-colors">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-success-soft flex items-center justify-center">
                  <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs font-bold text-ds-text">¡Correcto!</div>
                  <div className="text-[10px] text-muted">+1 punto</div>
                </div>
              </div>
            </div>

            {/* Floating stats card */}
            <div className="absolute -bottom-4 -left-4 bg-surface border border-ds-border rounded-[12px] shadow-lg p-3 animate-[float_4s_ease-in-out_0.5s_infinite] transition-colors">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary-soft flex items-center justify-center">
                  <span className="text-primary text-sm font-bold">85</span>
                </div>
                <div>
                  <div className="text-xs font-bold text-ds-text">Tu promedio</div>
                  <div className="text-[10px] text-success font-medium">↑ 12% esta semana</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeSlideUp {
          from {
            opacity: 0;
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes drift {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(30px, -30px); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
}
