import { create } from 'zustand';

interface ExamState {
  // State
  currentQuestion: number;
  answers: Record<string, string>; // questionId -> selectedAnswer
  timeRemaining: number;
  examStarted: boolean;
  examCompleted: boolean;
  totalQuestions: number;
  
  // Actions
  setAnswer: (questionId: string, answer: string) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  goToQuestion: (index: number) => void;
  startExam: (totalQuestions: number, duration: number) => void;
  submitExam: () => void;
  resetExam: () => void;
  decrementTime: () => void;
  
  // Computed
  getProgress: () => number;
  getAnsweredCount: () => number;
}

export const useExamStore = create<ExamState>()((set, get) => ({
  // Initial state
  currentQuestion: 0,
  answers: {},
  timeRemaining: 0,
  examStarted: false,
  examCompleted: false,
  totalQuestions: 0,
  
  // Actions
  setAnswer: (questionId, answer) =>
    set((state) => ({
      answers: { ...state.answers, [questionId]: answer },
    })),
  
  nextQuestion: () =>
    set((state) => ({
      currentQuestion: Math.min(state.currentQuestion + 1, state.totalQuestions - 1),
    })),
  
  previousQuestion: () =>
    set((state) => ({
      currentQuestion: Math.max(state.currentQuestion - 1, 0),
    })),
  
  goToQuestion: (index) =>
    set({ currentQuestion: index }),
  
  startExam: (totalQuestions, duration) =>
    set({
      examStarted: true,
      examCompleted: false,
      totalQuestions,
      timeRemaining: duration * 60, // Convert minutes to seconds
      currentQuestion: 0,
      answers: {},
    }),
  
  submitExam: () =>
    set({ examCompleted: true, examStarted: false }),
  
  resetExam: () =>
    set({
      currentQuestion: 0,
      answers: {},
      timeRemaining: 0,
      examStarted: false,
      examCompleted: false,
      totalQuestions: 0,
    }),
  
  decrementTime: () =>
    set((state) => {
      const newTime = Math.max(state.timeRemaining - 1, 0);
      if (newTime === 0 && state.examStarted) {
        // Auto-submit when time runs out
        return { timeRemaining: 0, examCompleted: true, examStarted: false };
      }
      return { timeRemaining: newTime };
    }),
  
  // Computed
  getProgress: () => {
    const state = get();
    return state.totalQuestions > 0
      ? Math.round((state.currentQuestion + 1) / state.totalQuestions * 100)
      : 0;
  },
  
  getAnsweredCount: () => {
    const state = get();
    return Object.keys(state.answers).length;
  },
}));
