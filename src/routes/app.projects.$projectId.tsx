import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  ArrowLeft, Copy, Download, ChevronDown, Sparkles, Trophy, Zap, Target,
  CheckCircle2, Loader2, Circle,
} from "lucide-react";
import { projects, researchStages, timeline, resources } from "../lib/demo-data";
import { toast } from "sonner";

export const Route = createFileRoute("/app/projects/$projectId")({
  head: ({ params }) => {
    const p = projects.find((x) => x.id === params.projectId);
    return {
      meta: [
        { title: p ? `${p.title} — Copilot` : "Project — Copilot" },
        { name: "description", content: p?.description ?? "Project details" },
        { property: "og:title", content: p?.title ?? "Project" },
        { property: "og:description", content: p?.description ?? "" },
      ],
    };
  },
  loader: ({ params }) => {
    const project = projects.find((p) => p.id === params.projectId);
    if (!project) throw notFound();
    return { project };
  },
  component: ProjectDetail,
});

const tabs = ["Overview", "Research", "Architecture", "Resources", "Timeline", "Documentation", "AI Chat"] as const;

function ProjectDetail() {
  const { project } = Route.useLoaderData() as any;
  const [tab, setTab] = useState<(typeof tabs)[number]>("Overview");

  return (
    <div>
      <Link to="/app/projects" className="mb-4 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> All projects
      </Link>

      {/* Hero */}
      <div className="overflow-hidden rounded-3xl border border-white/70 bg-white/70 p-8 shadow-soft backdrop-blur-xl">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">{project.domain}</span>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">{project.status}</span>
              <span className="rounded-full bg-fuchsia-500/10 px-2 py-0.5 text-[10px] font-semibold text-fuchsia-600">{project.difficulty}</span>
            </div>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">{project.title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{project.description}</p>
          </div>
          <div className="grid grid-cols-3 gap-3 md:grid-cols-3">
            <Stat icon={Trophy} label="Innovation" value={project.innovation} color="from-amber-500 to-orange-500" />
            <Stat icon={Zap} label="Progress" value={`${project.progress}%`} color="from-blue-500 to-indigo-500" />
            <Stat icon={Target} label="ETA" value="2w" color="from-fuchsia-500 to-violet-500" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex gap-1 overflow-x-auto rounded-2xl border border-border/60 bg-white/70 p-1 backdrop-blur">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`relative shrink-0 rounded-xl px-4 py-2 text-sm font-medium transition ${
              tab === t ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab === t && <motion.span layoutId="tab-pill" className="absolute inset-0 rounded-xl bg-primary/10" />}
            <span className="relative">{t}</span>
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "Overview" && <Overview project={project} />}
        {tab === "Research" && <Research />}
        {tab === "Architecture" && <ArchitecturePlaceholder />}
        {tab === "Resources" && <ResourcesTab />}
        {tab === "Timeline" && <TimelineTab />}
        {tab === "Documentation" && <DocsPlaceholder />}
        {tab === "AI Chat" && <ChatPlaceholder />}
      </div>
    </div>
  );
}

function Overview({ project }: { project: any }) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="card-premium p-6 lg:col-span-2">
        <h3 className="text-sm font-bold">Objectives</h3>
        <ul className="mt-3 space-y-2">
          {project.objectives.map((o: string) => (
            <li key={o} className="flex items-start gap-2 text-sm">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
              <span>{o}</span>
            </li>
          ))}
        </ul>
        <h3 className="mt-6 text-sm font-bold">Expected Outcome</h3>
        <p className="mt-2 text-sm text-muted-foreground">{project.outcome}</p>
      </div>
      <div className="card-premium p-6">
        <h3 className="text-sm font-bold">Target Users</h3>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {project.users.map((u: string) => (
            <span key={u} className="rounded-lg border border-border/60 bg-white px-2 py-1 text-[11px] font-medium">{u}</span>
          ))}
        </div>
        <h3 className="mt-6 text-sm font-bold">Key Metrics</h3>
        <div className="mt-3 space-y-3">
          {[
            { label: "Research Depth", v: project.research },
            { label: "Prototype Readiness", v: project.progress },
            { label: "Innovation", v: project.innovation },
          ].map((m) => (
            <div key={m.label}>
              <div className="flex justify-between text-[11px] text-muted-foreground"><span>{m.label}</span><span>{m.v}%</span></div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-gradient-brand" style={{ width: `${m.v}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Research() {
  const cards = [
    { t: "Problem Validation", body: "Interviewed 12 restaurant managers; 10 confirmed 20-40% surplus. Willingness to pay: $99/mo per location." },
    { t: "Research Summary", body: "Combining demand-forecasting transformers with a routing engine yields 30-45% waste reduction across 3 published pilots." },
    { t: "Existing Solutions", body: "Too Good To Go (consumer), Copia (US enterprise), Winnow (BOH analytics). None combine forecasting + shelter matching." },
    { t: "Research Gap", body: "No open platform combines real-time surplus prediction with shelter-side demand-matching. Small restaurants under-served." },
    { t: "Innovation Suggestions", body: "Federated learning across restaurant chains + edge inference on POS terminals for privacy-preserving forecasts." },
  ];
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {cards.map((c) => <ExpandableCard key={c.t} title={c.t} body={c.body} />)}
    </div>
  );
}

function TimelineTab() {
  return (
    <div className="space-y-4">
      {timeline.map((w) => (
        <div key={w.week} className="card-premium p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-primary">{w.week}</div>
              <h3 className="text-base font-bold">{w.title}</h3>
            </div>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{w.pct}%</span>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-gradient-brand" style={{ width: `${w.pct}%` }} />
          </div>
          <ul className="mt-4 grid gap-2 md:grid-cols-3">
            {w.items.map((i, idx) => {
              const done = idx < Math.round((w.pct / 100) * w.items.length);
              return (
                <li key={i} className="flex items-center gap-2 text-xs">
                  {done ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <Circle className="h-3.5 w-3.5 text-muted-foreground" />}
                  <span className={done ? "" : "text-muted-foreground"}>{i}</span>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}

function ResourcesTab() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {resources.slice(0, 6).map((r) => (
        <div key={r.title} className="card-premium hover-lift overflow-hidden">
          <div className={`h-24 bg-gradient-to-br ${r.color}`} />
          <div className="p-4">
            <div className="text-[10px] font-semibold uppercase text-muted-foreground">{r.cat}</div>
            <div className="mt-1 text-sm font-bold">{r.title}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ArchitecturePlaceholder() {
  return (
    <div className="card-premium p-8 text-center">
      <Sparkles className="mx-auto h-8 w-8 text-primary" />
      <h3 className="mt-3 text-base font-bold">System Architecture</h3>
      <p className="mt-1 text-sm text-muted-foreground">Open the Architecture page to view generated diagrams.</p>
      <Link to="/app/architecture" className="mt-4 inline-block rounded-xl bg-gradient-brand px-4 py-2 text-xs font-semibold text-white shadow-glow">Open Architecture</Link>
    </div>
  );
}

function DocsPlaceholder() {
  return (
    <div className="card-premium p-8 text-center">
      <h3 className="text-base font-bold">Documentation</h3>
      <p className="mt-1 text-sm text-muted-foreground">README, SRS, Architecture, API Docs and more.</p>
      <Link to="/app/docs" className="mt-4 inline-block rounded-xl bg-gradient-brand px-4 py-2 text-xs font-semibold text-white shadow-glow">Open Documentation</Link>
    </div>
  );
}

function ChatPlaceholder() {
  return (
    <div className="card-premium p-8 text-center">
      <h3 className="text-base font-bold">Project Chat</h3>
      <p className="mt-1 text-sm text-muted-foreground">Use the floating AI Assistant to chat with this project's context.</p>
    </div>
  );
}

function Stat({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-white p-3 text-center shadow-soft">
      <div className={`mx-auto grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br ${color} text-white`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="mt-2 text-lg font-extrabold">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}

function ExpandableCard({ title, body }: { title: string; body: string }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="card-premium overflow-hidden">
      <button onClick={() => setOpen((v) => !v)} className="flex w-full items-center justify-between p-5 text-left">
        <h3 className="text-sm font-bold">{title}</h3>
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="px-5 pb-5">
          <p className="text-sm text-muted-foreground">{body}</p>
          <div className="mt-3 flex gap-2">
            <button onClick={() => { navigator.clipboard.writeText(body); toast.success("Copied to clipboard"); }} className="flex items-center gap-1.5 rounded-lg border border-border/70 bg-white px-2.5 py-1 text-[11px] font-medium hover:bg-accent">
              <Copy className="h-3 w-3" /> Copy
            </button>
            <button onClick={() => toast.success("Exported to PDF")} className="flex items-center gap-1.5 rounded-lg border border-border/70 bg-white px-2.5 py-1 text-[11px] font-medium hover:bg-accent">
              <Download className="h-3 w-3" /> Export
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
