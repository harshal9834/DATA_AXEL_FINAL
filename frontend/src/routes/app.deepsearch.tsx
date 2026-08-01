import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, FileText, Sparkles, Loader2, 
  ExternalLink, Clock, CheckCircle2, Play, Download, BrainCircuit, Lightbulb, Activity 
} from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../components/app-shell';
import { MermaidRenderer } from "../components/MermaidRenderer";
import { executeAgent } from "../lib/server/ai";

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

const filters = ["Research Papers", "GitHub", "Datasets", "Diagrams", "News", "Government"];
const history = [
  "Future of Agentic AI and Multi-Agent Systems",
  "Transformer forecasting for food demand",
  "Small language models for edge computing",
];

// ─── Page ─────────────────────────────────────────────────────────────────────

function DeepSearch() {
  // HEAD states
  const [mainTab, setMainTab] = useState<MainTabId | 'agent'>('search');
  const [workspaceTab, setWorkspaceTab] = useState<WorkspaceTabId>('research');
  const [projectName, setProjectName] = useState('');
  const [problemStatement, setProblemStatement] = useState('');
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null);

  const createMutation = useCreateWorkspace();
  const workspaceQuery = useWorkspace(activeWorkspaceId ?? '');

  const workspace = workspaceQuery.data;

  // deepsearchupdtaed states
  const [q, setQ] = useState("");
  const [activeTopic, setActiveTopic] = useState("");
  const [activeCategory, setActiveCategory] = useState("Research Papers");
  
  // Cache for the centralized research session
  const [sessionData, setSessionData] = useState<Record<string, any>>({});
  
  // Loading state
  const [isLoading, setIsLoading] = useState(false);
  const [statusSteps, setStatusSteps] = useState<{ step: string; status: 'loading' | 'done' }[]>([]);
  const [error, setError] = useState<string | null>(null);

  // HEAD functions
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

  // deepsearchupdtaed functions
  const performSearch = async (category: string, topic: string, forceNew: boolean = false) => {
    if (!topic.trim()) {
      toast.error("Please enter a research topic");
      return;
    }
    
    if (!forceNew && sessionData[category]) return;

    setIsLoading(true);
    setError(null);
    setStatusSteps([]);

    try {
      setStatusSteps([{ step: `Analyzing requirement for ${category}`, status: 'loading' }]);
      
      const schemas: Record<string, string> = {
        'Research Papers': `{ "results": [{ "title": "string", "authors": "string", "publication": "string", "year": "string", "aiSummary": "string", "keyContributions": "string", "whyRelevant": "string", "citation": "string", "url": "string" }] }`,
        'GitHub': `{ "results": [{ "repositoryName": "string", "description": "string", "language": "string", "stars": "number", "lastUpdated": "string", "whyUseful": "string", "url": "string" }] }`,
        'Datasets': `{ "results": [{ "datasetName": "string", "source": "string", "description": "string", "suggestedUse": "string", "aiRecommendation": "string", "url": "string" }] }`,
        'Diagrams': `{ "aiReasoning": "string", "mermaidCode": "string (valid mermaid JS syntax, no markdown formatting inside the string)" }`,
        'News': `{ "results": [{ "headline": "string", "source": "string", "date": "string", "summary": "string", "impact": "string", "url": "string" }] }`,
        'Government': `{ "results": [{ "policyName": "string", "agency": "string", "date": "string", "summary": "string", "impactOnIndustry": "string", "url": "string" }] }`
      };

      const prompt = `Conduct deep research on the topic: "${topic}" specifically for the category: "${category}". 
You must strictly return ONLY a raw JSON object matching this schema:
${schemas[category] || schemas['Research Papers']}

Do NOT wrap the response in markdown blocks. Return ONLY valid JSON.`;

      const response = await executeAgent({
        data: {
          agent: "researcher",
          prompt: prompt,
          projectId: "deepsearch-session"
        }
      });

      setStatusSteps([{ step: `Analyzing requirement for ${category}`, status: 'done' }, { step: `Structuring insights and generating response`, status: 'loading' }]);
      
      const data = JSON.parse(response);

      setSessionData(prev => ({
        ...prev,
        [category]: data
      }));
      
      setStatusSteps(prev => prev.map(p => ({ ...p, status: 'done' as const })));
      setIsLoading(false);
      
      // Update history if not present
      if (!history.includes(topic)) {
         // In a real app we'd update a global store or state, for now we rely on the UI cache
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to connect to DeepSearch AI');
      setIsLoading(false);
    }
  };

  const handleInitialSearch = () => {
    setActiveTopic(q);
    setSessionData({}); // Clear session on entirely new search
    performSearch(activeCategory, q, true); // Force new search to ignore stale sessionData
  };

  const handleTabChange = (category: string) => {
    setActiveCategory(category);
    if (activeTopic) {
      performSearch(category, activeTopic);
    }
  };

  const renderReasoning = (reasoning: any) => {
    if (!reasoning) return null;
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-premium relative overflow-hidden mb-6 p-1">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <BrainCircuit className="w-32 h-32" />
        </div>
        <div className="relative bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5 rounded-[20px] p-6 z-10 border border-white/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-brand p-2 rounded-xl text-white shadow-glow">
              <Sparkles className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">AI Reasoning & Analysis</h2>
            <div className="ml-auto flex flex-col items-end">
              <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Reliability Score</span>
              <span className="text-xl font-black text-primary">{reasoning.reliabilityScore}/100</span>
            </div>
          </div>
          
          <p className="text-slate-600 text-sm leading-relaxed mb-6">{reasoning.summary}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-3">
                <Lightbulb className="w-4 h-4 text-emerald-500" /> Key Insights
              </h3>
              <ul className="space-y-2">
                {reasoning.keyInsights?.map((item: string, i: number) => (
                  <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                    <span className="mt-1.5 w-1 h-1 rounded-full bg-emerald-500 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-3">
                <Activity className="w-4 h-4 text-primary" /> Recommendations
              </h3>
              <ul className="space-y-2">
                {reasoning.actionableRecommendations?.map((item: string, i: number) => (
                  <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                    <span className="mt-1.5 w-1 h-1 rounded-full bg-primary shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="mt-6 p-4 rounded-xl bg-white/60 border border-white backdrop-blur-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Suggested Next Step</h3>
            <p className="text-sm font-medium text-slate-800">{reasoning.suggestedNextStep}</p>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderResults = () => {
    const data = sessionData[activeCategory];
    if (!data || !data.results) return null;

    return (
      <div className="space-y-4">
        {data.results.map((r: any, i: number) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="card-premium hover-lift p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                {/* Category specific headers */}
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <span className="rounded-lg bg-primary/10 px-2.5 py-1 text-[10px] font-bold tracking-wide text-primary">
                    {activeCategory}
                  </span>
                  {(r.publication || r.source || r.publisher || r.department) && (
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-1 rounded-md">
                      {r.publication || r.source || r.publisher || r.department}
                    </span>
                  )}
                  {(r.year || r.lastUpdated || r.date) && (
                    <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {r.year || r.lastUpdated || r.date}
                    </span>
                  )}
                  {r.stars !== undefined && (
                    <span className="text-[11px] font-medium text-amber-600 flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-md border border-amber-200/50">
                      ⭐ {r.stars}
                    </span>
                  )}
                  {r.language && (
                    <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 border border-blue-200/50 px-2 py-1 rounded-md">
                      {r.language}
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold leading-snug text-slate-900 mb-2">
                  {r.title || r.repositoryName || r.datasetName || r.diagramTitle || r.headline}
                </h3>
                
                {r.authors && <p className="text-xs font-medium text-slate-500 mb-3">{r.authors}</p>}

                {/* Main description / summary */}
                <p className="text-sm text-slate-600 leading-relaxed">
                  {r.aiSummary || r.description || r.summary || r.aiExplanation}
                </p>

                {/* Sub-sections */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(r.keyContributions || r.suggestedUse) && (
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <p className="text-xs font-bold text-slate-800 mb-1">Key Context</p>
                      <p className="text-xs text-slate-600">{r.keyContributions || r.suggestedUse}</p>
                    </div>
                  )}
                  {(r.whyRelevant || r.whyUseful || r.aiRecommendation || r.whyMatters || r.whyImportant) && (
                    <div className="bg-primary/5 p-3 rounded-lg border border-primary/10">
                      <p className="text-xs font-bold text-primary mb-1">AI Recommendation</p>
                      <p className="text-xs text-slate-600">{r.whyRelevant || r.whyUseful || r.aiRecommendation || r.whyMatters || r.whyImportant}</p>
                    </div>
                  )}
                </div>

                {/* Diagram Renderer */}
                {activeCategory === "Diagrams" && r.mermaidCode && (
                  <div className="mt-6 mb-2">
                    <MermaidRenderer code={r.mermaidCode} />
                  </div>
                )}
                
                {r.citation && (
                  <p className="mt-4 text-[10px] text-slate-400 font-mono">Cite: {r.citation}</p>
                )}
              </div>
              
              {r.url && (
                <a href={r.url} target="_blank" rel="noreferrer" className="shrink-0 flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-slate-800 hover:-translate-y-0.5 transition-all">
                  <span className="hidden sm:inline">Open</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    );
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
        <button
          onClick={() => setMainTab('agent')}
          className={`px-4 py-3 font-medium border-b-2 transition-colors ${
            mainTab === 'agent'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <BrainCircuit className="inline mr-2 h-4 w-4" />
          Agentic Search
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

      {/* Agent Tab */}
      {mainTab === 'agent' && (
        <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
          <div>
            {/* Search Bar */}
            <div className="card-premium relative p-2 mb-6">
              <div className="flex items-center gap-2 rounded-xl bg-white p-2">
                <Sparkles className="ml-2 h-5 w-5 text-primary" />
                <input 
                  value={q} 
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleInitialSearch()}
                  className="flex-1 bg-transparent py-2 text-base outline-none"
                  placeholder="Search any topic for a centralized deep dive..."
                />
                <button 
                  onClick={handleInitialSearch}
                  disabled={isLoading || !q.trim()}
                  className="rounded-xl bg-gradient-brand px-4 py-2 text-sm font-semibold text-white shadow-glow disabled:opacity-50 hover:-translate-y-0.5 transition-transform"
                >
                  <Search className="mr-1 inline h-4 w-4" /> Search
                </button>
              </div>
            </div>

            {/* Categories / Tabs */}
            <div className="flex flex-wrap gap-2 mb-8 p-1">
              {filters.map((f) => (
                <button 
                  key={f} 
                  onClick={() => handleTabChange(f)}
                  disabled={!activeTopic && !isLoading}
                  className={`relative rounded-xl border px-4 py-2 text-sm font-bold transition-all duration-300 ${
                    activeCategory === f 
                      ? "border-primary/30 bg-white text-primary shadow-[0_4px_20px_-4px_rgba(168,85,247,0.4)] ring-1 ring-primary/20 scale-105 z-10" 
                      : "border-border/60 bg-slate-50/50 text-slate-500 hover:bg-white hover:text-slate-800 hover:shadow-sm"
                  }`}
                >
                  {f}
                  {sessionData[f] && activeCategory !== f && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
                  )}
                </button>
              ))}
            </div>

            {/* Error State */}
            {error && (
              <div className="p-6 text-center text-red-500 bg-red-50 rounded-2xl border border-red-100 mb-6 font-medium">
                {error}
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="flex min-h-[40vh] flex-col items-center justify-center p-8">
                <div className="w-full max-w-md">
                  <div className="mb-8 flex items-center justify-center gap-3">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-violet-600 to-purple-500 shadow-lg shadow-purple-500/30">
                      <BrainCircuit className="h-6 w-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">Researching {activeCategory}</h2>
                  </div>
                  
                  <div className="flex flex-col gap-4">
                    <AnimatePresence>
                      {statusSteps.map((s, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          className={`flex items-center gap-4 rounded-xl border p-4 shadow-sm transition-colors ${
                            s.status === 'done' ? 'bg-white border-emerald-100' : 'bg-purple-50/50 border-purple-100'
                          }`}
                        >
                          <div className="shrink-0">
                            {s.status === 'done' ? (
                              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                            ) : (
                              <Loader2 className="h-5 w-5 animate-spin text-purple-500" />
                            )}
                          </div>
                          <span className={`font-medium ${s.status === 'done' ? 'text-slate-700' : 'text-purple-700'}`}>
                            {s.step}
                          </span>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            )}

            {/* Results State */}
            {!isLoading && sessionData[activeCategory] && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {renderReasoning(sessionData[activeCategory].aiReasoning)}
                {renderResults()}
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !sessionData[activeCategory] && !activeTopic && (
              <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                  <Search className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Centralized AI Research</h3>
                <p className="text-sm text-slate-500 max-w-sm">Enter a topic above to initiate a deep research session. We will synthesize insights across all domains.</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-4 hidden lg:block">
            <div className="card-premium p-5 sticky top-6">
              <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800">
                <FileText className="h-4 w-4 text-primary" /> Active Session
              </h3>
              {activeTopic ? (
                <div className="mt-4">
                  <div className="bg-primary/5 border border-primary/10 rounded-lg p-3">
                    <p className="text-xs font-bold text-primary mb-1">Topic</p>
                    <p className="text-sm font-medium text-slate-800 leading-snug">{activeTopic}</p>
                  </div>
                  
                  <div className="mt-4">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Cached Domains</p>
                    <div className="flex flex-wrap gap-1.5">
                      {filters.map(f => (
                        <span key={f} className={`text-[10px] px-2 py-1 rounded-md font-semibold ${
                          sessionData[f] ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'
                        }`}>
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-xs text-slate-500">No active research session. Search above to begin.</p>
              )}

              <hr className="my-5 border-slate-100" />

              <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800"><Clock className="h-4 w-4 text-primary" /> Recent Searches</h3>
              <ul className="mt-3 space-y-1.5">
                {history.map((h) => (
                  <li key={h}>
                    <button 
                      onClick={() => { setQ(h); setActiveTopic(h); setSessionData({}); performSearch(activeCategory, h); }} 
                      className="w-full truncate rounded-lg px-2 py-1.5 text-left text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                    >
                      {h}
                    </button>
                  </li>
                ))}
              </ul>

              <div className="mt-6 bg-gradient-to-br from-primary/5 via-fuchsia-500/5 to-cyan-500/5 p-4 rounded-xl border border-white">
                <h3 className="text-sm font-bold text-slate-800">💡 Deep Research</h3>
                <p className="mt-2 text-[11px] text-slate-500 leading-relaxed">
                  Every category uses the same centralized context. Switching tabs will generate insights specifically for that domain without losing track of your original research goal.
                </p>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
