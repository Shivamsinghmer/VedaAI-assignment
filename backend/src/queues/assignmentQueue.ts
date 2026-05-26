import { Queue } from 'bullmq';
import { redis } from '../services/redis';

export interface GenerationJobData {
  assignmentId: string;
}

export const assignmentQueue = new Queue<GenerationJobData>('assignment-generation', {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: 100,
    removeOnFail: 200,
  },
});

export async function enqueueGeneration(assignmentId: string): Promise<string> {
  const job = await assignmentQueue.add(
    'generate',
    { assignmentId },
    { jobId: `gen-${assignmentId}` }
  );
  return job.id!;
}
