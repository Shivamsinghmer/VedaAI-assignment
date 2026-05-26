import { Assignment, CreateAssignmentPayload } from '@/types';

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'API error');
  return json.data as T;
}

export const api = {
  getAssignments: () => apiFetch<Assignment[]>('/api/assignments'),

  getAssignment: (id: string) => apiFetch<Assignment>(`/api/assignments/${id}`),

  createAssignment: async (
    payload: CreateAssignmentPayload,
    file?: File
  ): Promise<{ _id: string; status: string; jobId: string }> => {
    const formData = new FormData();
    formData.append('data', JSON.stringify(payload));
    if (file) formData.append('file', file);

    const res = await fetch(`${BASE}/api/assignments`, {
      method: 'POST',
      body: formData,
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to create assignment');
    return json.data;
  },

  deleteAssignment: (id: string) =>
    apiFetch<{ message: string }>(`/api/assignments/${id}`, { method: 'DELETE' }),

  regenerate: (id: string) =>
    apiFetch<{ message: string; jobId: string }>(`/api/assignments/${id}/regenerate`, {
      method: 'POST',
    }),
};
