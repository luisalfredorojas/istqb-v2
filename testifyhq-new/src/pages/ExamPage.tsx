import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { QuestionCard } from '@/components/exam/QuestionCard';
import { Timer } from '@/components/exam/Timer';
import { ProgressBar } from '@/components/exam/ProgressBar';
import { useExamStore } from '@/stores/examStore';
import { useQuestions } from '@/hooks/useQuestions';
import { useExamAttempts } from '@/hooks/useExamAttempts';
import { useAuth } from '@/hooks/useAuth';
import { useDonationPrompt } from '@/hooks/useDonationPrompt';
import { DonationModal } from '@/components/donation/DonationModal';
import { cn } from '@/lib/utils';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export function ExamPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const examId = parseInt(id || '1', 10);
  const { data: questions, isLoading, error } = useQuestions(examId);
  const initialized = useRef(false);
  const { user } = useAuth();
  const { saveAttempt } = useExamAttempts();
  const { shouldShowPrompt, incrementExamCount, dismissPrompt } = useDonationPrompt();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDonationModal, setShowDonationModal] = useState(false);

  const {
    currentQuestion, examStarted, examCompleted, startExam, nextQuestion,
    previousQuestion, submitExam, answers, timeRemaining,
  } = useExamStore();

  useEffect(() => {
    const state = useExamStore.getState();
    if (!state.examStarted || state.examCompleted) state.resetExam();
  }, []);

  useEffect(() => {
    return () => { const state = useExamStore.getState(); if (!state.examCompleted) state.resetExam(); };
  }, []);

  useEffect(() => {
    if (questions && questions.length > 0 && !initialized.current && !examStarted && !examCompleted) {
      startExam(questions.length, 60);
      initialized.current = true;
    }
  }, [questions, examStarted, examCompleted, startExam]);

  const handleSubmit = async () => {
    if (!user || !questions) return;
    setIsSubmitting(true);
    try {
      let correctCount = 0;
      questions.forEach((q) => { if (answers[q.id] === q.correct_answer) correctCount++; });
      const score = Math.round((correctCount / questions.length) * 100);
      const passed = score >= 65;
      const timeSpent = (60 * 60) - timeRemaining;

      await saveAttempt.mutateAsync({
        user_id: user.id, exam_id: examId, answers, score, percentage: score,
        passed, started_at: new Date(Date.now() - timeSpent * 1000).toISOString(),
        completed_at: new Date().toISOString(), time_spent_seconds: timeSpent,
      });

      submitExam();
      incrementExamCount();
      if (shouldShowPrompt) { setShowDonationModal(true); }
      else { navigate(`/results/${examId}`); }
    } catch (error) {
      console.error('Error saving exam:', error);
      alert('Hubo un error al guardar tu examen. Por favor intenta de nuevo.');
    } finally { setIsSubmitting(false); }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-ds-border border-t-primary mx-auto mb-4"></div>
          <p className="text-muted">Cargando examen...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="text-center max-w-md px-4">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-ds-text mb-2">Error al cargar el examen</h2>
          <p className="text-muted mb-6">No pudimos cargar las preguntas. Por favor intenta nuevamente.</p>
          <Button onClick={() => window.location.reload()}>Reintentar</Button>
        </div>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <p className="text-muted">No hay preguntas disponibles para este examen.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg py-8 transition-colors">
      <ErrorBoundary>
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-surface rounded-[12px] border border-ds-border p-6 mb-6 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-semibold text-ds-text">Examen ISTQB Foundation</h1>
              <Timer />
            </div>
            <ProgressBar />
          </div>

          <div className="mb-6">
            {questions[currentQuestion] ? (
              <QuestionCard question={questions[currentQuestion]} questionNumber={currentQuestion + 1} />
            ) : (
              <div className="p-4 text-center text-danger">Error: Pregunta no encontrada (Índice: {currentQuestion})</div>
            )}
          </div>

          <div className="flex items-center justify-between bg-surface rounded-[12px] border border-ds-border p-6 transition-colors">
            <Button onClick={previousQuestion} disabled={currentQuestion === 0} variant="outline">← Anterior</Button>
            <div className="flex gap-3">
              {currentQuestion === questions.length - 1 ? (
                <Button onClick={handleSubmit} className="bg-success hover:opacity-90 text-white" disabled={isSubmitting}>
                  {isSubmitting ? 'Enviando...' : 'Enviar Examen'}
                </Button>
              ) : (
                <Button onClick={nextQuestion}>Siguiente →</Button>
              )}
            </div>
          </div>

          <div className="mt-6 bg-surface rounded-[12px] border border-ds-border p-6 transition-colors">
            <h3 className="text-sm font-semibold text-ds-text mb-3">Navegación rápida:</h3>
            <div className="grid grid-cols-10 gap-2">
              {questions.map((q, index) => {
                const isAnswered = !!answers[q.id];
                const isCurrent = index === currentQuestion;
                return (
                  <button
                    key={q.id}
                    onClick={() => useExamStore.getState().goToQuestion(index)}
                    disabled={examCompleted}
                    aria-label={`Pregunta ${index + 1}${isAnswered ? ', respondida' : ''}${isCurrent ? ', actual' : ''}`}
                    className={cn(
                      'w-10 h-10 rounded-[8px] border-2 font-medium text-sm transition-all',
                      isCurrent && 'border-primary bg-primary-soft text-primary',
                      !isCurrent && isAnswered && 'border-success bg-success-soft text-success',
                      !isCurrent && !isAnswered && 'border-ds-border text-muted hover:border-ds-border-hover'
                    )}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </ErrorBoundary>

      <DonationModal
        isOpen={showDonationModal}
        onClose={() => { dismissPrompt(); setShowDonationModal(false); navigate(`/results/${examId}`); }}
      />
    </div>
  );
}
