import { auth } from '../firebase/firebase';

export const BACKEND_URL = process.env.VITE_BACKEND_URL || 'http://localhost:3001';
export const API_BASE = `${BACKEND_URL}/api`;

// ─── Auth Helper ──────────────────────────────────────────────────────────

async function getAuthToken(): Promise<string> {
  try {
    const token = await auth.currentUser?.getIdToken();
    if (!token) throw new Error('No auth token available');
    return token;
  } catch (err) {
    console.error('Failed to get auth token:', err);
    throw err;
  }
}

// ─── Base Fetch with Auth ──────────────────────────────────────────────────

async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = await getAuthToken();
  const url = `${API_BASE}${endpoint}`;

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  const response = await fetch(url, {
    ...options,
    headers: { ...defaultHeaders, ...(options.headers || {}) }
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || error.message || response.statusText);
  }

  return response.json();
}

// ─── Dashboard APIs ───────────────────────────────────────────────────────

export const dashboardApi = {
  getSummary: () => apiFetch('/dashboard/summary'),
  getMetrics: () => apiFetch('/dashboard/metrics'),
  getRecentProjects: (limit?: number) =>
    apiFetch(`/dashboard/recent-projects${limit ? `?limit=${limit}` : ''}`),
  getRecommendations: () => apiFetch('/dashboard/recommendations'),
  getTrendingTech: () => apiFetch('/dashboard/trending-tech'),
  getLatestResearch: () => apiFetch('/dashboard/latest-research'),
  getAllProjects: (page?: number, limit?: number) => {
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit.toString());
    return apiFetch(`/dashboard/all-projects${params.toString() ? `?${params}` : ''}`);
  },
  markRecommendationViewed: (id: string) =>
    apiFetch(`/dashboard/mark-recommendation-viewed/${id}`, { method: 'POST' })
};

// ─── Resources APIs ───────────────────────────────────────────────────────

export const resourcesApi = {
  getResources: (category?: string, page?: number, limit?: number) => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit.toString());
    return apiFetch(`/resources${params.toString() ? `?${params}` : ''}`);
  },
  bookmarkResource: (data: {
    category: string;
    title: string;
    url: string;
    description?: string;
    tags?: string[];
    difficulty?: string;
  }) => apiFetch('/resources/bookmark', { method: 'POST', body: JSON.stringify(data) }),
  removeResource: (id: string) =>
    apiFetch(`/resources/${id}`, { method: 'DELETE' }),
  getCategories: () => apiFetch('/resources/categories/list')
};

// ─── Analytics APIs ────────────────────────────────────────────────────────

export const analyticsApi = {
  trackSession: (data: {
    workflowId?: string;
    type?: string;
    language?: string;
    voiceUsed?: boolean;
    llmUsed?: string;
    tokensUsed?: number;
  }) => apiFetch('/analytics/track-session', { method: 'POST', body: JSON.stringify(data) }),
  endSession: (sessionId: string, data: { messageCount?: number; tokensUsed?: number }) =>
    apiFetch(`/analytics/end-session/${sessionId}`, { method: 'POST', body: JSON.stringify(data) }),
  getUserAnalytics: () => apiFetch('/analytics/user'),
  getSessions: (limit?: number) =>
    apiFetch(`/analytics/sessions${limit ? `?limit=${limit}` : ''}`),
  updateInnovationScore: (score: number) =>
    apiFetch('/analytics/update-innovation-score', { method: 'POST', body: JSON.stringify({ score }) })
};

// ─── Workflow APIs (existing) ──────────────────────────────────────────────

export const workflowApi = {
  createWorkflow: (idea: string) =>
    apiFetch('/workflows', { method: 'POST', body: JSON.stringify({ idea }) }),
  getDashboard: () => apiFetch('/workflows/dashboard'),
  retryAgent: (workflowId: string, agentName: string) =>
    apiFetch(`/workflows/${workflowId}/retry`, { method: 'POST', body: JSON.stringify({ agentName }) }),
  getBlueprint: (workflowId: string) =>
    apiFetch(`/workflows/${workflowId}/blueprint`),
  approveBlueprintprovalBy: (workflowId: string) =>
    apiFetch(`/workflows/${workflowId}/approve-blueprint`, { method: 'POST' }),
  modifyBlueprint: (workflowId: string, instructions: string) =>
    apiFetch(`/workflows/${workflowId}/modify-blueprint`, {
      method: 'POST',
      body: JSON.stringify({ instructions })
    })
};

// ─── Workspace APIs (existing) ─────────────────────────────────────────────

export const workspaceApi = {
  getWorkspace: (workflowId: string) =>
    apiFetch(`/workspace/${workflowId}`)
};

export default {
  dashboard: dashboardApi,
  resources: resourcesApi,
  analytics: analyticsApi,
  workflow: workflowApi,
  workspace: workspaceApi
};
