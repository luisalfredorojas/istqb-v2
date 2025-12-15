import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { QuestionCard } from '@/components/exam/QuestionCard';
import { Timer } from '@/components/exam/Timer';
import { ProgressBar } from '@/components/exam/ProgressBar';
import { useExamStore } from '@/stores/examStore';
import { cn } from '@/lib/utils';
import type { Question } from '@/types';
import { mockQuestions } from '@/data/mockQuestions';

export function ExamPage() {
  const navigate = useNavigate();
  const [questions] = useState<Question[]>(mockQuestions);
  
  const {
    currentQuestion,
    examStarted,
    examCompleted,
    startExam,
    nextQuestion,
    previousQuestion,
    submitExam,
  } = useExamStore();

  useEffect(() => {
    // Start exam when component mounts
    if (!examStarted && !examCompleted && questions.length > 0) {
      startExam(questions.length, 60); // 60 minutes
    }

    // Cleanup on unmount
    return () => {
      const state = useExamStore.getState();
      if (!state.examCompleted) {
        state.resetExam();
      }
    };
  }, []);

  const handleSubmit = () => {
    submitExam();
    navigate('/results/1');
  };

  if (questions.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <p>Cargando examen...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header with Timer and Progress */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Examen ISTQB Foundation
            </h1>
            <Timer />
          </div>
          <ProgressBar />
        </div>

        {/* Question Card */}
        <div className="mb-6">
          <QuestionCard
            question={questions[currentQuestion]}
            questionNumber={currentQuestion + 1}
          />
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between bg-white rounded-lg shadow-sm p-6">
          <Button
            onClick={previousQuestion}
            disabled={currentQuestion === 0}
            variant="outline"
          >
            ← Anterior
          </Button>

          <div className="flex gap-3">
            {currentQuestion === questions.length - 1 ? (
              <Button onClick={handleSubmit} className="bg-success-500 hover:bg-green-600">
                Enviar Examen
              </Button>
            ) : (
              <Button onClick={nextQuestion}>
                Siguiente →
              </Button>
            )}
          </div>
        </div>

        {/* Question Navigator */}
        <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Navegación rápida:
          </h3>
          <div className="grid grid-cols-10 gap-2">
            {questions.map((q, index) => {
              const { answers } = useExamStore.getState();
              const isAnswered = !!answers[q.id];
              const isCurrent = index === currentQuestion;

              return (
                <button
                  key={q.id}
                  onClick={() => useExamStore.getState().goToQuestion(index)}
                  className={cn(
                    'w-10 h-10 rounded-md border-2 font-medium text-sm transition-all',
                    isCurrent && 'border-blue-600 bg-blue-50',
                    !isCurrent && isAnswered && 'border-green-500 bg-green-50',
                    !isCurrent && !isAnswered && 'border-gray-300 hover:border-gray-400'
                  )}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
