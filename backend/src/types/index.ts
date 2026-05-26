export type Difficulty = 'easy' | 'moderate' | 'challenging';

export type QuestionTypeName =
  | 'Multiple Choice Questions'
  | 'Short Questions'
  | 'Diagram/Graph-Based Questions'
  | 'Numerical Problems'
  | 'Long Answer Questions'
  | string;

export interface QuestionTypeConfig {
  type: QuestionTypeName;
  count: number;
  marksPerQuestion: number;
}

export interface CreateAssignmentDTO {
  title: string;
  subject: string;
  className: string;
  schoolName: string;
  dueDate: string;
  questionTypes: QuestionTypeConfig[];
  additionalInstructions?: string;
  timeAllowed?: number; // minutes
}

export interface GeneratedQuestion {
  id: string;
  text: string;
  difficulty: Difficulty;
  marks: number;
  type: QuestionTypeName;
  answer?: string;
}

export interface GeneratedSection {
  label: string; // "Section A", "Section B", etc.
  title: string; // "Short Answer Questions"
  instruction: string;
  questionType: QuestionTypeName;
  questions: GeneratedQuestion[];
  totalMarks: number;
}

export interface GeneratedPaper {
  sections: GeneratedSection[];
  totalQuestions: number;
  totalMarks: number;
  timeAllowed: number;
  aiMessage: string;
}

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface WsMessage {
  type: 'job_update' | 'job_completed' | 'job_failed';
  assignmentId: string;
  status: JobStatus;
  progress?: number;
  data?: GeneratedPaper;
  error?: string;
}
