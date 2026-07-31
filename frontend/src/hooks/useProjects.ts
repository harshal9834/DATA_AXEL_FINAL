import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { auth } from "../firebase/firebase";
import { BACKEND_URL } from "../lib/api";

const getHeaders = async () => {
  const token = await auth.currentUser?.getIdToken();
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export function useProjects(filters: { search: string; status: string }) {
  return useQuery({
    queryKey: ["projects", filters],
    queryFn: async () => {
      const headers = await getHeaders();
      const params = new URLSearchParams();
      if (filters.search) params.append("search", filters.search);
      if (filters.status) params.append("status", filters.status);

      const res = await fetch(`${BACKEND_URL}/api/projects?${params.toString()}`, { headers });
      if (!res.ok) throw new Error("Failed to fetch projects");
      const data = await res.json();
      return data.projects || [];
    },
    enabled: !!auth.currentUser,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { title?: string; description?: string; domain?: string }) => {
      const headers = await getHeaders();
      const res = await fetch(`${BACKEND_URL}/api/projects`, {
        method: "POST",
        headers,
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create project");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["minimal"] }); // update dashboard
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const headers = await getHeaders();
      const res = await fetch(`${BACKEND_URL}/api/projects/${id}`, {
        method: "DELETE",
        headers,
      });
      if (!res.ok) throw new Error("Failed to delete project");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["minimal"] });
    },
  });
}
