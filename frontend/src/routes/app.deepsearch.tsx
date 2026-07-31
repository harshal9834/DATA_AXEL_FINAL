import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Search, FileText, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../components/app-shell';

// ─── Feature imports (single source of truth) ─────────────────────────────────
import {
  // Hooks
  useCreateWorkspace,
  useWorkspace,
  // Components
  WorkspaceLoading,
  WorkspaceError,
  WorkspaceProgressCard,
  WorkspaceTabNav,
  // Tabs
  ResearchTab,
  PapersTab,
  GitHubTab,
  DatasetsTab,
  ArchitectureTab,
  ERDiagramTab,
  FlowDiagramTab,
  DocumentationTab,
  SRSTab,
  APIDesignTab,
  // Types
  type WorkspaceTabId,
  type MainTabId,
  // Constants
  EXAMPLE_PROJECTS,
} from '../features/workspace';

// ─── Route ────────────────────────────────────────────────────────────────────

export const Route = createFileRoute('/app/deepsearch')({
  head: () => ({
    meta: [
      { title: 'DeepSearch — AI Research Workspace' },
      { name: 'description', content: 'AI-powered research workspace for project analysis and documentation.' },
    ],
  }),
  component: DeepSearch,
});

// ─── Page ─────────────────────────────────────────────────────────────────────

function DeepSearch() {
  const [mainTab, setMainTab] = useState<MainTabId>('search');
  const [workspaceTab, setWorkspaceTab] = useState<WorkspaceTabId>('research');
  const [projectName, setProjectName] = useState('');
  const [problemStatement, setProblemStatement] = useState('');
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null);

  const createMutation = useCreateWorkspace();
  const workspaceQuery = useWorkspace(activeWorkspaceId ?? '');

  const workspace = workspaceQuery.data;

  const handleStartResearch = async () => {
    if (!projectName.trim() || !problemStatement.trim()) {
      toast.error('Please enter both project name and problem statement');
      return;
    }
    try {
      const result = await createMutation.mutateAsync({ projectName, problemStatement });
      setActiveWorkspaceId(result.workspaceId);
      setMainTab('workspace');
      toast.success('Research started! Generating comprehensive analysis...');
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to start research';
      toast.error(msg);
    }
  };

  const handleExampleClick = (example: { name: string; problem: string }) => {
    setProjectName(example.name);
    setProblemStatement(example.problem);
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="DeepSearch"
        subtitle="AI Research Workspace powered by Gemini"
      />

      {/* Main Tab Navigator */}
      <div className="flex gap-2 border-b border-border/50">
        <button
          onClick={() => setMainTab('search')}
          className={`px-4 py-3 font-medium border-b-2 transition-colors ${
            mainTab === 'search'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Search className="inline mr-2 h-4 w-4" />
          New Research
        </button>
        <button
          onClick={() => setMainTab('workspace')}
          disabled={!activeWorkspaceId}
          className={`px-4 py-3 font-medium border-b-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            mainTab === 'workspace'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <FileText className="inline mr-2 h-4 w-4" />
          Workspace
        </button>
      </div>

      {/* Search Tab */}
      {mainTab === 'search' && (
        <div className="space-y-6">
          <div className="card-premium p-8">
            <h2 className="text-2xl font-bold mb-2">Start a New Research Project</h2>
            <p className="text-muted-foreground mb-6">
              Enter your project idea and let AI generate comprehensive research, architecture, and documentation.
            </p>

            <div className="space-y-4">
              <div>
                <label htmlFor="project-name" className="text-sm font-medium mb-2 block">
                  Project Name
                </label>
                <input
                  id="project-name"
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g., Food Waste Management System"
                  className="w-full px-4 py-2 rounded-lg border border-border/70 bg-white focus:outline-none focus:ring-2 focus:ring-primary dark:bg-transparent"
                />
              </div>

              <div>
                <label htmlFor="problem-statement" className="text-sm font-medium mb-2 block">
                  Problem Statement
                </label>
                <textarea
                  id="problem-statement"
                  value={problemStatement}
                  onChange={(e) => setProblemStatement(e.target.value)}
                  placeholder="Describe the problem your project solves..."
                  rows={5}
                  className="w-full px-4 py-2 rounded-lg border border-border/70 bg-white focus:outline-none focus:ring-2 focus:ring-primary dark:bg-transparent"
                />
              </div>

              <button
                onClick={handleStartResearch}
                disabled={createMutation.isPending}
                className="w-full py-3 rounded-lg bg-gradient-brand text-white font-semibold hover:shadow-lg disabled:opacity-75 disabled:cursor-not-allowed transition-shadow flex items-center justify-center gap-2"
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Starting Research...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Start Research Analysis
                  </>
                )}
              </button>
            </div>

            {/* Example Projects */}
            <div className="mt-8 pt-8 border-t border-border/30">
              <p className="text-xs text-muted-foreground font-medium mb-3 uppercase tracking-wide">
                Example Projects
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                {EXAMPLE_PROJECTS.map((example) => (
                  <button
                    key={example.name}
                    onClick={() => handleExampleClick(example)}
                    className="p-2 rounded-lg border border-border/70 hover:bg-accent text-left text-xs transition-colors"
                  >
                    {example.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Workspace Tab */}
      {mainTab === 'workspace' && activeWorkspaceId && (
        <>
          {/* Loading */}
          {workspaceQuery.isLoading && (
            <WorkspaceLoading message="Loading workspace..." />
          )}

          {/* Error */}
          {workspaceQuery.isError && (
            <WorkspaceError
              message={
                workspaceQuery.error instanceof Error
                  ? workspaceQuery.error.message
                  : 'Failed to load workspace'
              }
              onRetry={() => workspaceQuery.refetch()}
            />
          )}

          {/* Workspace Content */}
          {workspace && (
            <div className="space-y-6">
              {/* Progress Card */}
              <WorkspaceProgressCard workspace={workspace} />

              {/* Sub-Tab Navigator */}
              <WorkspaceTabNav
                activeTab={workspaceTab}
                onTabChange={setWorkspaceTab}
              />

              {/* Tab Content */}
              <div className="space-y-6">
                {workspaceTab === 'research' && <ResearchTab workspace={workspace} />}
                {workspaceTab === 'papers' && <PapersTab workspace={workspace} />}
                {workspaceTab === 'github' && <GitHubTab workspace={workspace} />}
                {workspaceTab === 'datasets' && <DatasetsTab workspace={workspace} />}
                {workspaceTab === 'architecture' && <ArchitectureTab workspace={workspace} />}
                {workspaceTab === 'er' && <ERDiagramTab workspace={workspace} />}
                {workspaceTab === 'flow' && <FlowDiagramTab workspace={workspace} />}
                {workspaceTab === 'docs' && <DocumentationTab workspace={workspace} />}
                {workspaceTab === 'srs' && <SRSTab workspace={workspace} />}
                {workspaceTab === 'api' && <APIDesignTab workspace={workspace} />}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
