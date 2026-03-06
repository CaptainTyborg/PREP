import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Question } from "@shared/schema";

interface ExamState {
  isActive: boolean;
  examType: "mock" | "practice";
  subjects: string[];
  questions: Record<string, Question[]>;
  answers: Record<string, string>;
  flagged: Record<string, boolean>;
  currentSubject: string;
  currentQuestionIndex: number;
  timeRemaining: number; // in seconds
  
  // Actions
  startExam: (type: "mock" | "practice", subjects: string[], questions: Record<string, Question[]>, durationSeconds: number) => void;
  setAnswer: (questionId: string, answer: string) => void;
  toggleFlag: (questionId: string) => void;
  setCurrentSubject: (subject: string) => void;
  setCurrentQuestion: (index: number) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  tickTimer: () => void;
  endExam: () => void;
}

export const useExamStore = create<ExamState>()(
  persist(
    (set, get) => ({
      isActive: false,
      examType: "mock",
      subjects: [],
      questions: {},
      answers: {},
      flagged: {},
      currentSubject: "",
      currentQuestionIndex: 0,
      timeRemaining: 0,

      startExam: (type, subjects, questions, durationSeconds) => set({
        isActive: true,
        examType: type,
        subjects,
        questions,
        answers: {},
        flagged: {},
        currentSubject: subjects[0] || "",
        currentQuestionIndex: 0,
        timeRemaining: durationSeconds,
      }),

      setAnswer: (questionId, answer) => set((state) => ({
        answers: { ...state.answers, [questionId]: answer }
      })),

      toggleFlag: (questionId) => set((state) => ({
        flagged: { ...state.flagged, [questionId]: !state.flagged[questionId] }
      })),

      setCurrentSubject: (subject) => set({
        currentSubject: subject,
        currentQuestionIndex: 0,
      }),

      setCurrentQuestion: (index) => set({
        currentQuestionIndex: index,
      }),

      nextQuestion: () => {
        const { currentSubject, currentQuestionIndex, questions } = get();
        const subjectQuestions = questions[currentSubject] || [];
        if (currentQuestionIndex < subjectQuestions.length - 1) {
          set({ currentQuestionIndex: currentQuestionIndex + 1 });
        }
      },

      prevQuestion: () => {
        const { currentQuestionIndex } = get();
        if (currentQuestionIndex > 0) {
          set({ currentQuestionIndex: currentQuestionIndex - 1 });
        }
      },

      tickTimer: () => set((state) => {
        if (state.timeRemaining <= 0) return state;
        return { timeRemaining: state.timeRemaining - 1 };
      }),

      endExam: () => set({ isActive: false }),
    }),
    {
      name: "prep-exam-storage",
      partialize: (state) => ({
        isActive: state.isActive,
        examType: state.examType,
        subjects: state.subjects,
        questions: state.questions,
        answers: state.answers,
        flagged: state.flagged,
        currentSubject: state.currentSubject,
        currentQuestionIndex: state.currentQuestionIndex,
        timeRemaining: state.timeRemaining,
      }),
    }
  )
);
