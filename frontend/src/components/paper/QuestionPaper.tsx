'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { RefreshCw, Eye, EyeOff, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GeneratedPaper, Assignment, Difficulty } from '@/types';
import { DIFFICULTY_CONFIG } from '@/components/assignment/constants';
import { api } from '@/lib/api';
import { useAssignmentStore } from '@/store/assignmentStore';
import { cn } from '@/lib/utils';

const PDFDownloadButton = dynamic(() => import('./PDFDownloadButton'), {
  ssr: false,
  loading: () => (
    <button className="flex items-center gap-2 px-4 py-2.5 bg-[#171717]/60 text-white rounded-xl text-sm font-medium cursor-wait">
      Loading PDF…
    </button>
  ),
});

interface Props { paper: GeneratedPaper; assignment: Assignment; }

export default function QuestionPaper({ paper, assignment }: Props) {
  const [showAnswers, setShowAnswers] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const { setGenerationStatus } = useAssignmentStore();

  async function handleRegenerate() {
    if (!confirm('Regenerate this question paper?')) return;
    setIsRegenerating(true);
    try { await api.regenerate(assignment._id); setGenerationStatus(assignment._id, 'pending', 0); }
    finally { setIsRegenerating(false); }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>

      {/* AI Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mb-5 p-4 rounded-2xl bg-[#2f2f2f] text-white"
      >
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-[#ff5623] flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <p className="flex-1 text-sm leading-relaxed text-white/90 min-w-0">{paper.aiMessage}</p>
        </div>
        {/* Download button sits below on mobile, saves horizontal space */}
        <div className="mt-3 flex justify-end">
          <PDFDownloadButton paper={paper} assignment={assignment} compact />
        </div>
      </motion.div>

      {/* Action bar — buttons row + stats row */}
      <div className="mb-5 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <PDFDownloadButton paper={paper} assignment={assignment} />

          <button
            onClick={() => setShowAnswers((v) => !v)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#e8e8e8] text-[#2f2f2f] rounded-xl text-sm font-medium hover:bg-[#f6f6f6] transition-colors"
          >
            {showAnswers ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showAnswers ? 'Hide Answers' : 'Show Answers'}
          </button>

          <button
            onClick={handleRegenerate}
            disabled={isRegenerating}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#e8e8e8] text-[#2f2f2f] rounded-xl text-sm font-medium hover:bg-[#f6f6f6] disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={cn('w-4 h-4', isRegenerating && 'animate-spin')} />
            {isRegenerating ? 'Regenerating…' : 'Regenerate'}
          </button>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-5 text-sm text-[#5d5d5d] font-inter flex-wrap">
          <span><span className="font-bold text-[#2f2f2f]">{paper.totalQuestions}</span> questions</span>
          <span><span className="font-bold text-[#2f2f2f]">{paper.totalMarks}</span> marks</span>
          <span><span className="font-bold text-[#2f2f2f]">{paper.timeAllowed}</span> min</span>
        </div>
      </div>

      {/* The actual paper */}
      <div className="bg-white rounded-2xl border border-[#efefef] shadow-sm overflow-hidden">

        {/* Paper header */}
        <div className="border-b border-[#f0f0f0] py-6 px-5 sm:px-10 lg:px-16 text-center">
          <h1 className="text-base sm:text-lg font-extrabold text-[#2f2f2f] tracking-wide">
            {assignment.schoolName}
          </h1>
          <p className="text-sm text-[#5d5d5d] mt-1">Subject: {assignment.subject}</p>
          <p className="text-sm text-[#5d5d5d]">Class: {assignment.className}</p>
          <div className="flex justify-between items-center mt-3 text-xs sm:text-sm text-[#5d5d5d]">
            <span>Time: {paper.timeAllowed} min</span>
            <span>Max Marks: {paper.totalMarks}</span>
          </div>
          <p className="mt-2 text-xs text-[#a9a9a9] italic">All questions are compulsory unless stated otherwise.</p>

          {/* Student fields */}
          <div className="mt-5 pt-5 border-t border-dashed border-[#e8e8e8] space-y-2 text-left w-full max-w-xs mx-auto">
            {['Name', 'Roll Number', 'Section'].map((f) => (
              <div key={f} className="flex items-center gap-2 text-sm text-[#5d5d5d]">
                <span className="w-28 shrink-0">{f}:</span>
                <div className="flex-1 border-b border-[#2f2f2f]" />
              </div>
            ))}
          </div>
        </div>

        {/* Sections */}
        <div className="px-5 sm:px-10 lg:px-16 py-6 space-y-8">
          {paper.sections.map((section, sIdx) => (
            <div key={sIdx}>
              <div className="text-center mb-2">
                <h2 className="font-bold text-[#2f2f2f] text-base">{section.label}</h2>
              </div>
              <div className="mb-4">
                <p className="font-semibold text-[#2f2f2f] text-sm">{section.title}</p>
                <p className="text-xs text-[#5d5d5d] italic">{section.instruction}</p>
              </div>
              <div className="space-y-4">
                {section.questions.map((q, qIdx) => (
                  <QuestionRow
                    key={q.id}
                    number={qIdx + 1}
                    text={q.text}
                    difficulty={q.difficulty}
                    marks={q.marks}
                  />
                ))}
              </div>
            </div>
          ))}

          <p className="text-center text-sm font-semibold text-[#2f2f2f] pt-4 border-t border-[#f0f0f0]">
            End of Question Paper
          </p>
        </div>

        {/* Answer Key */}
        <AnimatePresence>
          {showAnswers && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35 }}
              className="border-t-2 border-dashed border-[#e8e8e8] px-5 sm:px-10 lg:px-16 py-6 overflow-hidden"
            >
              <p className="font-bold text-[#2f2f2f] text-base mb-6">Answer Key:</p>
              {paper.sections.map((section, sIdx) => (
                <div key={sIdx} className="mb-8">
                  <p className="font-bold text-sm text-[#2f2f2f] mb-3 pb-1 border-b border-[#f0f0f0]">
                    {section.label} — {section.title}
                  </p>
                  <ol className="space-y-4">
                    {section.questions.map((q, qIdx) => (
                      <AnswerKeyRow
                        key={q.id}
                        number={qIdx + 1}
                        question={q.text}
                        answer={q.answer}
                        type={q.type}
                        marks={q.marks}
                      />
                    ))}
                  </ol>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function QuestionRow({ number, text, difficulty, marks }: {
  number: number; text: string; difficulty: Difficulty; marks: number;
}) {
  const diff = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG.moderate;
  return (
    <div className="flex gap-2 items-start text-sm text-[#2f2f2f] leading-relaxed">
      <span className="shrink-0 font-semibold w-6 text-right">{number}.</span>
      <p className="flex-1 min-w-0">
        <span className="font-semibold">[{diff.label}]</span> {text}{' '}
        <span className="text-[#5d5d5d] whitespace-nowrap">[{marks} Marks]</span>
      </p>
    </div>
  );
}

function isLongType(type?: string) {
  if (!type) return false;
  const t = type.toLowerCase();
  return t.includes('long') || t.includes('essay') || t.includes('descriptive');
}

function isDiagramType(type?: string) {
  if (!type) return false;
  const t = type.toLowerCase();
  return t.includes('diagram') || t.includes('map') || t.includes('graph') || t.includes('chart') || t.includes('label');
}

function AnswerKeyRow({ number, question: _q, answer, type, marks: _m }: {
  number: number; question: string; answer?: string; type?: string; marks: number;
}) {
  const long = isLongType(type);
  const diagram = isDiagramType(type);

  return (
    <li className="flex gap-3 items-start text-sm">
      <span className="shrink-0 font-semibold text-[#2f2f2f] w-6">{number}.</span>
      <div className="flex-1 min-w-0">
        {diagram ? (
          <div className="space-y-2">
            <div className="rounded-xl border-2 border-dashed border-[#d0d0d0] bg-[#fafafa] flex items-center justify-center p-6 text-center">
              <p className="text-xs text-[#a9a9a9] italic">[Draw the diagram here — refer to the description below]</p>
            </div>
            <p className="text-[#5d5d5d] leading-relaxed whitespace-pre-line">{answer || '—'}</p>
          </div>
        ) : long ? (
          <p className="text-[#5d5d5d] leading-relaxed whitespace-pre-line">{answer || '—'}</p>
        ) : (
          <span className="text-[#5d5d5d]">{answer || '—'}</span>
        )}
      </div>
    </li>
  );
}
