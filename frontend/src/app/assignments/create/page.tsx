'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import { Calendar, Plus, Minus, ChevronRight, ChevronLeft, ChevronDown, X, FileText, Mic, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAssignmentStore } from '@/store/assignmentStore';
import { QUESTION_TYPE_OPTIONS } from '@/components/assignment/constants';
import { cn } from '@/lib/utils';
import Header from '@/components/layout/Header';
import { useVoiceInput } from '@/hooks/useVoiceInput';

export default function CreateAssignmentPage() {
  const router = useRouter();
  const {
    form, setFormField, addQuestionType, removeQuestionType, updateQuestionType,
    isSubmitting, submitError, submitAssignment, resetForm,
  } = useAssignmentStore();

  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Voice input — appends transcribed text to additionalInstructions
  const handleTranscript = useCallback((text: string) => {
    const current = form.additionalInstructions?.trim();
    setFormField('additionalInstructions', current ? `${current} ${text}` : text);
  }, [form.additionalInstructions, setFormField]);

  const { status: voiceStatus, error: voiceError, toggle: toggleVoice, clearError: clearVoiceError } = useVoiceInput({
    onTranscript: handleTranscript,
  });

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = 'Required';
    if (!form.subject.trim()) e.subject = 'Required';
    if (!form.className.trim()) e.className = 'Required';
    if (!form.schoolName.trim()) e.schoolName = 'Required';
    if (!form.dueDate) e.dueDate = 'Required';
    if (!form.questionTypes.length) e.questionTypes = 'Add at least one question type';
    form.questionTypes.forEach((qt, i) => {
      if (!qt.count || qt.count < 1) e[`qt_count_${i}`] = '!';
      if (!qt.marksPerQuestion || qt.marksPerQuestion < 1) e[`qt_marks_${i}`] = '!';
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    const id = await submitAssignment();
    if (id) { resetForm(); router.push(`/assignments/${id}`); }
  }

  const totalQuestions = form.questionTypes.reduce((s, qt) => s + (qt.count || 0), 0);
  const totalMarks = form.questionTypes.reduce((s, qt) => s + (qt.count || 0) * (qt.marksPerQuestion || 0), 0);

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        breadcrumb="Assignment"
        backHref="/assignments"
        mobileTitle="Create Assignment"
      />

      {/* Progress bar */}
      <div className="h-1 bg-[#e8e8e8]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '50%' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="h-full bg-[#171717]"
        />
      </div>

      <div className="flex-1 px-4 lg:px-8 py-6 max-w-3xl mx-auto w-full">
        {/* Page title — desktop only */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6 hidden lg:block"
        >
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#4bc16c] shrink-0" />
            <h1 className="text-xl font-bold text-[#2f2f2f]">Create Assignment</h1>
          </div>
          <p className="text-sm text-[#5d5d5d] mt-0.5 font-inter ml-[18px]">Set up a new assignment for your students</p>
        </motion.div>

        <form onSubmit={handleSubmit}>
          {/* Assignment Details card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-white rounded-2xl border border-[#efefef] p-6 mb-4"
          >
            <h2 className="font-bold text-[#2f2f2f] mb-0.5">Assignment Details</h2>
            <p className="text-xs text-[#5d5d5d] mb-5 font-inter">Basic information about your assignment</p>

            {/* File upload */}
            <AnimatePresence mode="wait">
              {form.file ? (
                <motion.div
                  key="file-preview"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  className="flex items-center gap-3 p-4 rounded-xl border border-[#e8e8e8] mb-4 bg-[#f6f6f6]"
                >
                  <FileText className="w-8 h-8 text-[#5d5d5d]" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#2f2f2f] truncate">{form.file.name}</p>
                    <p className="text-xs text-[#a9a9a9]">{(form.file.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <button type="button" onClick={() => setFormField('file', null)}>
                    <X className="w-4 h-4 text-[#a9a9a9] hover:text-[#2f2f2f]" />
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="file-upload"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-3 py-8 rounded-xl border border-dashed border-[#d0d0d0] cursor-pointer hover:border-[#a0a0a0] hover:bg-[#fafafa] transition-all mb-4"
                >
                  <Image src="/icons/dragdrop.png" alt="Upload" width={40} height={40} className="opacity-60" />
                  <div className="text-center">
                    <p className="text-sm font-medium text-[#2f2f2f]">Choose a file or drag & drop it here</p>
                    <p className="text-xs text-[#a9a9a9] mt-0.5 font-inter">JPEG, PNG, upto 10MB</p>
                  </div>
                  <button
                    type="button"
                    className="px-5 py-1.5 rounded-lg border border-[#d0d0d0] text-sm text-[#5d5d5d] bg-white hover:bg-[#f6f6f6] transition-colors"
                  >
                    Browse Files
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
            <input ref={fileInputRef} type="file" accept=".pdf,.txt,.jpeg,.jpg,.png" className="hidden"
              onChange={(e) => setFormField('file', e.target.files?.[0] || null)} />

            <p className="text-xs text-[#a9a9a9] text-center mb-5 font-inter">Upload images of your preferred document/image</p>

            {/* Due Date */}
            <div className="mb-5">
              <label className="text-xs font-semibold text-[#2f2f2f] block mb-2">Due Date</label>
              <div className="relative">
                <input
                  type="date"
                  value={form.dueDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setFormField('dueDate', e.target.value)}
                  placeholder="DD-MM-YYYY"
                  className={cn(
                    'w-full px-4 py-3 rounded-xl border text-sm text-[#2f2f2f] bg-[#f6f6f6] focus:outline-none focus:border-[#2f2f2f] transition-colors',
                    errors.dueDate ? 'border-red-400' : 'border-[#e8e8e8]'
                  )}
                />
                <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a9a9a9] pointer-events-none" />
              </div>
            </div>

            {/* Fields grid — 1 col on very small screens, 2 col otherwise */}
            <div className="grid grid-cols-1 min-[400px]:grid-cols-2 gap-3 mb-5">
              {[
                { label: 'Title', key: 'title', placeholder: 'e.g. Quiz on Electricity' },
                { label: 'Subject', key: 'subject', placeholder: 'e.g. Science' },
                { label: 'Class', key: 'className', placeholder: 'e.g. Grade 8' },
                { label: 'School', key: 'schoolName', placeholder: 'e.g. Delhi Public School' },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="text-xs font-semibold text-[#2f2f2f] block mb-1.5">{label}</label>
                  <input
                    type="text"
                    placeholder={placeholder}
                    value={(form as unknown as Record<string, string>)[key]}
                    onChange={(e) => setFormField(key as 'title', e.target.value)}
                    className={cn(
                      'w-full px-4 py-2.5 rounded-xl border text-sm text-[#2f2f2f] bg-[#f6f6f6] focus:outline-none focus:border-[#2f2f2f] transition-colors placeholder:text-[#c0c0c0]',
                      errors[key] ? 'border-red-400' : 'border-[#e8e8e8]'
                    )}
                  />
                </div>
              ))}
              <div>
                <label className="text-xs font-semibold text-[#2f2f2f] block mb-1.5">Time (min)</label>
                <input
                  type="number" min={10} max={360} value={form.timeAllowed}
                  onChange={(e) => setFormField('timeAllowed', parseInt(e.target.value) || 60)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#e8e8e8] text-sm text-[#2f2f2f] bg-[#f6f6f6] focus:outline-none focus:border-[#2f2f2f] transition-colors"
                />
              </div>
            </div>

            {/* Question Type section */}
            <div>
              <h3 className="text-sm font-bold text-[#2f2f2f] mb-3">Question Type</h3>

              {/* Desktop: column headers */}
              <div className="hidden lg:grid lg:grid-cols-[1fr_36px_130px_110px] gap-2 mb-2 px-1">
                <span className="text-xs font-semibold text-[#5d5d5d]">Question Type</span>
                <span />
                <span className="text-xs font-semibold text-[#5d5d5d] text-center">No. of Questions</span>
                <span className="text-xs font-semibold text-[#5d5d5d] text-center">Marks</span>
              </div>

              <div className="space-y-3">
                <AnimatePresence>
                  {form.questionTypes.map((qt, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20, height: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      {/* ─── Mobile: stacked card ─── */}
                      <div className="lg:hidden rounded-xl border border-[#e8e8e8] bg-[#f6f6f6] p-4">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="relative flex-1">
                            <select
                              value={qt.type}
                              onChange={(e) => updateQuestionType(i, 'type', e.target.value)}
                              className="w-full px-3 py-2.5 rounded-xl border border-[#e8e8e8] bg-white text-sm text-[#2f2f2f] focus:outline-none focus:border-[#2f2f2f] appearance-none pr-8 transition-colors"
                            >
                              {QUESTION_TYPE_OPTIONS.map((opt) => <option key={opt}>{opt}</option>)}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#a9a9a9] pointer-events-none" />
                          </div>
                          <button type="button" onClick={() => removeQuestionType(i)} disabled={form.questionTypes.length === 1}
                            className="p-1.5 rounded-lg text-[#a9a9a9] hover:text-red-500 hover:bg-red-50 disabled:opacity-30 transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[11px] font-semibold text-[#5d5d5d] block mb-1.5">No. of Questions</label>
                            <Stepper value={qt.count} min={1} max={50} error={!!errors[`qt_count_${i}`]}
                              onChange={(v) => updateQuestionType(i, 'count', v)} />
                          </div>
                          <div>
                            <label className="text-[11px] font-semibold text-[#5d5d5d] block mb-1.5">Marks</label>
                            <Stepper value={qt.marksPerQuestion} min={1} max={100} error={!!errors[`qt_marks_${i}`]}
                              onChange={(v) => updateQuestionType(i, 'marksPerQuestion', v)} />
                          </div>
                        </div>
                      </div>

                      {/* ─── Desktop: horizontal row ─── */}
                      <div className="hidden lg:grid lg:grid-cols-[1fr_36px_130px_110px] gap-2 items-center">
                        <div className="relative">
                          <select
                            value={qt.type}
                            onChange={(e) => updateQuestionType(i, 'type', e.target.value)}
                            className="w-full px-3 py-2.5 rounded-xl border border-[#e8e8e8] bg-[#f6f6f6] text-sm text-[#2f2f2f] focus:outline-none focus:border-[#2f2f2f] appearance-none pr-8 transition-colors"
                          >
                            {QUESTION_TYPE_OPTIONS.map((opt) => <option key={opt}>{opt}</option>)}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#a9a9a9] pointer-events-none" />
                        </div>
                        <button type="button" onClick={() => removeQuestionType(i)} disabled={form.questionTypes.length === 1}
                          className="flex items-center justify-center w-8 h-8 rounded-lg text-[#a9a9a9] hover:text-red-500 hover:bg-red-50 disabled:opacity-30 transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                        <Stepper value={qt.count} min={1} max={50} error={!!errors[`qt_count_${i}`]}
                          onChange={(v) => updateQuestionType(i, 'count', v)} />
                        <Stepper value={qt.marksPerQuestion} min={1} max={100} error={!!errors[`qt_marks_${i}`]}
                          onChange={(v) => updateQuestionType(i, 'marksPerQuestion', v)} />
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Add Question Type */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={addQuestionType}
                className="mt-3 flex items-center gap-2 text-sm font-semibold text-[#2f2f2f] hover:text-[#5d5d5d] transition-colors"
              >
                <span className="w-6 h-6 rounded-full bg-[#4bc16c] flex items-center justify-center text-white">
                  <Plus className="w-3.5 h-3.5" />
                </span>
                Add Question Type
              </motion.button>

              {/* Totals */}
              <div className="mt-4 flex flex-wrap justify-end gap-x-6 gap-y-1 text-sm text-[#5d5d5d]">
                <span>Total Questions: <span className="font-bold text-[#2f2f2f]">{totalQuestions}</span></span>
                <span>Total Marks: <span className="font-bold text-[#2f2f2f]">{totalMarks}</span></span>
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-5">
              <label className="text-xs font-semibold text-[#2f2f2f] block mb-2">
                Additional Information <span className="text-[#a9a9a9] font-normal">(For better output)</span>
              </label>
              <div className="relative">
                <textarea
                  rows={3}
                  placeholder={
                    voiceStatus === 'recording'
                      ? 'Listening… speak now'
                      : voiceStatus === 'transcribing'
                      ? 'Transcribing your voice…'
                      : 'e.g Generate a question paper for 3 hour exam duration…'
                  }
                  value={form.additionalInstructions}
                  onChange={(e) => setFormField('additionalInstructions', e.target.value)}
                  className={cn(
                    'w-full px-4 py-3 pr-10 rounded-xl border bg-[#f6f6f6] text-sm text-[#2f2f2f] placeholder:text-[#c0c0c0] resize-none focus:outline-none transition-colors',
                    voiceStatus === 'recording'
                      ? 'border-red-400 focus:border-red-400'
                      : 'border-[#e8e8e8] focus:border-[#2f2f2f]'
                  )}
                />

                {/* Mic button — idle / recording / transcribing states */}
                <button
                  type="button"
                  onClick={toggleVoice}
                  disabled={voiceStatus === 'transcribing'}
                  className={cn(
                    'absolute right-3 bottom-3 w-6 h-6 flex items-center justify-center rounded-full transition-all',
                    voiceStatus === 'recording'
                      ? 'bg-red-500 text-white shadow-sm'
                      : voiceStatus === 'transcribing'
                      ? 'text-[#a9a9a9] cursor-not-allowed'
                      : 'text-[#a9a9a9] hover:text-[#2f2f2f]'
                  )}
                  title={
                    voiceStatus === 'recording'
                      ? 'Stop recording'
                      : voiceStatus === 'transcribing'
                      ? 'Transcribing…'
                      : 'Record voice input'
                  }
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {voiceStatus === 'recording' ? (
                      <motion.span
                        key="rec"
                        initial={{ scale: 0.6, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.6, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        {/* Pulsing dot while recording */}
                        <motion.span
                          className="block w-2.5 h-2.5 rounded-full bg-white"
                          animate={{ scale: [1, 1.3, 1] }}
                          transition={{ repeat: Infinity, duration: 1, ease: 'easeInOut' }}
                        />
                      </motion.span>
                    ) : voiceStatus === 'transcribing' ? (
                      <motion.span
                        key="spin"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        <Loader2 className="w-4 h-4 animate-spin text-[#5d5d5d]" />
                      </motion.span>
                    ) : (
                      <motion.span
                        key="mic"
                        initial={{ scale: 0.6, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.6, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        <Mic className="w-4 h-4" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              </div>

              {/* Recording pulse indicator */}
              <AnimatePresence>
                {voiceStatus === 'recording' && (
                  <motion.div
                    key="rec-hint"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="flex items-center gap-2 mt-1.5"
                  >
                    <motion.span
                      className="w-2 h-2 rounded-full bg-red-500 shrink-0"
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                    />
                    <span className="text-xs text-red-500 font-medium font-inter">Recording — tap mic to finish</span>
                  </motion.div>
                )}
                {voiceStatus === 'transcribing' && (
                  <motion.p
                    key="trans-hint"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="text-xs text-[#5d5d5d] mt-1.5 font-inter"
                  >
                    Processing audio with Whisper…
                  </motion.p>
                )}
                {voiceError && (
                  <motion.div
                    key="voice-err"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-between mt-1.5"
                  >
                    <p className="text-xs text-red-500 font-inter">{voiceError}</p>
                    <button
                      type="button"
                      onClick={clearVoiceError}
                      className="text-xs text-[#a9a9a9] hover:text-[#2f2f2f] ml-2"
                    >
                      ✕
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {submitError && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600"
            >
              {submitError}
            </motion.div>
          )}

          {/* Bottom nav buttons */}
          <div className="flex items-center justify-between pt-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={() => router.back()}
              className="flex items-center gap-2 px-6 py-3 rounded-full border border-[#e8e8e8] bg-white text-sm font-semibold text-[#2f2f2f] hover:bg-[#f6f6f6] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-8 py-3 rounded-full bg-[#171717] text-white text-sm font-semibold hover:bg-[#2f2f2f] disabled:opacity-60 transition-colors"
            >
              {isSubmitting ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                    className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full"
                  />
                  Generating…
                </>
              ) : (
                <>Next <ChevronRight className="w-4 h-4" /></>
              )}
            </motion.button>
          </div>
        </form>
      </div>
    </div>
  );
}

/** Reusable stepper: [ − ] value [ + ] */
function Stepper({ value, min, max, error, onChange }: {
  value: number; min: number; max: number; error?: boolean;
  onChange: (v: number) => void;
}) {
  return (
    <div className={cn(
      'flex items-center rounded-xl border bg-white overflow-hidden',
      error ? 'border-red-400' : 'border-[#e8e8e8]'
    )}>
      <button type="button" onClick={() => onChange(Math.max(min, value - 1))}
        className="px-3 py-2.5 text-[#5d5d5d] hover:bg-[#f6f6f6] active:bg-[#eee] transition-colors">
        <Minus className="w-3.5 h-3.5" />
      </button>
      <span className="flex-1 text-center text-sm font-semibold text-[#2f2f2f]">{value}</span>
      <button type="button" onClick={() => onChange(Math.min(max, value + 1))}
        className="px-3 py-2.5 text-[#5d5d5d] hover:bg-[#f6f6f6] active:bg-[#eee] transition-colors">
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
