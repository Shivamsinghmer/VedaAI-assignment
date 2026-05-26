'use client';

import { useEffect, useState, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { connectWs } from '@/lib/websocket';
import { useAssignmentStore } from '@/store/assignmentStore';
import { Assignment, GeneratedPaper, JobStatus } from '@/types';
import GenerationProgress from '@/components/paper/GenerationProgress';
import QuestionPaper from '@/components/paper/QuestionPaper';
import Header from '@/components/layout/Header';

const POLL_INTERVAL = 4000;

export default function AssignmentOutputPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const { setGenerationStatus, setGeneratedPaper, generationStatus, generationProgress, generationPaper } =
    useAssignmentStore();

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function stopPolling() {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  }

  function markCompleted(paper: GeneratedPaper, a?: Assignment) {
    setGenerationStatus(id, 'completed', 100);
    setGeneratedPaper(id, paper);
    if (a) setAssignment((prev) => ({ ...(prev ?? a), status: 'completed', generatedPaper: paper }));
    stopPolling();
  }

  useEffect(() => {
    api.getAssignment(id)
      .then((data) => {
        setAssignment(data);
        if (data.status === 'completed' && data.generatedPaper) markCompleted(data.generatedPaper, data);
        else setGenerationStatus(id, data.status as JobStatus, 0);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    const currentStatus = generationStatus[id];
    if (currentStatus === 'completed' || currentStatus === 'failed') return;

    const disconnect = connectWs(id, (msg) => {
      if (msg.type === 'job_update') setGenerationStatus(id, msg.status || 'processing', msg.progress);
      else if (msg.type === 'job_completed' && msg.data) {
        markCompleted(msg.data);
        setAssignment((prev) => prev ? { ...prev, status: 'completed', generatedPaper: msg.data } : prev);
      } else if (msg.type === 'job_failed') {
        setGenerationStatus(id, 'failed');
        setError(msg.error || 'Generation failed');
        stopPolling();
      }
    });
    return disconnect;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, generationStatus[id]]);

  useEffect(() => {
    const currentStatus = generationStatus[id];
    if (currentStatus === 'completed' || currentStatus === 'failed' || loading) return;
    pollRef.current = setInterval(async () => {
      try {
        const data = await api.getAssignment(id);
        if (data.status === 'completed' && data.generatedPaper) markCompleted(data.generatedPaper, data);
        else if (data.status === 'failed') { setGenerationStatus(id, 'failed'); stopPolling(); }
      } catch { /* silent */ }
    }, POLL_INTERVAL);
    return stopPolling;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, loading, generationStatus[id]]);

  const status: JobStatus = generationStatus[id] || (assignment?.status as JobStatus) || 'pending';
  const progress = generationProgress[id] || 0;
  const paper: GeneratedPaper | undefined = generationPaper[id] || assignment?.generatedPaper;

  const pageTitle = assignment?.title || 'Question Paper';

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header breadcrumb="Assignment" backHref="/assignments" mobileTitle="Loading…" />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-7 h-7 rounded-full border-2 border-[#171717] border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  if (error && status !== 'completed') {
    return (
      <div className="flex flex-col min-h-screen">
        <Header breadcrumb="Assignment" backHref="/assignments" mobileTitle="Error" />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
          <p className="text-red-600 font-medium">{error}</p>
          <button onClick={() => router.push('/assignments')} className="text-sm text-[#5d5d5d] hover:text-[#2f2f2f] underline">
            Back to assignments
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header breadcrumb="Assignment" backHref="/assignments" mobileTitle={pageTitle} />

      <div className="flex-1 px-4 lg:px-8 py-6 max-w-4xl mx-auto w-full">
        {(status === 'pending' || status === 'processing') && (
          <GenerationProgress status={status} progress={progress} title={assignment?.title} />
        )}

        {status === 'failed' && (
          <div className="text-center py-16">
            <p className="text-red-600 font-semibold mb-4">Generation failed. Please try again.</p>
            <button
              onClick={async () => { await api.regenerate(id); setGenerationStatus(id, 'pending', 0); }}
              className="px-6 py-3 bg-[#171717] text-white rounded-full text-sm font-semibold hover:bg-[#2f2f2f]"
            >
              Retry Generation
            </button>
          </div>
        )}

        {status === 'completed' && paper && assignment && (
          <QuestionPaper paper={paper} assignment={assignment} />
        )}
      </div>
    </div>
  );
}
