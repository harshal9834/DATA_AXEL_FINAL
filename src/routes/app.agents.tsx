import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import {
  Search, Globe, Lightbulb, Boxes, Calendar, FileText, Library, Presentation,
  Play, Info, X, Sparkles, ArrowRight, Circle, Loader2, CheckCircle2, TrendingUp,
  Zap, Clock, Activity, BarChart3, Trophy, Rocket,
} from "lucide-react";
import {
  Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis, Area, AreaChart,
} from "recharts";
import { PageHeader } from "../components/app-shell";
import { toast } from "sonner";
import { RunAllAgentsWorkflow } from "../components/RunAllAgentsWorkflow";

export const Route = createFileRoute("/app/agents")({
  head: () => ({
    meta: [
      { title: "AI Agents — Your Intelligent Research Team" },
      { name: "description", content: "8 specialised AI agents that collaborate to turn ideas into implementation-ready projects — research, architecture, docs, and pitch decks." },
      { property: "og:title", content: "AI Agents — Research Copilot" },
      { property: "og:description", content: "Your Intelligent Research & Innovation Team." },
    ],
  }),
  component: AgentsPage,
});

type Status = "Online" | "Busy" | "Thinking" | "Completed";

type Agent = {
  id: string;
  name: string;
  icon: typeof Search;
  short: string;
  status: Status;
  color: string;
  ring: string;
  responsibilities: string[];
  capabilities: string[];
  currentTask: string;
  performance: { runs: number; success: number; avg: string };
  recentOutputs: string[];
  example: string;
};

const agents: Agent[] = [
  {
    id: "research", name: "Research & Discovery Agent", icon: Search, short: "Scans papers, trends, repos and literature to build your foundation.",
    status: "Online", color: "from-blue-500 to-indigo-500", ring: "ring-blue-500/20",
    responsibilities: ["Literature review", "Research gap detection", "Competitor analysis", "Technology trends"],
    capabilities: ["arXiv & Semantic Scholar", "GitHub repositories", "Public datasets", "APIs"],
    currentTask: "Ready for new research query",
    performance: { runs: 428, success: 97, avg: "42s" },
    recentOutputs: ["Literature review v3", "Technology trend analysis", "Dataset shortlists"],
    example: "Reviewed 22 papers on demand-forecasting and compiled 4 GitHub repos and 2 datasets.",
  },
  {
    id: "innovation", name: "Innovation & Strategy Agent", icon: Lightbulb, short: "Finds gaps, evaluates uniqueness, and plans your project sprints.",
    status: "Online", color: "from-fuchsia-500 to-violet-500", ring: "ring-fuchsia-500/20",
    responsibilities: ["Innovation score", "SWOT analysis", "Business strategy", "Roadmap & Milestones"],
    capabilities: ["Gap detection", "Novelty scoring", "Sprint planning", "Risk analysis"],
    currentTask: "Placeholder - Awaiting implementation",
    performance: { runs: 84, success: 91, avg: "38s" },
    recentOutputs: ["Innovation Score 91/100", "4-week roadmap", "SWOT analysis"],
    example: "Identified an under-served niche and split the MVP into 4 sprints with a critical path highlighted.",
  },
  {
    id: "architecture", name: "Architecture & Development Agent", icon: Boxes, short: "Generates system, folder, database, and API architectures.",
    status: "Online", color: "from-emerald-500 to-teal-500", ring: "ring-emerald-500/20",
    responsibilities: ["System Architecture", "Folder Structure", "Database design", "REST APIs"],
    capabilities: ["Mermaid diagrams", "Authentication flows", "CI/CD setups", "Security reviews"],
    currentTask: "Placeholder - Awaiting implementation",
    performance: { runs: 46, success: 98, avg: "56s" },
    recentOutputs: ["System diagram v2", "Postgres schema", "Docker compose"],
    example: "Produced a 3-tier serverless architecture with 12-table schema and API contracts.",
  },
  {
    id: "docs", name: "Documentation & Presentation Agent", icon: Presentation, short: "Writes README, SRS, pitch decks and demo scripts.",
    status: "Online", color: "from-rose-500 to-pink-500", ring: "ring-rose-500/20",
    responsibilities: ["README", "PRD", "SRS", "Pitch deck", "Demo script"],
    capabilities: ["Multi-format export", "Investor pitch tone", "Judge Q&A prep"],
    currentTask: "Placeholder - Awaiting implementation",
    performance: { runs: 112, success: 96, avg: "48s" },
    recentOutputs: ["README v2", "SRS 34 pages", "Investor Pitch Deck v1"],
    example: "Wrote a 12-section SRS matching IEEE-830 template and generated a 14-slide investor deck.",
  }
];

function statusStyle(s: Status) {
  switch (s) {
    case "Online": return { dot: "bg-emerald-500", pill: "bg-emerald-500/10 text-emerald-600", pulse: true };
    case "Busy": return { dot: "bg-amber-500", pill: "bg-amber-500/10 text-amber-600", pulse: true };
    case "Thinking": return { dot: "bg-fuchsia-500", pill: "bg-fuchsia-500/10 text-fuchsia-600", pulse: true };
    case "Completed": return { dot: "bg-blue-500", pill: "bg-blue-500/10 text-blue-600", pulse: false };
  }
}

function AgentsPage() {
  const [selected, setSelected] = useState<Agent | null>(null);
  const [isWorkflowActive, setIsWorkflowActive] = useState(false);

  return (
    <div>
      <PageHeader title="AI Agents" subtitle="Your Intelligent Research & Innovation Team." />

      {/* Hero */}
      <section className="relative mb-8 overflow-hidden rounded-3xl border border-white/70 bg-white/70 p-8 shadow-soft backdrop-blur-xl">
        <div className="pointer-events-none absolute inset-0 bg-glow" />
        <div className="pointer-events-none absolute -top-16 -right-16 h-72 w-72 rounded-full bg-fuchsia-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative flex flex-wrap items-center justify-between gap-8">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-primary">
              <span className="grid h-5 w-5 place-items-center rounded-full bg-primary/10"><Sparkles className="h-3 w-3" /></span>
              4 agents · orchestrated in real time
            </div>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">
              A <span className="text-gradient-brand">specialist team</span> for every idea.
            </h2>
            <p className="mt-3 max-w-lg text-sm text-muted-foreground">
              Deploy a coordinated swarm of research, architecture, documentation and presentation agents. Feed them an idea — get back an implementation-ready project.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <button onClick={() => setIsWorkflowActive(true)} className="flex items-center gap-2 rounded-xl bg-gradient-brand px-4 py-2.5 text-sm font-semibold text-white shadow-glow">
                <Rocket className="h-4 w-4" /> Run all agents
              </button>
              <button className="flex items-center gap-2 rounded-xl border border-border/70 bg-white px-4 py-2.5 text-sm font-semibold hover:bg-accent">
                <Zap className="h-4 w-4 text-primary" /> Configure workflow
              </button>
            </div>
          </div>

          <FloatingAgentsCluster />
        </div>
      </section>

      {/* Agent grid */}
      <section className="mb-10">
        <SectionHeader title="Meet your agents" subtitle="Each agent has a narrow focus and a deep specialisation." />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {agents.map((a, i) => (
            <AgentCard key={a.id} agent={a} delay={i * 0.04} onView={() => setSelected(a)} />
          ))}
        </div>
      </section>

      {/* Workflow */}
      <section className="mb-10">
        <SectionHeader title="AI team workflow" subtitle="From a blank idea to a ready-to-build project — visualised." />
        <Workflow />
      </section>

      {/* Kanban + Activity */}
      <section className="mb-10 grid gap-6 xl:grid-cols-[1fr_340px]">
        <div>
          <SectionHeader title="Active tasks" subtitle="What your agents are working on right now." />
          <Kanban />
        </div>
        <div>
          <SectionHeader title="Live activity" subtitle="A real-time feed from your team." />
          <ActivityFeed />
        </div>
      </section>

      {/* Analytics */}
      <section className="mb-6">
        <SectionHeader title="Team analytics" subtitle="Performance across every specialist." />
        <Analytics />
      </section>

      <AnimatePresence>
        {selected && <AgentModal agent={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>

      {isWorkflowActive && <RunAllAgentsWorkflow onClose={() => setIsWorkflowActive(false)} />}
    </div>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-lg font-bold">{title}</h2>
      <p className="text-xs text-muted-foreground">{subtitle}</p>
    </div>
  );
}

/* ---------- Floating cluster in hero ---------- */
function FloatingAgentsCluster() {
  const set = agents.slice(0, 6);
  return (
    <div className="relative hidden h-52 w-64 shrink-0 md:block">
      {set.map((a, i) => {
        const angle = (i / set.length) * Math.PI * 2;
        const x = 96 + Math.cos(angle) * 82;
        const y = 96 + Math.sin(angle) * 70;
        const Icon = a.icon;
        return (
          <motion.div
            key={a.id}
            className={`absolute grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${a.color} text-white shadow-glow ring-4 ${a.ring}`}
            style={{ left: x, top: y }}
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3 + i * 0.3, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
          >
            <Icon className="h-5 w-5" />
          </motion.div>
        );
      })}
      <motion.div
        className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-2xl bg-gradient-brand text-white shadow-glow"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <Sparkles className="h-6 w-6" />
      </motion.div>
    </div>
  );
}

/* ---------- Agent card ---------- */
function AgentCard({ agent, delay, onView }: { agent: Agent; delay: number; onView: () => void }) {
  const s = statusStyle(agent.status);
  const Icon = agent.icon;
  const navigate = useNavigate();

  const handleRun = () => {
    if (agent.id === "research") {
      navigate({ to: "/app/research" });
    } else if (agent.id === "innovation") {
      navigate({ to: "/app/innovation" });
    } else if (agent.id === "architecture") {
      navigate({ to: "/app/architecture" });
    } else if (agent.id === "docs") {
      navigate({ to: "/app/docs" });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      whileHover={{ y: -4 }}
      className="group relative overflow-hidden rounded-[18px] border border-border/60 bg-white p-5 shadow-soft"
    >
      <div className={`pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${agent.color} opacity-10 blur-2xl transition-opacity group-hover:opacity-25`} />

      <div className="flex items-start justify-between">
        <div className={`grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br ${agent.color} text-white shadow-soft ring-4 ${agent.ring}`}>
          <Icon className="h-5 w-5" />
        </div>
        <span className={`flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold ${s.pill}`}>
          <span className={`relative flex h-1.5 w-1.5`}>
            {s.pulse && <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${s.dot} opacity-60`} />}
            <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${s.dot}`} />
          </span>
          {agent.status}
        </span>
      </div>

      <h3 className="mt-4 text-base font-bold">{agent.name}</h3>
      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{agent.short}</p>

      <div className="mt-4">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Capabilities</div>
        <div className="mt-1.5 flex flex-wrap gap-1">
          {agent.capabilities.slice(0, 3).map((c) => (
            <span key={c} className="rounded-md border border-border/60 bg-muted/40 px-1.5 py-0.5 text-[10px] font-medium">{c}</span>
          ))}
        </div>
      </div>

      <div className="mt-5 flex gap-2">
        <button
          onClick={handleRun}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-brand px-3 py-2 text-xs font-semibold text-white shadow-glow"
        >
          <Play className="h-3.5 w-3.5" /> Run
        </button>
        <button
          onClick={onView}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-border/70 bg-white px-3 py-2 text-xs font-semibold hover:bg-accent"
        >
          <Info className="h-3.5 w-3.5" /> Details
        </button>
      </div>
    </motion.div>
  );
}

/* ---------- Workflow ---------- */
function Workflow() {
  const steps = [
    { label: "Idea", icon: Sparkles, color: "from-slate-500 to-slate-700" },
    { label: "Research & Discovery", icon: Search, color: "from-blue-500 to-indigo-500" },
    { label: "Innovation & Strategy", icon: Lightbulb, color: "from-fuchsia-500 to-violet-500" },
    { label: "Architecture & Dev", icon: Boxes, color: "from-emerald-500 to-teal-500" },
    { label: "Docs & Presentation", icon: Presentation, color: "from-rose-500 to-pink-500" },
    { label: "Ready", icon: Trophy, color: "from-emerald-500 to-lime-500" },
  ];
  return (
    <div className="card-premium relative overflow-x-auto p-6">
      <div className="flex min-w-[900px] items-center gap-3">
        {steps.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="flex flex-1 items-center gap-3">
              <motion.div
                initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                className="flex flex-col items-center gap-2"
              >
                <div className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${s.color} text-white shadow-soft`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="text-[11px] font-semibold">{s.label}</div>
              </motion.div>
              {i < steps.length - 1 && (
                <div className="relative h-0.5 flex-1 rounded-full bg-border">
                  <motion.div
                    initial={{ width: 0 }} whileInView={{ width: "100%" }} viewport={{ once: true }} transition={{ duration: 0.8, delay: i * 0.06 }}
                    className="absolute inset-y-0 left-0 rounded-full bg-gradient-brand"
                  />
                  <motion.div
                    className="absolute -top-1 h-2 w-2 rounded-full bg-gradient-brand shadow-glow"
                    animate={{ left: ["0%", "100%"] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear", delay: i * 0.3 }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Kanban ---------- */
type Task = { agent: string; title: string; progress: number; eta: string; color: string };
const kanban: { col: "Queued" | "Running" | "Completed"; icon: typeof Clock; tasks: Task[] }[] = [
  {
    col: "Queued", icon: Clock, tasks: [
      { agent: "Docs & Presentation", title: "Draft investor deck v2", progress: 0, eta: "~2 min", color: "from-rose-500 to-pink-500" },
    ],
  },
  {
    col: "Running", icon: Loader2, tasks: [
      { agent: "Research & Discovery", title: "Scan 12k sources for benchmarks", progress: 64, eta: "~28 sec", color: "from-blue-500 to-indigo-500" },
      { agent: "Innovation & Strategy", title: "Score 3 candidate approaches", progress: 42, eta: "~35 sec", color: "from-fuchsia-500 to-violet-500" },
    ],
  },
  {
    col: "Completed", icon: CheckCircle2, tasks: [
      { agent: "Architecture & Dev", title: "System diagram v2", progress: 100, eta: "4m ago", color: "from-emerald-500 to-teal-500" },
      { agent: "Research & Discovery", title: "Literature review v3", progress: 100, eta: "23m ago", color: "from-blue-500 to-indigo-500" },
    ],
  },
];

function Kanban() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {kanban.map((col) => {
        const Icon = col.icon;
        return (
          <div key={col.col} className="rounded-[18px] border border-border/60 bg-white/70 p-3 backdrop-blur">
            <div className="mb-3 flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Icon className={`h-4 w-4 ${col.col === "Running" ? "animate-spin text-primary" : col.col === "Completed" ? "text-emerald-500" : "text-muted-foreground"}`} />
                <div className="text-sm font-bold">{col.col}</div>
              </div>
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">{col.tasks.length}</span>
            </div>
            <div className="space-y-2">
              {col.tasks.map((t, i) => (
                <motion.div
                  key={t.title}
                  initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                  className="rounded-2xl border border-border/60 bg-white p-3 shadow-soft"
                >
                  <div className="flex items-center gap-2">
                    <span className={`grid h-6 w-6 place-items-center rounded-lg bg-gradient-to-br ${t.color} text-white`}>
                      <Sparkles className="h-3 w-3" />
                    </span>
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{t.agent}</div>
                  </div>
                  <div className="mt-2 text-xs font-semibold leading-snug">{t.title}</div>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                    <motion.div
                      initial={{ width: 0 }} whileInView={{ width: `${t.progress}%` }} viewport={{ once: true }} transition={{ duration: 0.8 }}
                      className={`h-full rounded-full bg-gradient-to-r ${t.color}`}
                    />
                  </div>
                  <div className="mt-1.5 flex justify-between text-[10px] text-muted-foreground">
                    <span>{t.progress}%</span><span>{t.eta}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------- Activity ---------- */
function ActivityFeed() {
  const items = [
    { t: "Research completed", d: "18 papers synthesised", time: "just now", icon: Search, color: "bg-blue-500" },
    { t: "Architecture generated", d: "System diagram v2 saved", time: "4m", icon: Boxes, color: "bg-emerald-500" },
    { t: "Timeline created", d: "4-week sprint plan", time: "9m", icon: Calendar, color: "bg-amber-500" },
    { t: "Documentation generated", d: "SRS 34 pages exported", time: "12m", icon: FileText, color: "bg-rose-500" },
    { t: "Resources found", d: "12 GitHub repos curated", time: "18m", icon: Library, color: "bg-teal-500" },
    { t: "Innovation score updated", d: "91 / 100 (+3)", time: "24m", icon: TrendingUp, color: "bg-fuchsia-500" },
  ];
  return (
    <div className="card-premium relative overflow-hidden p-5">
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/10 blur-2xl" />
      <div className="relative">
        <div className="mb-4 flex items-center gap-2 text-xs font-semibold text-primary">
          <Activity className="h-3.5 w-3.5" /> Live feed
        </div>
        <ol className="relative space-y-4 border-l border-border/70 pl-4">
          {items.map((it, i) => {
            const Icon = it.icon;
            return (
              <motion.li
                key={it.t}
                initial={{ opacity: 0, x: -8 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                className="relative"
              >
                <span className={`absolute -left-[22px] top-1 grid h-4 w-4 place-items-center rounded-full ${it.color} text-white shadow-soft`}>
                  <Icon className="h-2.5 w-2.5" />
                </span>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-xs font-semibold">{it.t}</div>
                    <div className="text-[11px] text-muted-foreground">{it.d}</div>
                  </div>
                  <span className="text-[10px] text-muted-foreground">{it.time}</span>
                </div>
              </motion.li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

/* ---------- Analytics ---------- */
function Analytics() {
  const tasks = [
    { d: "Mon", v: 12 }, { d: "Tue", v: 18 }, { d: "Wed", v: 22 },
    { d: "Thu", v: 16 }, { d: "Fri", v: 28 }, { d: "Sat", v: 20 }, { d: "Sun", v: 32 },
  ];
  const research = tasks.map((t, i) => ({ d: t.d, v: 10 + i * 4 + (i % 2 ? 2 : 0) }));
  const dist = [
    { name: "90-100", v: 8, c: "#10b981" },
    { name: "80-89", v: 14, c: "#2563eb" },
    { name: "70-79", v: 9, c: "#7c3aed" },
    { name: "60-69", v: 4, c: "#f59e0b" },
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="card-premium p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-muted-foreground">Tasks completed</div>
            <div className="mt-1 text-2xl font-extrabold">148 <span className="text-xs font-semibold text-emerald-600">+18%</span></div>
          </div>
          <BarChart3 className="h-5 w-5 text-primary" />
        </div>
        <div className="mt-4 h-32">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={tasks}>
              <CartesianGrid vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="d" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "#94a3b8" }} />
              <YAxis hide />
              <Tooltip cursor={{ fill: "rgba(37,99,235,0.05)" }} contentStyle={{ border: "1px solid #e5e7eb", borderRadius: 12, fontSize: 11 }} />
              <Bar dataKey="v" radius={[6, 6, 0, 0]} fill="url(#barG)" />
              <defs>
                <linearGradient id="barG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" />
                  <stop offset="100%" stopColor="#7c3aed" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card-premium p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-muted-foreground">Research & documents</div>
            <div className="mt-1 text-2xl font-extrabold">312 <span className="text-xs font-semibold text-emerald-600">+24%</span></div>
          </div>
          <FileText className="h-5 w-5 text-fuchsia-500" />
        </div>
        <div className="mt-4 h-32">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={research}>
              <defs>
                <linearGradient id="areaG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="d" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "#94a3b8" }} />
              <YAxis hide />
              <Tooltip contentStyle={{ border: "1px solid #e5e7eb", borderRadius: 12, fontSize: 11 }} />
              <Area type="monotone" dataKey="v" stroke="#7c3aed" strokeWidth={2} fill="url(#areaG)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card-premium p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-muted-foreground">Innovation score distribution</div>
            <div className="mt-1 text-2xl font-extrabold">35 <span className="text-xs font-normal text-muted-foreground">projects</span></div>
          </div>
          <Trophy className="h-5 w-5 text-amber-500" />
        </div>
        <div className="mt-2 flex items-center gap-3">
          <div className="h-32 w-32 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={dist} dataKey="v" innerRadius={38} outerRadius={58} paddingAngle={2} stroke="none">
                  {dist.map((d) => <Cell key={d.name} fill={d.c} />)}
                </Pie>
                <Tooltip contentStyle={{ border: "1px solid #e5e7eb", borderRadius: 12, fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="flex-1 space-y-1.5">
            {dist.map((d) => (
              <li key={d.name} className="flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ background: d.c }} />
                  {d.name}
                </span>
                <span className="font-semibold">{d.v}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ---------- Modal ---------- */
function AgentModal({ agent, onClose }: { agent: Agent; onClose: () => void }) {
  const s = statusStyle(agent.status);
  const Icon = agent.icon;
  const navigate = useNavigate();

  const handleRun = () => {
    onClose();
    if (agent.id === "research") {
      navigate({ to: "/app/research" });
    } else {
      toast.success(`${agent.name} started`);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-slate-950/30 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.98 }}
        transition={{ type: "spring", damping: 26, stiffness: 300 }}
        className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[min(720px,95vw)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl border border-white/70 bg-white/90 shadow-glow backdrop-blur-2xl"
      >
        <div className={`relative overflow-hidden bg-gradient-to-br ${agent.color} p-6 text-white`}>
          <div className="pointer-events-none absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.4), transparent 40%)" }} />
          <button onClick={onClose} className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-lg bg-white/20 hover:bg-white/30">
            <X className="h-4 w-4" />
          </button>
          <div className="relative flex items-center gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/20 backdrop-blur">
              <Icon className="h-7 w-7" />
            </div>
            <div>
              <div className="text-xs font-semibold opacity-80">Specialist Agent</div>
              <h3 className="text-2xl font-extrabold">{agent.name}</h3>
              <div className="mt-1 flex items-center gap-2">
                <span className={`flex items-center gap-1.5 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                  {agent.status}
                </span>
                <span className="text-[11px] opacity-80">{agent.currentTask}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 overflow-y-auto p-6 md:grid-cols-2" style={{ maxHeight: "calc(90vh - 140px)" }}>
          <div>
            <ModalSection title="Responsibilities">
              <ul className="space-y-1.5">
                {agent.responsibilities.map((r) => (
                  <li key={r} className="flex items-start gap-2 text-xs">
                    <ArrowRight className="mt-0.5 h-3 w-3 shrink-0 text-primary" /> {r}
                  </li>
                ))}
              </ul>
            </ModalSection>
            <ModalSection title="Capabilities">
              <div className="flex flex-wrap gap-1.5">
                {agent.capabilities.map((c) => (
                  <span key={c} className="rounded-lg border border-border/60 bg-white px-2 py-1 text-[11px] font-medium">{c}</span>
                ))}
              </div>
            </ModalSection>
          </div>

          <div>
            <ModalSection title="Performance">
              <div className="grid grid-cols-3 gap-2 text-center">
                <Stat label="Runs" value={agent.performance.runs} />
                <Stat label="Success" value={`${agent.performance.success}%`} />
                <Stat label="Avg time" value={agent.performance.avg} />
              </div>
            </ModalSection>
            <ModalSection title="Recent outputs">
              <ul className="space-y-1.5">
                {agent.recentOutputs.map((o) => (
                  <li key={o} className="flex items-center gap-2 rounded-lg border border-border/60 bg-white px-3 py-2 text-xs">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> {o}
                  </li>
                ))}
              </ul>
            </ModalSection>
            <ModalSection title="Example result">
              <p className="rounded-xl bg-muted/50 p-3 text-xs italic text-muted-foreground">"{agent.example}"</p>
            </ModalSection>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-border/60 bg-white/60 px-6 py-4">
          <button onClick={onClose} className="rounded-xl border border-border/70 bg-white px-4 py-2 text-sm font-medium hover:bg-accent">Close</button>
          <button onClick={handleRun} className="flex items-center gap-2 rounded-xl bg-gradient-brand px-4 py-2 text-sm font-semibold text-white shadow-glow">
            <Play className="h-4 w-4" /> Run agent
          </button>
        </div>
      </motion.div>
    </>
  );
}

function ModalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{title}</div>
      {children}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-border/60 bg-white p-2">
      <div className="text-base font-extrabold">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}
