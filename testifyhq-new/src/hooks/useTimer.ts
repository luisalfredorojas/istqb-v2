import { useEffect } from 'react';
import { useExamStore } from '@/stores/examStore';

export function useTimer() {
  const { timeRemaining, examStarted, decrementTime } = useExamStore();

  useEffect(() => {
    if (!examStarted || timeRemaining <= 0) {
      return;
    }

    const interval = setInterval(() => {
      decrementTime();
    }, 1000);

    return () => clearInterval(interval);
  }, [examStarted, timeRemaining, decrementTime]);

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    timeRemaining,
    formattedTime: formatTime(timeRemaining),
    isLowTime: timeRemaining < 300 && timeRemaining > 60, // Less than 5 min

    isCriticalTime: timeRemaining <= 60, // Less than 1 min
  };
}
