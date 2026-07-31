import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Search, Bookmark, ExternalLink, Sparkles, Clock } from "lucide-react";
import { useState } from "react";
import { deepSearchResults } from "../lib/demo-data";
import { PageHeader } from "../components/app-shell";
import { toast } from "sonner";

export const Route = createFileRoute("/app/deepsearch")({
  head: () => ({
    meta: [
      { title: "DeepSearch — AI Research Copilot" },
      { name: "description", content: "Deep, multi-source AI research across papers, code, datasets and news." },
      { property: "og:title", content: "DeepSearch — AI Research Copilot" },
      { property: "og:description", content: "One search across every source that matters." },
    ],
  }),
  component: DeepSearch,
});

const filters = ["All", "Research Papers", "GitHub", "Datasets", "Documentation", "News", "Government"];
const history = [
  "Transformer forecasting for food demand",
  "Federated learning on edge devices",
  "Multimodal medical reasoning",
  "Small language models for agents",
];

function DeepSearch() {
  const [q, setQ] = useState("AI to reduce restaurant food waste");
  const [active, setActive] = useState("All");
  const results = active === "All" ? deepSearchResults : deepSearchResults.filter((r) => r.source.includes(active.split(" ")[0]));

  return (
    <div>
      <PageHeader title="DeepSearch" subtitle="AI-powered search across papers, code, datasets and government sources." />

      <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
        <div>
          <div className="card-premium relative p-2">
            <div className="flex items-center gap-2 rounded-xl bg-white p-2">
              <Sparkles className="ml-2 h-5 w-5 text-primary" />
              <input value={q} onChange={(e) => setQ(e.target.value)}
                className="flex-1 bg-transparent py-2 text-base outline-none"
                placeholder="Ask anything — synthesize across 100M+ sources..."
              />
              <button className="rounded-xl bg-gradient-brand px-4 py-2 text-sm font-semibold text-white shadow-glow">
                <Search className="mr-1 inline h-4 w-4" /> Search
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {filters.map((f) => (
              <button key={f} onClick={() => setActive(f)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${
                  active === f ? "border-primary/40 bg-primary/10 text-primary" : "border-border/70 bg-white hover:bg-accent"
                }`}>{f}</button>
            ))}
          </div>

          <div className="mt-5 space-y-3">
            {results.map((r, i) => (
              <motion.div key={r.title} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="card-premium hover-lift p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="rounded-lg bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">{r.source}</span>
                      <span className="text-[11px] text-muted-foreground">{r.citation}</span>
                    </div>
                    <h3 className="mt-2 text-base font-bold leading-snug">{r.title}</h3>
                    <p className="mt-1.5 text-sm text-muted-foreground">{r.summary}</p>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <button className="rounded-lg border border-border/70 bg-white p-2 hover:bg-accent" onClick={() => toast.success("Saved")}>
                      <Bookmark className="h-3.5 w-3.5" />
                    </button>
                    <button className="rounded-lg bg-gradient-brand p-2 text-white shadow-glow">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="card-premium p-5">
            <h3 className="flex items-center gap-2 text-sm font-bold"><Clock className="h-4 w-4 text-primary" /> Search History</h3>
            <ul className="mt-3 space-y-1.5">
              {history.map((h) => (
                <li key={h}>
                  <button onClick={() => setQ(h)} className="w-full truncate rounded-lg px-2 py-1.5 text-left text-xs text-muted-foreground hover:bg-accent hover:text-foreground">
                    {h}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="card-premium bg-gradient-to-br from-primary/5 via-fuchsia-500/5 to-cyan-500/5 p-5">
            <h3 className="text-sm font-bold">💡 Pro Tip</h3>
            <p className="mt-2 text-xs text-muted-foreground">Combine filters to focus results. Try Research Papers + Datasets for reproducible baselines.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
