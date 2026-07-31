import { useQuery, useQueryClient } from '@tanstack/react-query';
import { dashboardApi } from '../lib/api-client';

// ─── useMetrics - Fetch dashboard metrics ──────────────────────────────────
export function useMetrics() {
  return useQuery({
    queryKey: ['dashboard', 'metrics'],
    queryFn: dashboardApi.getMetrics,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// ─── useRecentProjects - Fetch recent projects ────────────────────────────
export function useRecentProjects(limit: number = 4) {
  return useQuery({
    queryKey: ['dashboard', 'recent-projects', limit],
    queryFn: () => dashboardApi.getRecentProjects(limit),
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// ─── useRecommendations - Fetch recommendations ────────────────────────────
export function useRecommendations() {
  return useQuery({
    queryKey: ['dashboard', 'recommendations'],
    queryFn: dashboardApi.getRecommendations,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

// ─── useTrendingTech - Fetch trending technologies ────────────────────────
export function useTrendingTech() {
  return useQuery({
    queryKey: ['dashboard', 'trending-tech'],
    queryFn: dashboardApi.getTrendingTech,
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
}

// ─── useLatestResearch - Fetch latest research ──────────────────────────────
export function useLatestResearch() {
  return useQuery({
    queryKey: ['dashboard', 'latest-research'],
    queryFn: dashboardApi.getLatestResearch,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
}

// ─── useSummary - Fetch dashboard summary ──────────────────────────────────
export function useSummary() {
  return useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: dashboardApi.getSummary,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// ─── useAllProjects - Fetch all projects with pagination ───────────────────
export function useAllProjects(page: number = 1, limit: number = 20) {
  return useQuery({
    queryKey: ['dashboard', 'all-projects', page, limit],
    queryFn: () => dashboardApi.getAllProjects(page, limit),
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// ─── useInvalidateDashboard - Helper to manually refresh dashboard ─────────
export function useInvalidateDashboard() {
  const queryClient = useQueryClient();
  return {
    invalidateMetrics: () =>
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'metrics'] }),
    invalidateRecentProjects: () =>
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'recent-projects'] }),
    invalidateRecommendations: () =>
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'recommendations'] }),
    invalidateAll: () =>
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
  };
}
