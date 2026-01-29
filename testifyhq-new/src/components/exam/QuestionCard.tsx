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

  // Robust options handling
  let options: any[] = [];
  const rawOptions = question.options as any;
  
  if (Array.isArray(rawOptions)) {
    options = rawOptions;
  } else if (typeof rawOptions === 'string') {
    try {
      options = JSON.parse(rawOptions);
    } catch (e) {
      console.error('Error parsing options:', e);
    }
  }

  const handleSelectAnswer = (optionId: string) => {
    setAnswer(question.id, optionId);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">
          Pregunta {questionNumber}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Question Text/Image */}
        <div className="space-y-4">
          {question.question_text && (
            <div 
              className="text-lg text-gray-800 leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1"
              dangerouslySetInnerHTML={{ __html: question.question_text }}
            />
          )}
          {question.question_image_url && (
            <img
              src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/exam-images/foundation-level/${question.question_image_url.split('/').pop()}`}
              alt={question.question_image_alt || 'Imagen de la pregunta'}
              className="max-w-full h-auto rounded-lg border border-gray-200"
              onError={(e) => console.error('Error loading image:', e.currentTarget.src)}
            />
          )}
        </div>

        {/* Answer Options */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-700">
            Selecciona una respuesta:
          </p>
          <div className="space-y-2">
            {options.length > 0 ? (
              options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleSelectAnswer(option.id)}
                  className={cn(
                    'w-full p-4 text-left rounded-lg border-2 transition-all',
                    selectedAnswer === option.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        'w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5',
                        selectedAnswer === option.id
                          ? 'border-blue-600 bg-blue-600'
                          : 'border-gray-300'
                      )}
                    >
                      {selectedAnswer === option.id && (
                        <div className="w-full h-full rounded-full bg-white scale-50" />
                      )}
                    </div>
                    <div className="flex-1">
                      {option.type === 'text' && option.content && (
                        <span className="text-gray-800">{option.content}</span>
                      )}
                      {option.type === 'image' && option.image_url && (
                        <img
                          src={option.image_url}
                          alt={option.alt || `Opción ${option.id}`}
                          className="max-w-md h-auto rounded border border-gray-200"
                        />
                      )}
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="text-red-500">Error: Opciones no válidas (Raw: {JSON.stringify(question.options)})</div>
            )}
          </div>
        </div>

        {/* Video Suggestion */}
        {question.explanation_video_url && (
          <div className="mt-8 pt-6 border-t border-gray-100 animate-in fade-in duration-500">
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-blue-900 mb-2">
                <Youtube className="w-4 h-4 text-red-600" />
                ¿Necesitas ayuda con esta pregunta?
              </h3>
              <p className="text-sm text-blue-800 mb-3">
                Mira este video corto donde explico este concepto a detalle:
              </p>
              <a 
                href={question.explanation_video_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-blue-200 rounded-md text-sm font-medium text-blue-700 hover:bg-blue-50 hover:text-blue-800 transition-colors shadow-sm group"
              >
                <Youtube className="w-5 h-5 text-red-600 group-hover:scale-110 transition-transform" />
                Ver explicación en YouTube
              </a>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
