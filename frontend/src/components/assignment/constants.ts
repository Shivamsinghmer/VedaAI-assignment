export const QUESTION_TYPE_OPTIONS = [
  'Multiple Choice Questions',
  'Short Questions',
  'Diagram/Graph-Based Questions',
  'Numerical Problems',
  'Long Answer Questions',
];

export const DIFFICULTY_CONFIG = {
  easy: {
    label: 'Easy',
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
    dot: 'bg-green-500',
  },
  moderate: {
    label: 'Moderate',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
  },
  challenging: {
    label: 'Challenging',
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    dot: 'bg-red-500',
  },
} as const;
