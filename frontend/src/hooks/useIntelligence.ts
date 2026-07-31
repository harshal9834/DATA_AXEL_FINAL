import { useQuery } from '@tanstack/react-query';
import { BACKEND_URL } from '../lib/api';
import { auth } from '../firebase/firebase';

const fetchWithAuth = async (endpoint: string) => {
  const token = await auth.currentUser?.getIdToken();
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(`${BACKEND_URL}/api/dashboard/intelligence${endpoint}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch ${endpoint}`);
  }

  return res.json();
};

export const useIntelligenceOverview = () => {
  return useQuery({
    queryKey: ['intelligence', 'overview'],
    queryFn: () => fetchWithAuth('/overview'),
    refetchInterval: 60000,
  });
};

export const useIntelligenceProjectCenter = () => {
  return useQuery({
    queryKey: ['intelligence', 'project-center'],
    queryFn: () => fetchWithAuth('/project-center'),
    refetchInterval: 60000,
  });
};

export const useIntelligenceAnalytics = () => {
  return useQuery({
    queryKey: ['intelligence', 'analytics'],
    queryFn: () => fetchWithAuth('/analytics'),
    refetchInterval: 120000,
  });
};

export const useIntelligenceProjects = () => {
  return useQuery({
    queryKey: ['intelligence', 'projects'],
    queryFn: () => fetchWithAuth('/projects'),
    refetchInterval: 30000,
  });
};

export const useIntelligenceMonitor = () => {
  return useQuery({
    queryKey: ['intelligence', 'monitor'],
    queryFn: () => fetchWithAuth('/monitor'),
    refetchInterval: 5000, 
  });
};

export const useIntelligenceInsights = () => {
  return useQuery({
    queryKey: ['intelligence', 'insights'],
    queryFn: () => fetchWithAuth('/insights'),
    refetchInterval: 300000,
  });
};

export const useIntelligenceResources = () => {
  return useQuery({
    queryKey: ['intelligence', 'resources'],
    queryFn: () => fetchWithAuth('/resources'),
    refetchInterval: 60000,
  });
};

export const useIntelligenceAlerts = () => {
  return useQuery({
    queryKey: ['intelligence', 'alerts'],
    queryFn: () => fetchWithAuth('/alerts'),
    refetchInterval: 60000,
  });
};
