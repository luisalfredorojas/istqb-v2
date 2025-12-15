import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { QuestionCard } from '@/components/exam/QuestionCard';
import { Timer } from '@/components/exam/Timer';
import { ProgressBar } from '@/components/exam/ProgressBar';
import { useExamStore } from '@/stores/examStore';
import { useQuestions } from '@/hooks/useQuestions';
import { useExamAttempts } from '@/hooks/useExamAttempts';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

export function ExamPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const examId = parseInt(id || '1', 10);
  
  const { data: questions, isLoading, error } = useQuestions(examId);
  
  const { user } = useAuth();
  const { saveAttempt } = useExamAttempts();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    currentQuestion,
    examStarted,
    examCompleted,
    startExam,
    nextQuestion,
    previousQuestion,
    submitExam,
    answers,
    timeRemaining,
  } = useExamStore();

  useEffect(() => {
    // Start exam when questions are loaded
    if (questions && questions.length > 0 && !examStarted && !examCompleted) {
      startExam(questions.length, 60); // 60 minutes
    }

    // Cleanup on unmount
    return () => {
      const state = useExamStore.getState();
      if (!state.examCompleted) {
        state.resetExam();
      }
    };
  }, [questions, examStarted, examCompleted]);

  const handleSubmit = async () => {
    if (!user || !questions) return;
    
    setIsSubmitting(true);
    try {
      // Calculate results
      let correctCount = 0;
      questions.forEach((q) => {
        if (answers[q.id] === q.correct_answer) {
          correctCount++;
        }
      });
      
      const score = Math.round((correctCount / questions.length) * 100);
      const passed = score >= 65;
      const timeSpent = (60 * 60) - timeRemaining; // 60 mins * 60 secs - remaining

      // Save to DB
      await saveAttempt.mutateAsync({
        user_id: user.id,
        exam_id: examId,
        answers,
        score,
        percentage: score, // Using score as percentage
        passed,
        started_at: new Date(Date.now() - timeSpent * 1000).toISOString(), // Approximate start time
        completed_at: new Date().toISOString(),
        time_spent_seconds: timeSpent,
      });

      submitExam();
      navigate(`/results/${examId}`);
    } catch (error) {
      console.error('Error saving exam:', error);
      alert('Hubo un error al guardar tu examen. Por favor intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando examen...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md px-4">
          <div className="text-error-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error al cargar el examen</h2>
          <p className="text-gray-600 mb-6">No pudimos cargar las preguntas. Por favor intenta nuevamente.</p>
          <Button onClick={() => window.location.reload()}>Reintentar</Button>
        </div>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">No hay preguntas disponibles para este examen.</p>
        </div>
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
              <Button 
                onClick={handleSubmit} 
                className="bg-success-500 hover:bg-green-600"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Enviando...' : 'Enviar Examen'}
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
