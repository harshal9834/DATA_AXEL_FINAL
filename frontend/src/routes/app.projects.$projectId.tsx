import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  ArrowLeft, Copy, Download, ChevronDown, Sparkles, Trophy, Zap, Target,
  CheckCircle2, Lock, Code2, LayoutDashboard, Terminal, Archive, Boxes, Database
} from "lucide-react";
import { projects } from "../lib/demo-data";
import { toast } from "sonner";

export const Route = createFileRoute("/app/projects/$projectId")({
  head: ({ params }) => {
    const p = projects.find((x) => x.id === params.projectId);
    return {
      meta: [
        { title: p ? `${p.title} — Copilot` : "Project — Copilot" },
        { name: "description", content: p?.description ?? "Project details" },
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

const ALL_TABS = [
  { id: "Overview", label: "Overview", reqProgress: 0 },
  { id: "Research", label: "Research", reqProgress: 15 },
  { id: "Innovation", label: "Innovation", reqProgress: 35 },
  { id: "Architecture", label: "Architecture", reqProgress: 55 },
  { id: "Backend", label: "Backend", reqProgress: 70 },
  { id: "Frontend", label: "Frontend", reqProgress: 82 },
  { id: "Documentation", label: "Documentation", reqProgress: 92 },
  { id: "Testing", label: "Testing", reqProgress: 97 },
  { id: "Export", label: "Export", reqProgress: 100 },
];

function ProjectDetail() {
  const { project } = Route.useLoaderData() as any;
  const [tab, setTab] = useState("Overview");

  // Mock progress for demo, since we are using static project data for now
  // In a real app this comes from `project.overallProgress` fetched from backend.
  const progress = project.progress || 100;

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
            <Stat icon={Zap} label="Progress" value={`${progress}%`} color="from-blue-500 to-indigo-500" />
            <Stat icon={Target} label="ETA" value="Ready" color="from-fuchsia-500 to-violet-500" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex gap-1 overflow-x-auto rounded-2xl border border-border/60 bg-white/70 p-1 backdrop-blur hide-scrollbar">
        {ALL_TABS.map((t) => {
          const isLocked = progress < t.reqProgress;
          return (
            <button
              key={t.id}
              disabled={isLocked}
              onClick={() => setTab(t.id)}
              className={`relative shrink-0 flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition ${
                isLocked ? "opacity-50 cursor-not-allowed text-muted-foreground" :
                tab === t.id ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === t.id && <motion.span layoutId="tab-pill" className="absolute inset-0 rounded-xl bg-primary/10" />}
              <span className="relative flex items-center gap-1.5">
                {isLocked && <Lock className="h-3 w-3" />}
                {t.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        {tab === "Overview" && <Overview project={project} />}
        {tab === "Research" && <Research />}
        {tab === "Innovation" && <InnovationTab />}
        {tab === "Architecture" && <Placeholder title="Architecture" icon={Boxes} desc="System design, ER diagram, and flow charts." />}
        {tab === "Backend" && <Placeholder title="Backend Source Code" icon={Code2} desc="Express.js server, Prisma schema, controllers, and services." />}
        {tab === "Frontend" && <Placeholder title="Frontend Source Code" icon={LayoutDashboard} desc="React components, pages, and Tailwind styling." />}
        {tab === "Documentation" && <Placeholder title="Documentation" icon={Terminal} desc="README.md, API specs, and SRS documents." />}
        {tab === "Testing" && <Placeholder title="Testing & Validation" icon={CheckCircle2} desc="Jest test results and build logs." />}
        {tab === "Export" && <ExportTab />}
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
          {project.objectives?.map((o: string) => (
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
          {project.users?.map((u: string) => (
            <span key={u} className="rounded-lg border border-border/60 bg-white px-2 py-1 text-[11px] font-medium">{u}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function Research() {
  const cards = [
    { t: "Research Summary", body: "Combining demand-forecasting transformers with a routing engine yields 30-45% waste reduction across 3 published pilots." },
    { t: "Existing Solutions", body: "Too Good To Go (consumer), Copia (US enterprise), Winnow (BOH analytics). None combine forecasting + shelter matching." },
    { t: "Research Gap", body: "No open platform combines real-time surplus prediction with shelter-side demand-matching. Small restaurants under-served." },
  ];
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {cards.map((c) => <ExpandableCard key={c.t} title={c.t} body={c.body} />)}
    </div>
  );
}

function InnovationTab() {
  const cards = [
    { t: "Unique Features", body: "AI-driven demand forecasting, real-time matching algorithm, automated logistics." },
    { t: "Gap Analysis", body: "Currently, surplus food is manually reported. Our system automates detection." },
    { t: "Innovation Score", body: "Score: 92/100. High potential due to novel use of federated learning in this sector." },
  ];
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {cards.map((c) => <ExpandableCard key={c.t} title={c.t} body={c.body} />)}
    </div>
  );
}

function Placeholder({ title, icon: Icon, desc }: { title: string, icon: any, desc: string }) {
  return (
    <div className="card-premium p-12 text-center">
      <Icon className="mx-auto h-10 w-10 text-primary opacity-50" />
      <h3 className="mt-4 text-lg font-bold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
      <div className="mt-6 p-4 bg-muted/30 rounded-xl inline-block max-w-2xl w-full text-left font-mono text-xs text-slate-500 overflow-hidden relative">
         <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/90"></div>
         {`{\n  "status": "generated",\n  "content": "..."\n}`}
      </div>
    </div>
  );
}

function ExportTab() {
  return (
    <div className="card-premium p-8 text-center">
      <Archive className="mx-auto h-12 w-12 text-emerald-500" />
      <h3 className="mt-4 text-2xl font-black">Workflow Completed</h3>
      <p className="mt-2 text-sm text-muted-foreground mb-8">All agents have finished generating the project artifacts.</p>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-8">
         <Stat icon={Sparkles} label="Generated APIs" value={38} color="from-indigo-500 to-purple-500" />
         <Stat icon={Database} label="Database Tables" value={14} color="from-blue-500 to-cyan-500" />
         <Stat icon={LayoutDashboard} label="Frontend Pages" value={21} color="from-pink-500 to-rose-500" />
         <Stat icon={Terminal} label="Backend Files" value={64} color="from-emerald-500 to-teal-500" />
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <button onClick={() => toast.success("Downloading Project ZIP...")} className="flex items-center gap-2 rounded-xl bg-gradient-brand px-6 py-3 text-sm font-bold text-white shadow-glow hover:scale-105 transition">
          <Download className="h-5 w-5" /> Download Complete Project.zip
        </button>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-white p-4 text-center shadow-soft">
      <div className={`mx-auto grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${color} text-white`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="mt-3 text-2xl font-black">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1 font-bold">{label}</div>
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
          <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
        </div>
      )}
    </div>
  );
}
