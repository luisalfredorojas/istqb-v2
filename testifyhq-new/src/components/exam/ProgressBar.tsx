import { useExamStore } from '@/stores/examStore';

export function ProgressBar() {
  const { currentQuestion, totalQuestions, getAnsweredCount } = useExamStore();
  const progress = useExamStore((state) => state.getProgress());
  const answeredCount = getAnsweredCount();

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-gray-700">
          Pregunta {currentQuestion + 1} de {totalQuestions}
        </span>
        <span className="text-gray-600">
          {answeredCount} / {totalQuestions} respondidas
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
