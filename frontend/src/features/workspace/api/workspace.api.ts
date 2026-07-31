// ─── Workspace API Layer ───────────────────────────────────────────────────────
// All HTTP calls isolated here. Phase 2 will only extend these functions.

import { auth } from '../../../firebase/firebase';
import type {
  ResearchWorkspace,
  CreateWorkspaceResponse,
  ListWorkspacesResponse,
} from '../types/workspace.types';

const API_BASE = (import.meta as any).env?.VITE_BACKEND_URL ?? 'http://localhost:3001';

// ─── Auth Helper ───────────────────────────────────────────────────────────────

async function getAuthToken(): Promise<string> {
  const token = await auth.currentUser?.getIdToken();
  if (!token) throw new Error('No authentication token. Please log in.');
  return token;
}

async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = await getAuthToken();
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body?.error ?? `API error ${response.status}: ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

// ─── Workspace API ─────────────────────────────────────────────────────────────

export const workspaceApi = {
  /** POST /api/research-workspace/create */
  create: (data: {
    projectName: string;
    problemStatement: string;
  }): Promise<CreateWorkspaceResponse> =>
    apiFetch('/api/research-workspace/create', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /** GET /api/research-workspace/:id */
  getById: (workspaceId: string): Promise<ResearchWorkspace> =>
    apiFetch(`/api/research-workspace/${workspaceId}`),

  /** GET /api/research-workspace?limit=n */
  list: (limit = 20): Promise<ListWorkspacesResponse> =>
    apiFetch(`/api/research-workspace?limit=${limit}`),

  /** POST /api/research-workspace/:itemId/bookmark */
  bookmarkItem: (itemId: string): Promise<{ success: boolean; resourceId: string }> =>
    apiFetch(`/api/research-workspace/${itemId}/bookmark`, { method: 'POST' }),
};
