import { create } from 'zustand';
import api from '../services/api';

const useExamStore = create((set, get) => ({
  // ── Exam session state ─────────────────────────
  session: null,
  questions: [],
  currentIndex: 0,
  answers: {},         // { questionId: 'A' }
  remainingMs: 0,
  violationCount: 0,
  showViolationModal: false,
  isLoading: false,
  isSubmitting: false,

  // ── Actions ────────────────────────────────────
  setSession: (session) => set({ session }),
  setQuestions: (questions) => set({ questions }),
  setCurrentIndex: (index) => set({ currentIndex: index }),
  setRemainingMs: (ms) => set({ remainingMs: ms }),
  setViolationCount: (count) => set({ violationCount: count }),
  setShowViolationModal: (show) => set({ showViolationModal: show }),

  startExam: async (examId) => {
    set({ isLoading: true });
    try {
      const res = await api.post('/exam/start', { examId });
      const { session, remainingMs } = res.data;
      set({ session, remainingMs });
      return { success: true, data: res.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Gagal memulai ujian.' };
    } finally {
      set({ isLoading: false });
    }
  },

  loadQuestions: async (examId) => {
    set({ isLoading: true });
    try {
      const res = await api.get(`/exam/questions/${examId}`);
      const { session, questions } = res.data;
      // Restore previous answers from session
      set({
        questions,
        answers: session.jawaban_peserta || {},
        violationCount: session.jumlah_pelanggaran || 0,
      });
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Gagal memuat soal.' };
    } finally {
      set({ isLoading: false });
    }
  },

  saveAnswer: async (questionId, jawaban) => {
    const { session, answers } = get();
    if (!session || session.status === 'SUBMITTED') return;

    // Optimistic update
    set({ answers: { ...answers, [questionId]: jawaban } });

    try {
      await api.patch('/exam/save-answer', {
        sessionId: session.id,
        questionId,
        jawaban,
      });
    } catch (err) {
      console.error('saveAnswer failed:', err);
    }
  },

  finishExam: async () => {
    const { session } = get();
    if (!session) return { success: false };
    set({ isSubmitting: true });
    try {
      const res = await api.post('/exam/finish', { sessionId: session.id });
      return { success: true, data: res.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Gagal mengumpulkan jawaban.' };
    } finally {
      set({ isSubmitting: false });
    }
  },

  incrementViolation: (total) => {
    set({ violationCount: total, showViolationModal: true });
  },

  dismissViolationModal: () => {
    set({ showViolationModal: false });
  },

  resetExam: () => {
    set({
      session: null, questions: [], currentIndex: 0,
      answers: {}, remainingMs: 0, violationCount: 0,
      showViolationModal: false, isLoading: false, isSubmitting: false,
    });
  },
}));

export default useExamStore;
