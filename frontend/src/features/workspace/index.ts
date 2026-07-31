// ─── Workspace Feature Public API ─────────────────────────────────────────────
// Single import point for the entire workspace feature.
// Phase 2 only needs to extend this barrel.

export * from './types/workspace.types';
export * from './constants/workspace.constants';
export * from './api/workspace.api';
export * from './hooks/useWorkspace';
export * from './components/WorkspaceStates';
export * from './components/WorkspaceProgressCard';
export * from './components/WorkspaceTabNav';
export * from './tabs/ResearchTab';
export * from './tabs/PapersTab';
export * from './tabs/GitHubTab';
export * from './tabs/DatasetsTab';
export * from './tabs/DiagramTabs';
export * from './tabs/DocumentationTabs';
export * from './tabs/APIDesignTab';
