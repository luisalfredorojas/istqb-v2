import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
            <p className="text-lg text-gray-800 leading-relaxed">
              {question.question_text}
            </p>
          )}
          {question.question_image_url && (
            <img
              src={question.question_image_url}
              alt={question.question_image_alt || 'Imagen de la pregunta'}
              className="max-w-full h-auto rounded-lg border border-gray-200"
            />
          )}
        </div>

        {/* Answer Options */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-700">
            Selecciona una respuesta:
          </p>
          <div className="space-y-2">
            {question.options.map((option) => (
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
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
