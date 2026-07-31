import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { resourcesApi } from '../lib/api-client';
import { toast } from 'sonner';

// ─── useResources - Fetch bookmarked resources ─────────────────────────────
export function useResources(category?: string, page: number = 1, limit: number = 12) {
  return useQuery({
    queryKey: ['resources', category, page, limit],
    queryFn: () => resourcesApi.getResources(category, page, limit),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// ─── useBookmarkResource - Mutation for bookmarking resource ───────────────
export function useBookmarkResource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      category: string;
      title: string;
      url: string;
      description?: string;
      tags?: string[];
      difficulty?: string;
    }) => resourcesApi.bookmarkResource(data),
    onSuccess: () => {
      toast.success('Resource bookmarked!');
      queryClient.invalidateQueries({ queryKey: ['resources'] });
    },
    onError: (err: any) => {
      if (err.message.includes('already bookmarked')) {
        toast.error('Resource already bookmarked');
      } else {
        toast.error('Failed to bookmark resource');
      }
    }
  });
}

// ─── useRemoveResource - Mutation for removing resource ────────────────────
export function useRemoveResource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => resourcesApi.removeResource(id),
    onSuccess: () => {
      toast.success('Resource removed');
      queryClient.invalidateQueries({ queryKey: ['resources'] });
    },
    onError: () => {
      toast.error('Failed to remove resource');
    }
  });
}

// ─── useResourceCategories - Fetch available categories ────────────────────
export function useResourceCategories() {
  return useQuery({
    queryKey: ['resources', 'categories'],
    queryFn: resourcesApi.getCategories,
    staleTime: Infinity, // Categories don't change often
  });
}
