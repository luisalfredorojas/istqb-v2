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
  
  // Fetch questions
  const { data: questions, isLoading: isLoadingQuestions } = useQuestions(examId);
  
  // Fetch attempt if provided
  const { data: attempt, isLoading: isLoadingAttempt } = useAttempt(attemptId);

  useEffect(() => {
    // Only redirect if NOT viewing a past attempt AND exam not completed in store
    if (!attemptId && !examCompleted) {
      navigate('/dashboard');
    }
  }, [examCompleted, navigate, attemptId]);

  if (isLoadingQuestions || (attemptId && isLoadingAttempt)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!questions) return null;

  // Determine source of truth (DB attempt or Local store)
  const attemptData = attempt as any;
  const answers = attemptData ? (attemptData.answers as Record<string, string>) : storeAnswers;
  
  // Calculate results (or use from attempt)
  const totalQuestions = questions.length;
  let correctCount = 0;

  questions.forEach((q) => {
    if (answers[q.id] === q.correct_answer) {
      correctCount++;
    }
  });

  const score = attemptData ? (attemptData.score || 0) : Math.round((correctCount / totalQuestions) * 100);
  const isPassed = score >= 65;

  const handleRetry = () => {
    resetExam();
    navigate('/exam/1');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Summary Card */}
        <Card className="mb-8 overflow-hidden">
          <div className={cn(
            "h-2 w-full",
            isPassed ? "bg-success-500" : "bg-error-500"
          )} />
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-3xl font-bold text-gray-900">
              {isPassed ? '¡Felicidades! Aprobaste' : 'No alcanzaste el puntaje necesario'}
            </CardTitle>
            <p className="text-gray-500 mt-2">
              Resumen de tu examen ISTQB Foundation
            </p>
          </CardHeader>
          <CardContent className="text-center pt-6">
            <div className="flex justify-center items-center gap-8 mb-8">
              <div className="text-center">
                <div className="text-5xl font-bold text-gray-900 mb-1">{score}%</div>
                <div className="text-sm text-gray-500 font-medium">Puntaje Final</div>
              </div>
              <div className="h-12 w-px bg-gray-200" />
              <div className="text-center">
                <div className="text-5xl font-bold text-gray-900 mb-1">
                  {correctCount}<span className="text-2xl text-gray-400">/{totalQuestions}</span>
                </div>
                <div className="text-sm text-gray-500 font-medium">Respuestas Correctas</div>
              </div>
            </div>
            
            <div className="flex justify-center gap-4">
              <Button onClick={handleRetry} variant="outline">
                Intentar Nuevamente
              </Button>
              <Link to="/dashboard">
                <Button>Volver al Dashboard</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Review */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Revisión Detallada</h2>
        <div className="space-y-6">
          {questions.map((q, index) => {
            const userAnswer = answers[q.id];
            const isCorrect = userAnswer === q.correct_answer;
            const isSkipped = !userAnswer;

            return (
              <Card key={q.id} className={cn(
                "border-l-4",
                isCorrect ? "border-l-success-500" : "border-l-error-500"
              )}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-4">
                      <div className="flex gap-2">
                        <span className="text-gray-500 font-semibold">{index + 1}.</span>
                        <div 
                          className="text-lg font-semibold text-gray-900 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1"
                          dangerouslySetInnerHTML={{ __html: q.question_text || '' }}
                        />
                      </div>
                    <span className={cn(
                      "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide",
                      isCorrect ? "bg-green-100 text-green-700" : 
                      isSkipped ? "bg-gray-100 text-gray-700" : "bg-red-100 text-red-700"
                    )}>
                      {isCorrect ? "Correcta" : isSkipped ? "Omitida" : "Incorrecta"}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Options Review */}
                  <div className="space-y-2 mt-2">
                    {q.options.map((opt) => {
                      const isSelected = userAnswer === opt.id;
                      const isTheCorrectAnswer = q.correct_answer === opt.id;
                      
                      let optionClass = "p-3 rounded-lg border flex items-center justify-between ";
                      if (isTheCorrectAnswer) {
                        optionClass += "bg-green-50 border-green-200 text-green-900";
                      } else if (isSelected && !isCorrect) {
                        optionClass += "bg-red-50 border-red-200 text-red-900";
                      } else {
                        optionClass += "bg-white border-gray-200 text-gray-600 opacity-70";
                      }

                      return (
                        <div key={opt.id} className={optionClass}>
                          <span className="flex items-center gap-3">
                            <span className="font-mono font-bold text-sm uppercase w-6">{opt.id}.</span>
                            {opt.content}
                          </span>
                          {isTheCorrectAnswer && (
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                          {isSelected && !isCorrect && (
                            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation */}
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <p className="text-sm text-blue-900 font-medium mb-1">Explicación:</p>
                    <p className="text-sm text-blue-800">{q.explanation}</p>
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
