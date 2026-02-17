import { useEffect } from 'react';
import { useNavigate, Link, useParams, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useExamStore } from '@/stores/examStore';
import { useQuestions } from '@/hooks/useQuestions';
import { useAttempt } from '@/hooks/useExamAttempts';
import { cn } from '@/lib/utils';

export function ResultsPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const attemptId = searchParams.get('attemptId');
  const navigate = useNavigate();
  const examId = parseInt(id || '1', 10);

  const { answers: storeAnswers, examCompleted, resetExam } = useExamStore();
  const { data: questions, isLoading: isLoadingQuestions } = useQuestions(examId);
  const { data: attempt, isLoading: isLoadingAttempt } = useAttempt(attemptId);

  useEffect(() => {
    if (!attemptId && !examCompleted) navigate('/dashboard');
  }, [examCompleted, navigate, attemptId]);

  if (isLoadingQuestions || (attemptId && isLoadingAttempt)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-ds-border border-t-primary"></div>
      </div>
    );
  }

  if (!questions) return null;

  const attemptData = attempt as any;
  const answers = attemptData ? (attemptData.answers as Record<string, string>) : storeAnswers;
  const totalQuestions = questions.length;
  let correctCount = 0;
  questions.forEach((q) => { if (answers[q.id] === q.correct_answer) correctCount++; });
  const score = attemptData ? (attemptData.score || 0) : Math.round((correctCount / totalQuestions) * 100);
  const isPassed = score >= 65;

  const handleRetry = () => { resetExam(); navigate('/exam/1'); };

  return (
    <div className="min-h-screen bg-bg py-12 px-4 transition-colors">
      <div className="container mx-auto max-w-4xl">
        <Card className="mb-8 overflow-hidden">
          <div className={cn("h-1.5 w-full", isPassed ? "bg-success" : "bg-danger")} />
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-bold">
              {isPassed ? '¡Felicidades! Aprobaste' : 'No alcanzaste el puntaje necesario'}
            </CardTitle>
            <p className="text-muted mt-2 text-sm">Resumen de tu examen ISTQB Foundation</p>
          </CardHeader>
          <CardContent className="text-center pt-6">
            <div className="flex justify-center items-center gap-8 mb-8">
              <div className="text-center">
                <div className={cn("text-5xl font-bold mb-1 tabular-nums", isPassed ? "text-success" : "text-danger")}>{score}%</div>
                <div className="text-sm text-muted font-medium">Puntaje Final</div>
              </div>
              <div className="h-12 w-px bg-ds-border" />
              <div className="text-center">
                <div className="text-5xl font-bold text-ds-text mb-1 tabular-nums">
                  {correctCount}<span className="text-2xl text-muted">/{totalQuestions}</span>
                </div>
                <div className="text-sm text-muted font-medium">Respuestas Correctas</div>
              </div>
            </div>
            <div className="flex justify-center gap-4">
              <Button onClick={handleRetry} variant="outline">Intentar Nuevamente</Button>
              <Link to="/dashboard"><Button>Volver al Dashboard</Button></Link>
            </div>
          </CardContent>
        </Card>

        <h2 className="text-xl font-bold text-ds-text mb-6">Revisión Detallada</h2>
        <div className="space-y-6">
          {questions.map((q, index) => {
            const userAnswer = answers[q.id];
            const isCorrect = userAnswer === q.correct_answer;
            const isSkipped = !userAnswer;

            return (
              <Card key={q.id} className={cn("border-l-4", isCorrect ? "border-l-success" : "border-l-danger")}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-2">
                      <span className="text-muted font-semibold">{index + 1}.</span>
                      <div className="text-base font-semibold text-ds-text [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1"
                        dangerouslySetInnerHTML={{ __html: q.question_text || '' }}
                      />
                    </div>
                    <span className={cn(
                      "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide whitespace-nowrap",
                      isCorrect ? "bg-success-soft text-success" :
                      isSkipped ? "bg-surface-alt text-muted" : "bg-danger-soft text-danger"
                    )}>
                      {isCorrect ? "Correcta" : isSkipped ? "Omitida" : "Incorrecta"}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mt-2">
                    {q.options.map((opt) => {
                      const isSelected = userAnswer === opt.id;
                      const isTheCorrectAnswer = q.correct_answer === opt.id;
                      return (
                        <div key={opt.id} className={cn(
                          "p-3 rounded-[8px] border flex items-center justify-between transition-colors",
                          isTheCorrectAnswer && "bg-success-soft border-success text-ds-text",
                          isSelected && !isCorrect && "bg-danger-soft border-danger text-ds-text",
                          !isTheCorrectAnswer && !isSelected && "bg-surface border-ds-border text-muted"
                        )}>
                          <span className="flex items-center gap-3">
                            <span className="font-mono font-bold text-sm uppercase w-6">{opt.id}.</span>
                            {opt.content}
                          </span>
                          {isTheCorrectAnswer && (
                            <svg className="w-5 h-5 text-success flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                          {isSelected && !isCorrect && (
                            <svg className="w-5 h-5 text-danger flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-4 p-4 bg-primary-soft rounded-[8px] border border-primary-soft-border">
                    <p className="text-sm text-primary font-medium mb-1">Explicación:</p>
                    <p className="text-sm text-ds-text">{q.explanation}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
