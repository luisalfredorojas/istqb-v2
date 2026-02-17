import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Youtube } from 'lucide-react';
import { useExamStore } from '@/stores/examStore';
import type { Question } from '@/types';
import { cn } from '@/lib/utils';

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
}

export function QuestionCard({ question, questionNumber }: QuestionCardProps) {
  const { answers, setAnswer } = useExamStore();
  const selectedAnswer = answers[question.id];

  let options: any[] = [];
  const rawOptions = question.options as any;
  if (Array.isArray(rawOptions)) {
    options = rawOptions;
  } else if (typeof rawOptions === 'string') {
    try { options = JSON.parse(rawOptions); } catch (e) { console.error('Error parsing options:', e); }
  }

  const handleSelectAnswer = (optionId: string) => {
    setAnswer(question.id, optionId);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Pregunta {questionNumber}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {question.question_text && (
            <div
              className="text-base text-ds-text leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1"
              dangerouslySetInnerHTML={{ __html: question.question_text }}
            />
          )}
          {question.question_image_url && (
            <img
              src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/exam-images/foundation-level/${question.question_image_url.split('/').pop()}`}
              alt={question.question_image_alt || 'Imagen de la pregunta'}
              className="max-w-full h-auto rounded-[8px] border border-ds-border"
              onError={(e) => console.error('Error loading image:', e.currentTarget.src)}
            />
          )}
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium text-muted">Selecciona una respuesta:</p>
          <div className="space-y-2" role="radiogroup" aria-label="Opciones de respuesta">
            {options.length > 0 ? (
              options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleSelectAnswer(option.id)}
                  role="radio"
                  aria-checked={selectedAnswer === option.id}
                  className={cn(
                    'w-full p-4 text-left rounded-[8px] border-2 transition-all min-h-[44px]',
                    selectedAnswer === option.id
                      ? 'border-primary bg-primary-soft'
                      : 'border-ds-border hover:border-ds-border-hover hover:bg-bg'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        'w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 transition-colors',
                        selectedAnswer === option.id
                          ? 'border-primary bg-primary'
                          : 'border-ds-border-hover'
                      )}
                    >
                      {selectedAnswer === option.id && (
                        <div className="w-full h-full rounded-full bg-white scale-50" />
                      )}
                    </div>
                    <div className="flex-1">
                      {option.type === 'text' && option.content && (
                        <span className="text-ds-text">{option.content}</span>
                      )}
                      {option.type === 'image' && option.image_url && (
                        <img src={option.image_url} alt={option.alt || `Opción ${option.id}`} className="max-w-md h-auto rounded-[8px] border border-ds-border" />
                      )}
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="text-danger">Error: Opciones no válidas (Raw: {JSON.stringify(question.options)})</div>
            )}
          </div>
        </div>

        {question.explanation_video_url && (
          <div className="mt-8 pt-6 border-t border-ds-border animate-in fade-in duration-500">
            <div className="bg-primary-soft border border-primary-soft-border rounded-[8px] p-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-primary mb-2">
                <Youtube className="w-4 h-4 text-danger" />
                ¿Necesitas ayuda con esta pregunta?
              </h3>
              <p className="text-sm text-ds-text mb-3">
                Mira este video corto donde explico este concepto a detalle:
              </p>
              <a
                href={question.explanation_video_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-surface border border-ds-border rounded-[8px] text-sm font-medium text-primary hover:bg-bg transition-colors group"
              >
                <Youtube className="w-5 h-5 text-danger group-hover:scale-110 transition-transform" />
                Ver explicación en YouTube
              </a>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
