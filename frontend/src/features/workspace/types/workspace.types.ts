// ─── Workspace Core Types ─────────────────────────────────────────────────────

export type WorkspaceStatus = 'CREATED' | 'RESEARCHING' | 'COMPLETED' | 'FAILED';

export type WorkspaceTabId =
  | 'research'
  | 'papers'
  | 'github'
  | 'datasets'
  | 'architecture'
  | 'er'
  | 'flow'
  | 'docs'
  | 'srs'
  | 'api';

export type MainTabId = 'search' | 'workspace';

export type DiagramTabId = 'architecture' | 'er' | 'flow';

// ─── Tab Content Status ────────────────────────────────────────────────────────

export type TabContentStatus = 'pending' | 'generating' | 'ready' | 'error';

export interface TabContentState<T = null> {
  status: TabContentStatus;
  data: T;
  generatedAt: string | null;
  updatedAt: string | null;
  isGenerating: boolean;
  error: string | null;
}

// ─── Workspace Item Types ──────────────────────────────────────────────────────

export interface ResearchPaper {
  id: string;
  title: string;
  authors: string | null;
  publishedYear: number | null;
  summary: string | null;
  url: string | null;
  keyFindings: string[] | null;
  applications: string[] | null;
}

export interface GitHubRepository {
  id: string;
  repoName: string;
  description: string | null;
  url: string | null;
  stars: number | null;
  language: string | null;
  owner: string | null;
  updatedDate: string | null;
}

export interface Dataset {
  id: string;
  title: string;
  description: string | null;
  url: string | null;
  rows: number | null;
  columns: number | null;
  license: string | null;
  datasource: string | null;
}

export interface WorkspaceItem {
  id: string;
  workspaceId: string;
  type: 'PAPER' | 'GITHUB' | 'DATASET';
  title: string;
  description: string | null;
  url: string | null;
  // Paper-specific
  authors: string | null;
  publishedYear: number | null;
  summary: string | null;
  keyFindings: string | null;
  applications: string | null;
  // GitHub-specific
  repoName: string | null;
  stars: number | null;
  language: string | null;
  owner: string | null;
  updatedDate: string | null;
  // Dataset-specific
  rows: number | null;
  columns: number | null;
  downloadSource: string | null;
  license: string | null;
  datasource: string | null;
  // Metadata
  relevanceScore: number;
  confidence: number;
  createdAt: string;
}

// ─── Research Workspace ────────────────────────────────────────────────────────

export interface ResearchWorkspace {
  id: string;
  userId: string;
  projectName: string;
  problemStatement: string;
  status: WorkspaceStatus;
  // Generated content
  research: string | null;
  architecture: string | null;
  erDiagram: string | null;
  flowDiagram: string | null;
  srsDocument: string | null;
  documentation: string | null;
  apiDatabaseDesign: string | null;
  // PDF exports
  documentationPdfUrl: string | null;
  srsPdfUrl: string | null;
  // Progress
  currentStage: string | null;
  progress: number;
  totalStages: number;
  error: string | null;
  // Timestamps
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  // Relations
  items: WorkspaceItem[];
}

// ─── API Response Types ────────────────────────────────────────────────────────

export interface CreateWorkspaceResponse {
  success: boolean;
  workspaceId: string;
  message: string;
}

export interface ListWorkspacesResponse {
  success: boolean;
  count: number;
  workspaces: ResearchWorkspace[];
}

// ─── UI State Types ────────────────────────────────────────────────────────────

export interface WorkspaceUIState {
  mainTab: MainTabId;
  workspaceTab: WorkspaceTabId;
  activeWorkspaceId: string | null;
  fullscreenDiagram: DiagramTabId | null;
}
