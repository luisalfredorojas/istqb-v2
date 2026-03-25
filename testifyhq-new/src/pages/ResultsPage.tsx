import { useEffect, useState } from 'react';
import { useNavigate, Link, useParams, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useExamStore } from '@/stores/examStore';
import { useQuestions } from '@/hooks/useQuestions';
import { useAttempt } from '@/hooks/useExamAttempts';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

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
        <ReviewList questions={questions} answers={answers} />
      </div>
    </div>
  );
}

function ReviewList({ questions, answers }: { questions: any[]; answers: Record<string, string> }) {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggle = (id: string) => setOpenId(prev => prev === id ? null : id);

  return (
    <div className="space-y-3">
      {questions.map((q, index) => {
        const userAnswer = answers[q.id];
        const isCorrect = userAnswer === q.correct_answer;
        const isSkipped = !userAnswer;
        const isOpen = openId === q.id;

        return (
          <Card key={q.id} className={cn("border-l-4 overflow-hidden", isCorrect ? "border-l-success" : "border-l-danger")}>
            <button
              onClick={() => toggle(q.id)}
              className="w-full text-left px-6 py-4 flex items-center justify-between gap-4 hover:bg-surface-alt/50 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-muted font-semibold flex-shrink-0">{index + 1}.</span>
                <span className="text-sm text-ds-text truncate">
                  {(q.question_text || '').replace(/<[^>]*>/g, '').slice(0, 80)}
                  {(q.question_text || '').replace(/<[^>]*>/g, '').length > 80 ? '...' : ''}
                </span>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className={cn(
                  "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide whitespace-nowrap",
                  isCorrect ? "bg-success-soft text-success" :
                  isSkipped ? "bg-surface-alt text-muted" : "bg-danger-soft text-danger"
                )}>
                  {isCorrect ? "Correcta" : isSkipped ? "Omitida" : "Incorrecta"}
                </span>
                <ChevronDown className={cn(
                  "w-5 h-5 text-muted transition-transform duration-200",
                  isOpen && "rotate-180"
                )} />
              </div>
            </button>

            {isOpen && (
              <CardContent className="pt-0 pb-6 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="border-t border-ds-border pt-4 space-y-4">
                  <div
                    className="text-sm text-ds-text leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:pl-5 [&_li]:mb-1 [&_table]:w-full [&_table]:border-collapse [&_th]:border [&_th]:border-ds-border [&_th]:p-2 [&_th]:bg-surface [&_td]:border [&_td]:border-ds-border [&_td]:p-2"
                    dangerouslySetInnerHTML={{ __html: q.question_text || '' }}
                  />

                  <div className="space-y-2">
                    {q.options.map((opt: any) => {
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

                  {q.explanation && (
                    <div className="p-4 bg-primary-soft rounded-[8px] border border-primary-soft-border">
                      <p className="text-sm text-primary font-medium mb-1">Explicación:</p>
                      <p className="text-sm text-ds-text">{q.explanation}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
