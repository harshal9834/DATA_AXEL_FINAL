import { useQuery } from '@tanstack/react-query';
import { BACKEND_URL } from '../lib/api';
import { auth } from '../firebase/firebase';

const fetchWithAuth = async (endpoint: string) => {
  const token = await auth.currentUser?.getIdToken();
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(`${BACKEND_URL}/api/dashboard/minimal${endpoint}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch ${endpoint}`);
  }

  return res.json();
};

export const useMinimalSummary = () => {
  return useQuery({
    queryKey: ['minimal', 'summary'],
    queryFn: () => fetchWithAuth('/summary'),
    refetchInterval: 60000,
  });
};

export const useMinimalIntelligence = () => {
  return useQuery({
    queryKey: ['minimal', 'intelligence'],
    queryFn: () => fetchWithAuth('/intelligence'),
    refetchInterval: 60000,
  });
};

export const useMinimalAnalytics = () => {
  return useQuery({
    queryKey: ['minimal', 'analytics'],
    queryFn: () => fetchWithAuth('/analytics'),
    refetchInterval: 120000,
  });
};

export const useMinimalProjects = () => {
  return useQuery({
    queryKey: ['minimal', 'projects'],
    queryFn: () => fetchWithAuth('/projects'),
    refetchInterval: 30000,
  });
};

export const useMinimalActivity = () => {
  return useQuery({
    queryKey: ['minimal', 'activity'],
    queryFn: () => fetchWithAuth('/activity'),
    refetchInterval: 15000,
  });
};
