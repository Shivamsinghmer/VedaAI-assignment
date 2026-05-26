import mongoose, { Schema, Document } from 'mongoose';
import { QuestionTypeConfig, JobStatus, GeneratedPaper } from '../types';

export interface IAssignment extends Document {
  title: string;
  subject: string;
  className: string;
  schoolName: string;
  dueDate: Date;
  questionTypes: QuestionTypeConfig[];
  additionalInstructions?: string;
  timeAllowed: number;
  uploadedFilePath?: string;
  uploadedFileText?: string;
  status: JobStatus;
  jobId?: string;
  generatedPaper?: GeneratedPaper;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionTypeConfigSchema = new Schema<QuestionTypeConfig>(
  {
    type: { type: String, required: true },
    count: { type: Number, required: true, min: 1 },
    marksPerQuestion: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const AssignmentSchema = new Schema<IAssignment>(
  {
    title: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    className: { type: String, required: true, trim: true },
    schoolName: { type: String, required: true, trim: true },
    dueDate: { type: Date, required: true },
    questionTypes: { type: [QuestionTypeConfigSchema], required: true },
    additionalInstructions: { type: String },
    timeAllowed: { type: Number, default: 60 },
    uploadedFilePath: { type: String },
    uploadedFileText: { type: String },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    jobId: { type: String },
    generatedPaper: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export default mongoose.model<IAssignment>('Assignment', AssignmentSchema);
