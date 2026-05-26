import { create } from 'zustand';
import { Assignment, QuestionTypeConfig, GeneratedPaper, JobStatus } from '@/types';
import { api } from '@/lib/api';

interface FormState {
  title: string;
  subject: string;
  className: string;
  schoolName: string;
  dueDate: string;
  questionTypes: QuestionTypeConfig[];
  additionalInstructions: string;
  timeAllowed: number;
  file: File | null;
}

const defaultForm: FormState = {
  title: '',
  subject: '',
  className: '',
  schoolName: '',
  dueDate: '',
  questionTypes: [{ type: 'Multiple Choice Questions', count: 5, marksPerQuestion: 2 }],
  additionalInstructions: '',
  timeAllowed: 60,
  file: null,
};

interface AssignmentStore {
  // List
  assignments: Assignment[];
  isLoadingList: boolean;
  hasLoadedList: boolean;
  listError: string | null;
  fetchAssignments: () => Promise<void>;
  deleteAssignment: (id: string) => Promise<void>;

  // Form
  form: FormState;
  setFormField: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  addQuestionType: () => void;
  removeQuestionType: (index: number) => void;
  updateQuestionType: (index: number, field: keyof QuestionTypeConfig, value: string | number) => void;
  resetForm: () => void;

  // Creation
  isSubmitting: boolean;
  submitError: string | null;
  submitAssignment: () => Promise<string | null>;

  // Generation progress
  generationStatus: Record<string, JobStatus>;
  generationProgress: Record<string, number>;
  generationPaper: Record<string, GeneratedPaper>;
  setGenerationStatus: (id: string, status: JobStatus, progress?: number) => void;
  setGeneratedPaper: (id: string, paper: GeneratedPaper) => void;
}

export const useAssignmentStore = create<AssignmentStore>((set, get) => ({
  assignments: [],
  isLoadingList: false,
  hasLoadedList: false,
  listError: null,

  fetchAssignments: async () => {
    if (get().isLoadingList) return;
    set({ isLoadingList: true, listError: null });
    try {
      const data = await api.getAssignments();
      set({ assignments: data, isLoadingList: false, hasLoadedList: true });
    } catch (err) {
      set({ listError: (err as Error).message, isLoadingList: false, hasLoadedList: true });
    }
  },

  deleteAssignment: async (id) => {
    await api.deleteAssignment(id);
    set((s) => ({ assignments: s.assignments.filter((a) => a._id !== id) }));
  },

  form: { ...defaultForm },

  setFormField: (key, value) =>
    set((s) => ({ form: { ...s.form, [key]: value } })),

  addQuestionType: () =>
    set((s) => ({
      form: {
        ...s.form,
        questionTypes: [
          ...s.form.questionTypes,
          { type: 'Short Questions', count: 3, marksPerQuestion: 2 },
        ],
      },
    })),

  removeQuestionType: (index) =>
    set((s) => ({
      form: {
        ...s.form,
        questionTypes: s.form.questionTypes.filter((_, i) => i !== index),
      },
    })),

  updateQuestionType: (index, field, value) =>
    set((s) => ({
      form: {
        ...s.form,
        questionTypes: s.form.questionTypes.map((qt, i) =>
          i === index ? { ...qt, [field]: value } : qt
        ),
      },
    })),

  resetForm: () => set({ form: { ...defaultForm } }),

  isSubmitting: false,
  submitError: null,

  submitAssignment: async () => {
    const { form } = get();
    set({ isSubmitting: true, submitError: null });
    try {
      const result = await api.createAssignment(
        {
          title: form.title,
          subject: form.subject,
          className: form.className,
          schoolName: form.schoolName,
          dueDate: form.dueDate,
          questionTypes: form.questionTypes,
          additionalInstructions: form.additionalInstructions,
          timeAllowed: form.timeAllowed,
        },
        form.file || undefined
      );
      set({ isSubmitting: false });
      return result._id;
    } catch (err) {
      set({ submitError: (err as Error).message, isSubmitting: false });
      return null;
    }
  },

  generationStatus: {},
  generationProgress: {},
  generationPaper: {},

  setGenerationStatus: (id, status, progress) =>
    set((s) => ({
      generationStatus: { ...s.generationStatus, [id]: status },
      generationProgress: { ...s.generationProgress, [id]: progress ?? s.generationProgress[id] ?? 0 },
    })),

  setGeneratedPaper: (id, paper) =>
    set((s) => ({
      generationPaper: { ...s.generationPaper, [id]: paper },
    })),
}));
