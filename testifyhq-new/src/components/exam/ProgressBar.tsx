import { useExamStore } from '@/stores/examStore';

export function ProgressBar() {
  const { currentQuestion, totalQuestions, getAnsweredCount } = useExamStore();
  const progress = useExamStore((state) => state.getProgress());
  const answeredCount = getAnsweredCount();

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-ds-text">
          Pregunta {currentQuestion + 1} de {totalQuestions}
        </span>
        <span className="text-muted">
          {answeredCount} / {totalQuestions} respondidas
        </span>
      </div>
      <div className="w-full bg-ds-border rounded-full h-2">
        <div
          className="bg-primary h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Progreso del examen: ${Math.round(progress)}%`}
        />
      </div>
    </div>
  );
}
