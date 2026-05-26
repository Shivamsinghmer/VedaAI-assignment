'use client';

import { Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { JobStatus } from '@/types';

const STEPS = [
  { pct: 10, label: 'Processing assignment' },
  { pct: 30, label: 'Generating questions with AI' },
  { pct: 80, label: 'Structuring paper' },
  { pct: 100, label: 'Complete' },
];

function currentStepLabel(progress: number) {
  for (let i = STEPS.length - 1; i >= 0; i--) {
    if (progress >= STEPS[i].pct) return STEPS[i].label;
  }
  return 'Queued';
}

export default function GenerationProgress({ status, progress, title }: {
  status: JobStatus; progress: number; title?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4"
    >
      {/* Animated icon */}
      <div className="relative mb-8">
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          className="w-20 h-20 rounded-2xl bg-white border border-[#efefef] shadow-sm flex items-center justify-center"
        >
          <Sparkles className="w-10 h-10 text-[#ff5623]" />
        </motion.div>
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeOut' }}
          className="absolute -inset-2 rounded-3xl border-2 border-[#171717]/10"
        />
      </div>

      <h2 className="text-xl font-bold text-[#2f2f2f] mb-1">
        {status === 'pending' ? 'Assignment queued…' : 'Generating your question paper…'}
      </h2>
      {title && <p className="text-sm font-semibold text-[#5d5d5d] mb-8">{title}</p>}

      {/* Progress bar */}
      <div className="w-full max-w-sm mb-3">
        <div className="flex justify-between text-xs text-[#a9a9a9] mb-1.5">
          <span>{currentStepLabel(progress)}</span>
          <span>{progress}%</span>
        </div>
        <div className="h-1.5 bg-[#e8e8e8] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[#171717] rounded-full"
            initial={{ width: '3%' }}
            animate={{ width: `${Math.max(progress, 3)}%` }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Step pills */}
      <div className="flex gap-2 mt-5 flex-wrap justify-center">
        {STEPS.map((step, i) => (
          <motion.div
            key={step.pct}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              progress >= step.pct
                ? 'bg-[#171717] border-[#171717] text-white'
                : 'bg-white border-[#e8e8e8] text-[#a9a9a9]'
            }`}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${progress >= step.pct ? 'bg-white' : 'bg-[#d0d0d0]'}`} />
            {step.label}
          </motion.div>
        ))}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-8 text-xs text-[#a9a9a9]"
      >
        This usually takes 15–30 seconds. You&apos;ll be notified when it&apos;s ready.
      </motion.p>
    </motion.div>
  );
}
