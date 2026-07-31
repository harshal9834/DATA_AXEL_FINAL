import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ReactNode } from "react";
import {
  TrendingUp, BarChart3, PieChart, Activity, Zap, Code2, Layers, CheckCircle2,
  Clock, AlertCircle, ArrowRight, Download, Filter, RefreshCw, Settings, Info,
  BadgeCheck, FlaskConical, Bot, FolderKanban
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, PieChart as RechartsPie, Pie, Cell, 
  AreaChart, Area, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from "recharts";
import {
  useKPIMetrics,
  useProjectTrends,
  useProjectStatus,
  useDomainDistribution,
  useTechStack,
  useTopProjects,
  useRecentProjects,
  useProjectInsights,
  useProductivityGraph,
  useResearchTrends,
  useTokenUsage,
  useVoiceAnalytics,
  useRecentActivity,
  useLatestResearch
} from "../hooks/useAnalyticsDashboard";
import { PageSectionSkeleton, MetricsGridSkeleton } from "../components/LoadingSkeletons";

export const Route = createFileRoute("/app/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics Dashboard — AI Research Copilot" },
      { name: "description", content: "Real-time project analytics and insights." },
    ],
  }),
  component: AnalyticsDashboard,
});

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

interface KPICardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  trend: string;
}

function KPICard({ label, value, icon, trend }: KPICardProps) {
  return (
    <div className="card-premium p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-sm">{label}</span>
        {icon}
      </div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-emerald-600 font-medium">{trend}</div>
    </div>
  );
}

function AnalyticsDashboard() {
  const {
    data: kpi,
    isLoading: kpiLoading,
    error: kpiError
  } = useKPIMetrics();

  const {
    data: projectTrends,
    isLoading: trendsLoading
  } = useProjectTrends('weekly');

  const {
    data: projectStatus,
    isLoading: statusLoading
  } = useProjectStatus();

  const {
    data: domains,
    isLoading: domainsLoading
  } = useDomainDistribution();

  const {
    data: techStack,
    isLoading: techLoading
  } = useTechStack();

  const {
    data: topProjects,
    isLoading: topProjLoading
  } = useTopProjects('completion', 5);

  const {
    data: recentProjects,
    isLoading: recentProjLoading
  } = useRecentProjects(8);

  const {
    data: insights,
    isLoading: insightsLoading
  } = useProjectInsights();

  const {
    data: productivity,
    isLoading: productivityLoading
  } = useProductivityGraph(12);

  const {
    data: researchTrends,
    isLoading: researchLoading
  } = useResearchTrends('weekly');

  const {
    data: tokenUsage,
    isLoading: tokensLoading
  } = useTokenUsage(30);

  const {
    data: voiceAnalytics,
    isLoading: voiceLoading
  } = useVoiceAnalytics();

  const {
    data: activity,
    isLoading: activityLoading
  } = useRecentActivity(15);

  const {
    data: latestResearch,
    isLoading: researchLoading2
  } = useLatestResearch(3);

  if (kpiError) {
    return (
      <div className="p-6 rounded-lg bg-red-50 border border-red-200 text-red-800">
        <AlertCircle className="h-5 w-5 mb-2" />
        <p>Failed to load analytics. Please refresh the page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <section className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Real-time insights into your AI projects</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border/70 hover:bg-accent text-sm">
            <Filter className="h-4 w-4" /> Filter
          </button>
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border/70 hover:bg-accent text-sm">
            <Download className="h-4 w-4" /> Export
          </button>
        </div>
      </section>

      {/* KPI Cards Grid */}
      <section className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
        {kpiLoading ? (
          <MetricsGridSkeleton />
        ) : kpi ? (
          <>
            <KPICard label="Total Projects" value={kpi.totalProjects} icon={<FolderKanban className="h-6 w-6 text-indigo-500" />} trend="+12%" />
            <KPICard label="Completed" value={kpi.completedProjects} icon={<BadgeCheck className="h-6 w-6 text-emerald-500" />} trend="+8%" />
            <KPICard label="Running" value={kpi.runningProjects} icon={<Zap className="h-6 w-6 text-amber-500" />} trend="+5%" />
            <KPICard label="Research" value={kpi.researchReports} icon={<FlaskConical className="h-6 w-6 text-blue-500" />} trend="+24%" />
            <KPICard label="AI Sessions" value={kpi.aiSessions} icon={<Bot className="h-6 w-6 text-purple-500" />} trend="+31%" />
            <KPICard label="Avg Complete" value={`${kpi.avgCompletion}%`} icon={<TrendingUp className="h-6 w-6 text-emerald-500" />} trend="+3%" />
          </>
        ) : null}
      </section>

      {/* Main Charts */}
      <section className="grid gap-6 lg:grid-cols-3">
        {/* Project Trends */}
        <div className="lg:col-span-2 card-premium p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg">Projects Created (Weekly)</h2>
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
          {trendsLoading ? (
            <PageSectionSkeleton height="h-72" />
          ) : projectTrends && projectTrends.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={projectTrends}>
                <defs>
                  <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="created" stroke="#3b82f6" fillOpacity={1} fill="url(#colorCreated)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-72 flex items-center justify-center text-muted-foreground">No data</div>
          )}
        </div>

        {/* Project Status */}
        <div className="card-premium p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg">Project Status</h2>
            <PieChart className="h-5 w-5 text-primary" />
          </div>
          {statusLoading ? (
            <PageSectionSkeleton height="h-72" />
          ) : projectStatus && projectStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPie>
                <Pie data={projectStatus} dataKey="value" cx="50%" cy="50%" labelLine={false} label={(entry: any) => entry.name} outerRadius={80}>
                  {projectStatus.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPie>
            </ResponsiveContainer>
          ) : (
            <div className="h-72 flex items-center justify-center text-muted-foreground">No data</div>
          )}
        </div>
      </section>

      {/* Research & Token Usage */}
      <section className="grid gap-6 lg:grid-cols-2">
        {/* Research Trends */}
        <div className="card-premium p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg">Research Generated (Weekly)</h2>
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          {researchLoading ? (
            <PageSectionSkeleton height="h-64" />
          ) : researchTrends && researchTrends.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={researchTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="generated" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">No data</div>
          )}
        </div>

        {/* Token Usage */}
        <div className="card-premium p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg">Token Usage (Last 30 Days)</h2>
            <Zap className="h-5 w-5 text-primary" />
          </div>
          {tokensLoading ? (
            <PageSectionSkeleton height="h-64" />
          ) : tokenUsage && tokenUsage.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={tokenUsage}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" style={{ fontSize: '12px' }} />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="tokens" stroke="#ec4899" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">No data</div>
          )}
        </div>
      </section>

      {/* Domain & Tech Stack */}
      <section className="grid gap-6 lg:grid-cols-2">
        {/* Domain Distribution */}
        <div className="card-premium p-6">
          <h2 className="font-bold text-lg mb-4">Domain Distribution</h2>
          {domainsLoading ? (
            <PageSectionSkeleton height="h-80" />
          ) : domains && domains.length > 0 ? (
            <div className="space-y-3">
              {domains.slice(0, 8).map((domain: any, i: number) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{domain.domain}</span>
                      <span className="text-muted-foreground">{domain.count}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(domain.count * 15, 100)}%` }}
                        transition={{ duration: 0.8 }}
                        className={`h-full rounded-full`}
                        style={{ backgroundColor: COLORS[i % COLORS.length] }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-muted-foreground">No data</div>
          )}
        </div>

        {/* Tech Stack */}
        <div className="card-premium p-6">
          <h2 className="font-bold text-lg mb-4">Tech Stack Analytics</h2>
          {techLoading ? (
            <PageSectionSkeleton height="h-80" />
          ) : techStack && techStack.length > 0 ? (
            <div className="space-y-2">
              {techStack.slice(0, 10).map((tech: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-accent transition-colors">
                  <span className="font-medium text-sm">{tech.name}</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">{tech.usage} uses</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-muted-foreground">No data</div>
          )}
        </div>
      </section>

      {/* Top Projects & Insights */}
      <section className="grid gap-6 lg:grid-cols-2">
        {/* Top Projects */}
        <div className="card-premium p-6">
          <h2 className="font-bold text-lg mb-4">Top 5 Projects</h2>
          {topProjLoading ? (
            <div className="space-y-3">{Array(5).fill(0).map((_, i) => <PageSectionSkeleton key={i} height="h-12" />)}</div>
          ) : topProjects && topProjects.length > 0 ? (
            <div className="space-y-3">
              {topProjects.map((proj: any, i: number) => (
                <div key={i} className="p-3 rounded-lg border border-border/60 hover:border-primary/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{proj.title}</p>
                      <p className="text-xs text-muted-foreground">{proj.domain}</p>
                    </div>
                    <span className="text-xs font-bold text-primary">{proj.overallProgress}%</span>
                  </div>
                  <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${proj.overallProgress}%` }}
                      transition={{ duration: 0.8 }}
                      className="h-full bg-gradient-brand rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-muted-foreground">No projects yet</div>
          )}
        </div>

        {/* Insights */}
        <div className="card-premium p-6">
          <h2 className="font-bold text-lg mb-4">AI Insights</h2>
          {insightsLoading ? (
            <div className="space-y-3">{Array(4).fill(0).map((_, i) => <PageSectionSkeleton key={i} height="h-16" />)}</div>
          ) : insights && insights.length > 0 ? (
            <div className="space-y-3">
              {insights.map((insight: any, i: number) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-3 rounded-lg bg-gradient-to-r from-primary/10 to-transparent border border-primary/20"
                >
                  <div className="flex items-start gap-2">
                    <span className="text-lg">{insight.emoji}</span>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-muted-foreground">{insight.title}</p>
                      <p className="text-sm font-semibold truncate">{insight.value}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-muted-foreground">No insights generated</div>
          )}
        </div>
      </section>

      {/* Productivity & Voice Analytics */}
      <section className="grid gap-6 lg:grid-cols-2">
        {/* Productivity */}
        <div className="card-premium p-6">
          <h2 className="font-bold text-lg mb-4">Productivity (12 Weeks)</h2>
          {productivityLoading ? (
            <PageSectionSkeleton height="h-64" />
          ) : productivity && productivity.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={productivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" style={{ fontSize: '11px' }} />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">No data</div>
          )}
        </div>

        {/* Voice Analytics */}
        <div className="card-premium p-6">
          <h2 className="font-bold text-lg mb-4">Voice Analytics</h2>
          {voiceLoading ? (
            <PageSectionSkeleton height="h-64" />
          ) : voiceAnalytics ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Sessions</p>
                <p className="text-3xl font-bold">{voiceAnalytics.totalSessions}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Duration</p>
                <p className="text-3xl font-bold">{voiceAnalytics.avgDuration} min</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Speaking Time</p>
                <p className="text-3xl font-bold">{voiceAnalytics.totalSpeakingTime} min</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Accuracy</p>
                <p className="text-3xl font-bold">{voiceAnalytics.accuracyRate}%</p>
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">No voice data</div>
          )}
        </div>
      </section>

      {/* Activity Timeline & Recent Projects */}
      <section className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <div className="card-premium p-6">
          <h2 className="font-bold text-lg mb-4">Recent Activity</h2>
          {activityLoading ? (
            <div className="space-y-2">{Array(8).fill(0).map((_, i) => <PageSectionSkeleton key={i} height="h-10" />)}</div>
          ) : activity && activity.length > 0 ? (
            <div className="space-y-3">
              {activity.slice(0, 10).map((item: any, i: number) => (
                <div key={i} className="flex items-start gap-3 pb-3 border-b border-border/30 last:border-0">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0`} style={{ backgroundColor: item.color }} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.workflowName}</p>
                    <p className="text-xs text-muted-foreground">{new Date(item.timestamp).toLocaleTimeString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-muted-foreground">No activity yet</div>
          )}
        </div>

        {/* Latest Research */}
        <div className="card-premium p-6">
          <h2 className="font-bold text-lg mb-4">Latest Research</h2>
          {researchLoading2 ? (
            <div className="space-y-3">{Array(3).fill(0).map((_, i) => <PageSectionSkeleton key={i} height="h-20" />)}</div>
          ) : latestResearch && latestResearch.length > 0 ? (
            <div className="space-y-3">
              {latestResearch.map((research: any, i: number) => (
                <div key={i} className="p-3 rounded-lg border border-border/60 hover:border-primary/50 transition-colors">
                  <p className="font-medium text-sm line-clamp-2">{research.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{research.authors} • {research.source}</p>
                  {research.url && (
                    <a href={research.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline mt-2 inline-block">
                      View Paper →
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-muted-foreground">No research papers yet</div>
          )}
        </div>
      </section>

      {/* Recent Projects Table */}
      <section className="card-premium p-6">
        <h2 className="font-bold text-lg mb-4">Recent Projects</h2>
        {recentProjLoading ? (
          <div className="space-y-2">{Array(8).fill(0).map((_, i) => <PageSectionSkeleton key={i} height="h-12" />)}</div>
        ) : recentProjects && recentProjects.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60">
                  <th className="text-left py-2 px-3 font-medium">Project</th>
                  <th className="text-left py-2 px-3 font-medium">Status</th>
                  <th className="text-left py-2 px-3 font-medium">Progress</th>
                  <th className="text-left py-2 px-3 font-medium">Updated</th>
                  <th className="text-right py-2 px-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {recentProjects.map((proj: any, i: number) => (
                  <tr key={i} className="border-b border-border/30 hover:bg-accent transition-colors">
                    <td className="py-3 px-3">
                      <p className="font-medium truncate">{proj.title}</p>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        proj.status === 'COMPLETED' ? 'bg-green-500/10 text-green-600' :
                        proj.status === 'RUNNING' ? 'bg-blue-500/10 text-blue-600' :
                        'bg-amber-500/10 text-amber-600'
                      }`}>
                        {proj.status}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden max-w-32">
                          <div
                            className="h-full bg-gradient-brand rounded-full"
                            style={{ width: `${proj.overallProgress}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium">{proj.overallProgress}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-muted-foreground">
                      {new Date(proj.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Link to="/app/projects/$projectId" params={{ projectId: proj.id }} className="text-primary hover:underline text-xs">
                        Open →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex items-center justify-center h-40 text-muted-foreground">No recent projects</div>
        )}
      </section>
    </div>
  );
}

// ─── END COMPONENT ─────────────────────────────────────────────────────────
