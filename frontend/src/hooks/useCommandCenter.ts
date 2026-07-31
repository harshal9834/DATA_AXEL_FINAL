import { useQuery } from '@tanstack/react-query';
import { BACKEND_URL } from '../lib/api';
import { auth } from '../firebase/firebase';

const fetchWithAuth = async (endpoint: string) => {
  const token = await auth.currentUser?.getIdToken();
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(`${BACKEND_URL}/api/dashboard${endpoint}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch ${endpoint}`);
  }

  return res.json();
};

export const useDashboardOverview = () => {
  return useQuery({
    queryKey: ['dashboard', 'overview'],
    queryFn: () => fetchWithAuth('/overview'),
    refetchInterval: 30000, // Refresh every 30s
  });
};

export const useDashboardAnalytics = () => {
  return useQuery({
    queryKey: ['dashboard', 'analytics'],
    queryFn: () => fetchWithAuth('/analytics'),
    refetchInterval: 60000,
  });
};

export const useDashboardProjects = () => {
  return useQuery({
    queryKey: ['dashboard', 'projects'],
    queryFn: () => fetchWithAuth('/projects'),
    refetchInterval: 30000,
  });
};

export const useDashboardInsights = () => {
  return useQuery({
    queryKey: ['dashboard', 'insights'],
    queryFn: () => fetchWithAuth('/insights'),
    refetchInterval: 60000,
  });
};

export const useDashboardActivity = () => {
  return useQuery({
    queryKey: ['dashboard', 'activity'],
    queryFn: () => fetchWithAuth('/activity'),
    refetchInterval: 5000, // Frequent refresh for live feel, though socket is better
  });
};

export const useDashboardResources = () => {
  return useQuery({
    queryKey: ['dashboard', 'resources'],
    queryFn: () => fetchWithAuth('/resources'),
    refetchInterval: 60000,
  });
};

export const useDashboardNotifications = () => {
  return useQuery({
    queryKey: ['dashboard', 'notifications'],
    queryFn: () => fetchWithAuth('/notifications'),
    refetchInterval: 60000,
  });
};
