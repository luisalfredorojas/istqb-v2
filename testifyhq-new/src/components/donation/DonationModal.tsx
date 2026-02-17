import { X, Heart, Coffee } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Modal de donación que aparece cada 2 exámenes completados
 * Invita a los usuarios a donar voluntariamente si la plataforma les ha sido útil
 */
export function DonationModal({ isOpen, onClose }: DonationModalProps) {
  if (!isOpen) return null;

  const handleDonate = () => {
    window.open('/contribuye', '_self');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-surface border border-ds-border rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-in fade-in zoom-in duration-300 transition-colors">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-surface-alt transition-colors"
        >
          <X className="w-5 h-5 text-muted" />
        </button>

        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-pink-500 to-rose-500 px-6 py-8 text-center text-white">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
            <Heart className="w-8 h-8 text-white fill-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">
            ¡Gracias por practicar con nosotros!
          </h2>
          <p className="text-pink-100">
            Tu dedicación al aprendizaje es inspiradora
          </p>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <p className="text-muted text-center mb-6">
            TestifyHQ es <strong className="text-ds-text">100% gratuito</strong> para todos. Si esta plataforma te ha sido útil 
            en tu preparación para la certificación ISTQB, considera apoyarnos con una donación voluntaria.
          </p>

          <div className="bg-surface-alt rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <Coffee className="w-5 h-5 text-warning mt-0.5 flex-shrink-0" />
              <p className="text-sm text-muted">
                Tu donación nos ayuda a mantener los servidores funcionando, 
                agregar nuevas preguntas y mejorar la plataforma para todos.
              </p>
            </div>
          </div>

          {/* Botones */}
          <div className="space-y-3">
            <Button 
              onClick={handleDonate}
              className="w-full h-12"
            >
              <Heart className="w-4 h-4 mr-2" />
              Contribuir
            </Button>
            
            <button
              onClick={onClose}
              className="w-full py-3 text-sm text-muted hover:text-ds-text transition-colors"
            >
              Quizás más tarde
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <p className="text-xs text-center text-muted">
            Cualquier monto es apreciado. ¡Gracias por tu generosidad! 💜
          </p>
        </div>
      </div>
    </div>
  );
}
