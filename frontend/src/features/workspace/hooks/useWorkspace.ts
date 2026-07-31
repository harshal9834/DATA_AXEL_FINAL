// ─── Workspace Hooks ───────────────────────────────────────────────────────────
// Clean React Query hooks. Socket.IO wiring is ready but no-op until Phase 2 connects it.

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { auth } from '../../../firebase/firebase';
import { workspaceApi } from '../api/workspace.api';
import {
  WORKSPACE_QUERY_KEYS,
  WORKSPACE_STALE_TIME,
  WORKSPACE_LIST_STALE_TIME,
} from '../constants/workspace.constants';
import type { ResearchWorkspace } from '../types/workspace.types';

// ─── Socket Type (to avoid importing socket.io-client everywhere) ──────────────
interface WorkspaceSocket {
  on(event: string, handler: (data: unknown) => void): void;
  disconnect(): void;
}

// ─── Create Workspace ──────────────────────────────────────────────────────────

export function useCreateWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: workspaceApi.create,
    onSuccess: () => {
      // Invalidate the list so the history refreshes
      queryClient.invalidateQueries({ queryKey: WORKSPACE_QUERY_KEYS.list() });
    },
  });
}

// ─── Get Workspace (with real-time Socket.IO) ──────────────────────────────────

export function useWorkspace(workspaceId: string) {
  const queryClient = useQueryClient();
  const socketRef = useRef<WorkspaceSocket | null>(null);

  // Connect Socket.IO and listen for live updates.
  // Phase 2 will keep this exact hook — no changes needed.
  useEffect(() => {
    if (!workspaceId) return;

    let cancelled = false;

    auth.currentUser?.getIdToken().then((token) => {
      if (cancelled || !token) return;

      // Dynamically import socket.io-client to avoid SSR issues
      import('socket.io-client').then(({ default: io }) => {
        if (cancelled) return;

        const API_BASE = (import.meta as any).env?.VITE_BACKEND_URL ?? 'http://localhost:3001';
        const socket = io(API_BASE, { auth: { token } });
        socketRef.current = socket;

        socket.on('research_workspace_update', (data: unknown) => {
          const payload = data as { workspaceId?: string };
          if (payload?.workspaceId === workspaceId) {
            queryClient.invalidateQueries({
              queryKey: WORKSPACE_QUERY_KEYS.workspace(workspaceId),
            });
          }
        });
      });
    }).catch(console.error);

    return () => {
      cancelled = true;
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [workspaceId, queryClient]);

  return useQuery<ResearchWorkspace>({
    queryKey: WORKSPACE_QUERY_KEYS.workspace(workspaceId),
    queryFn: () => workspaceApi.getById(workspaceId),
    enabled: !!workspaceId,
    staleTime: WORKSPACE_STALE_TIME,
    refetchOnWindowFocus: true,
  });
}

// ─── List User Workspaces ──────────────────────────────────────────────────────

export function useWorkspaceList(limit = 20) {
  return useQuery({
    queryKey: WORKSPACE_QUERY_KEYS.list(),
    queryFn: () => workspaceApi.list(limit),
    staleTime: WORKSPACE_LIST_STALE_TIME,
  });
}

// ─── Bookmark Item ─────────────────────────────────────────────────────────────

export function useBookmarkWorkspaceItem() {
  return useMutation({
    mutationFn: workspaceApi.bookmarkItem,
  });
}
