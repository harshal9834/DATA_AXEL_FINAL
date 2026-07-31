import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Layers, BookOpen, Library, Sparkles, FileText, TrendingUp,
  Sparkle, Rocket, Trophy, Zap, ArrowRight, CheckCircle2, Circle, Loader2,
} from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { projects, stats, researchStages, suggestions } from "../lib/demo-data";

export const Route = createFileRoute("/app/")({
  head: () => ({
    meta: [
      { title: "Dashboard — AI Research Copilot" },
      { name: "description", content: "Your executive AI research dashboard." },
      { property: "og:title", content: "Dashboard — AI Research Copilot" },
      { property: "og:description", content: "Search less. Solve more." },
    ],
  }),
  component: Dashboard,
});

const icons: Record<string, React.ComponentType<{ className?: string }>> = {
  layers: Layers, "book-open": BookOpen, library: Library, sparkles: Sparkles,
  "file-text": FileText, "trending-up": TrendingUp,
};

const gradients = [
  "from-blue-500 to-indigo-500",
  "from-fuchsia-500 to-violet-500",
  "from-cyan-500 to-sky-500",
  "from-amber-500 to-orange-500",
  "from-emerald-500 to-teal-500",
  "from-rose-500 to-pink-500",
];

function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="overflow-hidden rounded-3xl border border-white/70 bg-white/70 p-8 shadow-soft backdrop-blur-xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-primary">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Good Morning, Harshal
            </div>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight md:text-4xl">
              Welcome back — <span className="text-gradient-brand">let's build something big.</span>
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              4 projects in flight • 12 new research signals • 3 hackathons open this month.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 rounded-xl border border-border/70 bg-white px-4 py-2 text-sm font-medium hover:bg-accent">
              <Trophy className="h-4 w-4 text-amber-500" /> Innovation Score 91
            </button>
          </div>
        </div>

        {/* Quick Search */}
        <div className="mt-6">
          <div className="text-xs font-semibold text-muted-foreground">What do you want to build today?</div>
          <div className="relative mt-2">
            <Sparkles className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary" />
            <input
              defaultValue=""
              placeholder="e.g. Build AI for Food Waste"
              className="w-full rounded-2xl border border-border/60 bg-white py-4 pl-12 pr-4 text-base outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 md:pr-72"
            />
            <div className="absolute right-2 top-1/2 hidden -translate-y-1/2 gap-2 md:flex">
              <Link to="/app/projects" className="rounded-xl border border-border/70 bg-white px-3 py-2 text-xs font-medium hover:bg-accent">Recent Projects</Link>
              <button className="flex items-center gap-1.5 rounded-xl bg-gradient-brand px-4 py-2 text-xs font-semibold text-white shadow-glow">
                <Rocket className="h-3.5 w-3.5" /> Generate Project
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="grid gap-4 grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
        {stats.map((s, i) => {
          const Icon = icons[s.icon];
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="card-premium hover-lift p-5"
            >
              <div className="flex items-start justify-between">
                <div className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${gradients[i]} text-white`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-600">{s.delta}</span>
              </div>
              <div className="mt-4 text-2xl font-extrabold tracking-tight">{s.value.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
              <div className="mt-2 h-10">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={s.data.map((v, k) => ({ k, v }))}>
                    <defs>
                      <linearGradient id={`g-${i}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2563eb" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="v" stroke="#2563eb" strokeWidth={2} fill={`url(#g-${i})`} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          );
        })}
      </section>

      {/* Main Grid */}
      <section className="grid gap-6 lg:grid-cols-3">
        {/* Recent Projects */}
        <div className="lg:col-span-2">
          <div className="mb-3 flex items-end justify-between">
            <div>
              <h2 className="text-lg font-bold">Recent Projects</h2>
              <p className="text-xs text-muted-foreground">Continue where you left off.</p>
            </div>
            <Link to="/app/projects" className="text-xs font-semibold text-primary hover:underline">View all →</Link>
          </div>
          <div className="space-y-3">
            {projects.slice(0, 4).map((p) => (
              <Link to="/app/projects/$projectId" params={{ projectId: p.id }} key={p.id}
                className="card-premium hover-lift block p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-sm font-bold">{p.title}</h3>
                      <StatusBadge s={p.status} />
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                      <span>Domain: <span className="font-medium text-foreground">{p.domain}</span></span>
                      <span>Research: <span className="font-medium text-foreground">{p.research}%</span></span>
                      <span>Updated {p.updated}</span>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    <button className="rounded-lg bg-gradient-brand px-3 py-1.5 text-xs font-semibold text-white shadow-glow">Continue</button>
                    <button className="rounded-lg border border-border/70 bg-white px-3 py-1.5 text-xs font-medium hover:bg-accent">Open</button>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="mb-1 flex justify-between text-[11px] text-muted-foreground">
                    <span>Progress</span><span>{p.progress}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <motion.div
                      initial={{ width: 0 }} animate={{ width: `${p.progress}%` }} transition={{ duration: 1 }}
                      className="h-full rounded-full bg-gradient-brand"
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* AI Suggestions */}
        <aside className="space-y-4">
          <div className="card-premium p-5">
            <h3 className="flex items-center gap-2 text-sm font-bold">
              <Sparkle className="h-4 w-4 text-primary" /> Today's Recommendations
            </h3>
            <ul className="mt-3 space-y-2">
              {suggestions.today.map((s) => (
                <li key={s} className="flex items-start gap-2 text-xs">
                  <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="card-premium p-5">
            <h3 className="flex items-center gap-2 text-sm font-bold">
              <TrendingUp className="h-4 w-4 text-fuchsia-500" /> Trending Technologies
            </h3>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {suggestions.trending.map((t) => (
                <span key={t} className="rounded-lg border border-border/60 bg-white px-2 py-1 text-[11px] font-medium">{t}</span>
              ))}
            </div>
          </div>

          <div className="card-premium p-5">
            <h3 className="flex items-center gap-2 text-sm font-bold">
              <BookOpen className="h-4 w-4 text-cyan-500" /> Latest Research
            </h3>
            <ul className="mt-3 space-y-2 text-xs">
              {suggestions.research.map((r) => <li key={r} className="text-muted-foreground">• {r}</li>)}
            </ul>
          </div>

          <div className="card-premium p-5">
            <h3 className="flex items-center gap-2 text-sm font-bold">
              <Trophy className="h-4 w-4 text-amber-500" /> Hackathon Opportunities
            </h3>
            <ul className="mt-3 space-y-2">
              {suggestions.hackathons.map((h) => (
                <li key={h.name} className="flex items-center justify-between text-xs">
                  <div>
                    <div className="font-medium">{h.name}</div>
                    <div className="text-[11px] text-muted-foreground">{h.date}</div>
                  </div>
                  <span className="rounded-full bg-gradient-to-r from-amber-500/10 to-rose-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-600">{h.prize}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </section>

      {/* Research Progress Timeline */}
      <section className="card-premium p-6">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <h2 className="text-lg font-bold">Research Progress</h2>
            <p className="text-xs text-muted-foreground">AI for Food Waste Reduction — end-to-end pipeline</p>
          </div>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">3/8 stages complete</span>
        </div>
        <div className="relative">
          <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-border md:left-1/2 md:-translate-x-1/2" />
          <div className="space-y-4">
            {researchStages.map((s, i) => {
              const Icon = s.status === "done" ? CheckCircle2 : s.status === "active" ? Loader2 : Circle;
              const color = s.status === "done" ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
                          : s.status === "active" ? "text-primary bg-primary/10 border-primary/20"
                          : "text-muted-foreground bg-muted border-border";
              return (
                <motion.div
                  key={s.key}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  className={`relative flex items-center gap-4 md:justify-${i % 2 ? "end" : "start"} md:pr-0`}
                >
                  <div className={`flex items-center gap-3 rounded-xl border bg-white p-3 shadow-soft md:w-[46%] ${i % 2 ? "md:mr-auto" : ""}`}>
                    <div className={`grid h-9 w-9 place-items-center rounded-lg border ${color}`}>
                      <Icon className={`h-4 w-4 ${s.status === "active" ? "animate-spin" : ""}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold">{s.label}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {s.status === "done" ? "Completed" : s.status === "active" ? "In progress" : "Pending"}
                      </div>
                    </div>
                    {s.status === "done" && (
                      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">✓ Done</span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

function StatusBadge({ s }: { s: string }) {
  const map: Record<string, string> = {
    "In Progress": "bg-blue-500/10 text-blue-600",
    "Research": "bg-fuchsia-500/10 text-fuchsia-600",
    "Architecture": "bg-cyan-500/10 text-cyan-600",
    "Completed": "bg-emerald-500/10 text-emerald-600",
  };
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${map[s]}`}>{s}</span>;
}
