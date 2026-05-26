'use client';

import { useState, useRef, useCallback } from 'react';

type Status = 'idle' | 'recording' | 'transcribing';

interface UseVoiceInputOptions {
  /** Called with the transcribed text when done */
  onTranscript: (text: string) => void;
  /** Append to existing text (default) or replace it */
  mode?: 'append' | 'replace';
}

export function useVoiceInput({ onTranscript }: UseVoiceInputOptions) {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const transcribe = useCallback(async (blob: Blob) => {
    setStatus('transcribing');
    setError(null);
    try {
      const form = new FormData();
      form.append('audio', blob, 'recording.webm');

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/transcribe`, {
        method: 'POST',
        body: form,
      });

      const data = await res.json();

      if (data.success && data.text) {
        onTranscript(data.text);
      } else {
        setError(data.error || 'Transcription failed');
      }
    } catch {
      setError('Could not reach the server');
    } finally {
      setStatus('idle');
    }
  }, [onTranscript]);

  const start = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Prefer webm/opus; fall back to whatever the browser supports
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : '';

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      recorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: mimeType || 'audio/webm' });
        transcribe(blob);
      };

      recorder.start();
      setStatus('recording');
    } catch {
      setError('Microphone access denied. Please allow microphone in browser settings.');
      setStatus('idle');
    }
  }, [transcribe]);

  const stop = useCallback(() => {
    recorderRef.current?.stop();
    // status moves to 'transcribing' inside onstop → transcribe()
  }, []);

  const toggle = useCallback(() => {
    if (status === 'idle') start();
    else if (status === 'recording') stop();
    // ignore clicks during 'transcribing'
  }, [status, start, stop]);

  return { status, error, toggle, clearError: () => setError(null) };
}
