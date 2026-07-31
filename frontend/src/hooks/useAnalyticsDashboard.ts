import { useQuery } from '@tanstack/react-query';
import { auth } from '../firebase/firebase';

const API_BASE = process.env.VITE_BACKEND_URL || 'http://localhost:3001';

async function getAuthToken(): Promise<string> {
  const token = await auth.currentUser?.getIdToken();
  if (!token) throw new Error('No auth token');
  return token;
}

async function analyticsApiFetch(endpoint: string) {
  const token = await getAuthToken();
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) throw new Error(`API error: ${response.statusText}`);
  return response.json();
}

// ─── KPI METRICS ──────────────────────────────────────────────────────────

export function useKPIMetrics() {
  return useQuery({
    queryKey: ['analytics', 'kpi'],
    queryFn: () => analyticsApiFetch('/api/analytics-advanced/kpi'),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000
  });
}

// ─── PROJECT TRENDS ───────────────────────────────────────────────────────

export function useProjectTrends(period: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'weekly') {
  return useQuery({
    queryKey: ['analytics', 'projects', 'trends', period],
    queryFn: () => analyticsApiFetch(`/api/analytics-advanced/projects/trends?period=${period}`),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000
  });
}

// ─── PROJECT STATUS ───────────────────────────────────────────────────────

export function useProjectStatus() {
  return useQuery({
    queryKey: ['analytics', 'projects', 'status'],
    queryFn: () => analyticsApiFetch('/api/analytics-advanced/projects/status'),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000
  });
}

// ─── DOMAIN DISTRIBUTION ──────────────────────────────────────────────────

export function useDomainDistribution() {
  return useQuery({
    queryKey: ['analytics', 'domains'],
    queryFn: () => analyticsApiFetch('/api/analytics-advanced/domains'),
    staleTime: 15 * 60 * 1000,
    gcTime: 30 * 60 * 1000
  });
}

// ─── TECH STACK ───────────────────────────────────────────────────────────

export function useTechStack() {
  return useQuery({
    queryKey: ['analytics', 'tech-stack'],
    queryFn: () => analyticsApiFetch('/api/analytics-advanced/tech-stack'),
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000
  });
}

// ─── TOP PROJECTS ─────────────────────────────────────────────────────────

export function useTopProjects(sortBy: 'completion' | 'research' | 'quality' = 'completion', limit: number = 5) {
  return useQuery({
    queryKey: ['analytics', 'projects', 'top', sortBy, limit],
    queryFn: () => analyticsApiFetch(`/api/analytics-advanced/projects/top?sortBy=${sortBy}&limit=${limit}`),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000
  });
}

// ─── RECENT PROJECTS ──────────────────────────────────────────────────────

export function useRecentProjects(limit: number = 10) {
  return useQuery({
    queryKey: ['analytics', 'projects', 'recent', limit],
    queryFn: () => analyticsApiFetch(`/api/analytics-advanced/projects/recent?limit=${limit}`),
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000
  });
}

// ─── INSIGHTS ──────────────────────────────────────────────────────────────

export function useProjectInsights() {
  return useQuery({
    queryKey: ['analytics', 'insights'],
    queryFn: () => analyticsApiFetch('/api/analytics-advanced/insights'),
    staleTime: 15 * 60 * 1000,
    gcTime: 30 * 60 * 1000
  });
}

// ─── PRODUCTIVITY GRAPH ────────────────────────────────────────────────────

export function useProductivityGraph(weeks: number = 12) {
  return useQuery({
    queryKey: ['analytics', 'productivity', weeks],
    queryFn: () => analyticsApiFetch(`/api/analytics-advanced/productivity?weeks=${weeks}`),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000
  });
}

// ─── RESEARCH TRENDS ──────────────────────────────────────────────────────

export function useResearchTrends(period: 'daily' | 'weekly' | 'monthly' = 'weekly') {
  return useQuery({
    queryKey: ['analytics', 'research', 'trends', period],
    queryFn: () => analyticsApiFetch(`/api/analytics-advanced/research/trends?period=${period}`),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000
  });
}

// ─── TOKEN USAGE ──────────────────────────────────────────────────────────

export function useTokenUsage(days: number = 30) {
  return useQuery({
    queryKey: ['analytics', 'tokens', 'daily', days],
    queryFn: () => analyticsApiFetch(`/api/analytics-advanced/tokens/daily?days=${days}`),
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000
  });
}

// ─── VOICE ANALYTICS ──────────────────────────────────────────────────────

export function useVoiceAnalytics() {
  return useQuery({
    queryKey: ['analytics', 'voice'],
    queryFn: () => analyticsApiFetch('/api/analytics-advanced/voice'),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000
  });
}

// ─── RECENT ACTIVITY ──────────────────────────────────────────────────────

export function useRecentActivity(limit: number = 20) {
  return useQuery({
    queryKey: ['analytics', 'activity', limit],
    queryFn: () => analyticsApiFetch(`/api/analytics-advanced/activity?limit=${limit}`),
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000
  });
}

// ─── LATEST RESEARCH ──────────────────────────────────────────────────────

export function useLatestResearch(limit: number = 5) {
  return useQuery({
    queryKey: ['analytics', 'research', 'latest', limit],
    queryFn: () => analyticsApiFetch(`/api/analytics-advanced/research/latest?limit=${limit}`),
    staleTime: 15 * 60 * 1000,
    gcTime: 30 * 60 * 1000
  });
}
