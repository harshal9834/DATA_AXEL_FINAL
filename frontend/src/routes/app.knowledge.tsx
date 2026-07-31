import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { clusters } from "../lib/demo-data";
import { PageHeader } from "../components/app-shell";

export const Route = createFileRoute("/app/knowledge")({
  head: () => ({
    meta: [
      { title: "Knowledge Clustering — AI Research Copilot" },
      { name: "description", content: "Interactive knowledge graph across research, tech, datasets and APIs." },
      { property: "og:title", content: "Knowledge Clustering — AI Research Copilot" },
      { property: "og:description", content: "See your research organised as a living graph." },
    ],
  }),
  component: Knowledge,
});

function Knowledge() {
  const cx = 400, cy = 260, r = 180;
  return (
    <div>
      <PageHeader title="Knowledge Clustering" subtitle="A living, breathing map of everything your copilot has learned." />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="card-premium relative overflow-hidden p-6">
          <div className="pointer-events-none absolute inset-0 bg-glow" />
          <svg viewBox="0 0 800 520" className="relative w-full">
            {/* central node */}
            <defs>
              <radialGradient id="core" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#2563eb" />
                <stop offset="100%" stopColor="#7c3aed" />
              </radialGradient>
            </defs>

            {clusters.map((c, i) => {
              const angle = (i / clusters.length) * Math.PI * 2 - Math.PI / 2;
              const x = cx + Math.cos(angle) * r;
              const y = cy + Math.sin(angle) * r;
              return (
                <g key={c.name}>
                  <motion.line
                    x1={cx} y1={cy} x2={x} y2={y}
                    stroke={c.color} strokeWidth={1.5} strokeDasharray="4 4" opacity={0.4}
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: i * 0.1 }}
                  />
                  <motion.circle
                    cx={x} cy={y} r={44} fill="white" stroke={c.color} strokeWidth={2}
                    initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 + i * 0.08, type: "spring" }}
                  />
                  <text x={x} y={y - 2} textAnchor="middle" className="fill-foreground text-[11px] font-bold">{c.name}</text>
                  <text x={x} y={y + 12} textAnchor="middle" className="fill-muted-foreground text-[9px]">{c.items.length} items</text>
                </g>
              );
            })}

            <circle cx={cx} cy={cy} r={70} fill="url(#core)" opacity={0.15} />
            <circle cx={cx} cy={cy} r={54} fill="url(#core)" />
            <text x={cx} y={cy - 4} textAnchor="middle" className="fill-white text-sm font-bold">Food Waste</text>
            <text x={cx} y={cy + 12} textAnchor="middle" className="fill-white/80 text-[10px]">Root Cluster</text>
          </svg>
        </div>

        <aside className="space-y-3">
          {clusters.map((c) => (
            <div key={c.name} className="card-premium p-4">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full" style={{ background: c.color }} />
                <div className="text-sm font-bold">{c.name}</div>
                <span className="ml-auto text-[11px] text-muted-foreground">{c.items.length}</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {c.items.map((i) => (
                  <span key={i} className="rounded-md border border-border/60 bg-white px-1.5 py-0.5 text-[10px] font-medium">{i}</span>
                ))}
              </div>
            </div>
          ))}
        </aside>
      </div>
    </div>
  );
}
