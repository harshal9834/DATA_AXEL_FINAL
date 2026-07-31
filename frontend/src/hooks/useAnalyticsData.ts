import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { analyticsApi } from '../lib/api-client';

// ─── useUserAnalytics - Fetch user analytics ───────────────────────────────
export function useUserAnalytics() {
  return useQuery({
    queryKey: ['analytics', 'user'],
    queryFn: analyticsApi.getUserAnalytics,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

// ─── useSessions - Fetch user AI sessions ──────────────────────────────────
export function useSessions(limit: number = 20) {
  return useQuery({
    queryKey: ['analytics', 'sessions', limit],
    queryFn: () => analyticsApi.getSessions(limit),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// ─── useTrackSession - Start tracking an AI session ─────────────────────────
export function useTrackSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      workflowId?: string;
      type?: string;
      language?: string;
      voiceUsed?: boolean;
      llmUsed?: string;
      tokensUsed?: number;
    }) => analyticsApi.trackSession(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics', 'user'] });
    },
    onError: (err: any) => {
      console.error('Failed to track session:', err);
    }
  });
}

// ─── useEndSession - End tracking an AI session ────────────────────────────
export function useEndSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sessionId,
      data
    }: {
      sessionId: string;
      data: { messageCount?: number; tokensUsed?: number };
    }) => analyticsApi.endSession(sessionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics', 'sessions'] });
      queryClient.invalidateQueries({ queryKey: ['analytics', 'user'] });
    },
    onError: (err: any) => {
      console.error('Failed to end session:', err);
    }
  });
}

// ─── useUpdateInnovationScore - Update innovation score ────────────────────
export function useUpdateInnovationScore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (score: number) => analyticsApi.updateInnovationScore(score),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics', 'user'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'summary'] });
    },
    onError: (err: any) => {
      console.error('Failed to update innovation score:', err);
    }
  });
}
