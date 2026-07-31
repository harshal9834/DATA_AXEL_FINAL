// ─── Workspace Constants ───────────────────────────────────────────────────────

import type { WorkspaceTabId } from '../types/workspace.types';

export const WORKSPACE_TABS: Array<{
  id: WorkspaceTabId;
  label: string;
  icon: string;
}> = [
  { id: 'research', label: 'Research', icon: 'BookOpen' },
  { id: 'papers', label: 'Papers', icon: 'BookOpen' },
  { id: 'github', label: 'GitHub', icon: 'Github' },
  { id: 'datasets', label: 'Datasets', icon: 'Database' },
  { id: 'architecture', label: 'Architecture', icon: 'Network' },
  { id: 'er', label: 'ER Diagram', icon: 'GitBranch' },
  { id: 'flow', label: 'Flow Diagram', icon: 'Workflow' },
  { id: 'docs', label: 'Docs', icon: 'FileText' },
  { id: 'srs', label: 'SRS', icon: 'FileText' },
  { id: 'api', label: 'API & DB', icon: 'FileText' },
] as const;

export const EXAMPLE_PROJECTS: Array<{ name: string; problem: string }> = [
  {
    name: 'Food Waste Management',
    problem: 'Build a comprehensive food waste management system with AI capabilities',
  },
  {
    name: 'Hospital Management System',
    problem: 'Build a comprehensive hospital management system with AI capabilities',
  },
  {
    name: 'College ERP',
    problem: 'Build a comprehensive college ERP system with AI capabilities',
  },
  {
    name: 'AI Resume Screening',
    problem: 'Build a comprehensive AI resume screening system with smart matching',
  },
  {
    name: 'Inventory Management',
    problem: 'Build a comprehensive inventory management system with AI capabilities',
  },
];

export const WORKSPACE_QUERY_KEYS = {
  workspace: (id: string) => ['research-workspace', id] as const,
  list: () => ['research-workspaces'] as const,
} as const;

export const WORKSPACE_STALE_TIME = 30 * 1000; // 30 seconds
export const WORKSPACE_LIST_STALE_TIME = 60 * 1000; // 1 minute
