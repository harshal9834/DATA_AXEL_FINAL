import { createFileRoute, Link, Outlet, useMatches } from "@tanstack/react-router";
import { Plus, Search as SearchIcon } from "lucide-react";
import { motion } from "framer-motion";
import { projects } from "../lib/demo-data";
import { PageHeader } from "../components/app-shell";

export const Route = createFileRoute("/app/projects")({
  head: () => ({
    meta: [
      { title: "Projects — AI Research Copilot" },
      { name: "description", content: "Manage your AI research projects." },
      { property: "og:title", content: "Projects — AI Research Copilot" },
      { property: "og:description", content: "Track every project end-to-end." },
    ],
  }),
  component: ProjectsLayout,
});

function ProjectsLayout() {
  const matches = useMatches();
  const isDetail = matches.some((m) => m.routeId === "/app/projects/$projectId");
  if (isDetail) return <Outlet />;

  return (
    <div>
      <PageHeader
        title="Projects"
        subtitle="All your research projects in one place — pinned, filtered and searchable."
        action={
          <button className="flex items-center gap-2 rounded-xl bg-gradient-brand px-4 py-2 text-sm font-semibold text-white shadow-glow">
            <Plus className="h-4 w-4" /> New Project
          </button>
        }
      />
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[240px]">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input placeholder="Search projects..." className="w-full rounded-xl border border-border/70 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10" />
        </div>
        {["All", "In Progress", "Research", "Architecture", "Completed"].map((f) => (
          <button key={f} className={`rounded-lg border px-3 py-2 text-xs font-medium ${f === "All" ? "border-primary/40 bg-primary/10 text-primary" : "border-border/70 bg-white hover:bg-accent"}`}>{f}</button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {projects.map((p, i) => (
          <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <Link to="/app/projects/$projectId" params={{ projectId: p.id }} className="card-premium hover-lift block p-5">
              <div className="flex items-start justify-between">
                <span className="rounded-lg bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">{p.domain}</span>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">{p.status}</span>
              </div>
              <h3 className="mt-3 text-base font-bold leading-snug">{p.title}</h3>
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{p.description}</p>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[10px]">
                <div className="rounded-lg bg-muted/50 py-1.5"><div className="font-bold text-foreground">{p.research}%</div><div className="text-muted-foreground">Research</div></div>
                <div className="rounded-lg bg-muted/50 py-1.5"><div className="font-bold text-foreground">{p.innovation}</div><div className="text-muted-foreground">Innovation</div></div>
                <div className="rounded-lg bg-muted/50 py-1.5"><div className="font-bold text-foreground">{p.difficulty}</div><div className="text-muted-foreground">Level</div></div>
              </div>
              <div className="mt-4">
                <div className="mb-1 flex justify-between text-[10px] text-muted-foreground">
                  <span>Progress</span><span>{p.progress}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-gradient-brand" style={{ width: `${p.progress}%` }} />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
