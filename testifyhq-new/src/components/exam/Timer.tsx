import { useTimer } from '@/hooks/useTimer';
import { cn } from '@/lib/utils';

export function Timer() {
  const { formattedTime, isLowTime, isCriticalTime } = useTimer();

  return (
    <div className="flex items-center gap-2">
      <svg
        className={cn(
          'w-5 h-5',
          isCriticalTime && 'text-error-500 animate-pulse',
          isLowTime && !isCriticalTime && 'text-warning-500'
        )}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span
        className={cn(
          'text-lg font-semibold',
          isCriticalTime && 'text-error-500',
          isLowTime && !isCriticalTime && 'text-warning-500',
          !isLowTime && !isCriticalTime && 'text-gray-700'
        )}
      >
        {formattedTime}
      </span>
    </div>
  );
}
