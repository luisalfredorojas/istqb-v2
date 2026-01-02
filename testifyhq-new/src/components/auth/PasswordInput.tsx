import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getPasswordStrength } from '@/utils/validation';

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  showStrength?: boolean;
  disabled?: boolean;
  autoComplete?: string;
}

export function PasswordInput({
  value,
  onChange,
  placeholder = 'Contraseña',
  showStrength = false,
  disabled = false,
  autoComplete = 'current-password',
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const strength = showStrength && value ? getPasswordStrength(value) : null;

  const getStrengthColor = () => {
    if (!strength) return 'bg-gray-200';
    switch (strength.level) {
      case 'weak':
        return 'bg-red-500';
      case 'medium':
        return 'bg-orange-500';
      case 'strong':
        return 'bg-green-500';
      default:
        return 'bg-gray-200';
    }
  };

  const getStrengthText = () => {
    if (!strength) return '';
    switch (strength.level) {
      case 'weak':
        return 'Débil';
      case 'medium':
        return 'Media';
      case 'strong':
        return 'Fuerte';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <Input
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          className="pr-10"
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
          onClick={() => setShowPassword(!showPassword)}
          disabled={disabled}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4 text-gray-400" />
          ) : (
            <Eye className="h-4 w-4 text-gray-400" />
          )}
        </Button>
      </div>

      {showStrength && value && (
        <div className="space-y-1">
          <div className="flex gap-1">
            {[...Array(7)].map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  i < (strength?.score || 0) ? getStrengthColor() : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-gray-600">
            Fortaleza: <span className="font-medium">{getStrengthText()}</span>
          </p>
        </div>
      )}
    </div>
  );
}
