import { createFileRoute } from "@tanstack/react-router";
import { Bookmark } from "lucide-react";
import { useState } from "react";
import { resources } from "../lib/demo-data";
import { PageHeader } from "../components/app-shell";
import { toast } from "sonner";

export const Route = createFileRoute("/app/resources")({
  head: () => ({
    meta: [
      { title: "Resources — AI Research Copilot" },
      { name: "description", content: "Curated GitHub, papers, datasets, courses and more." },
      { property: "og:title", content: "Resources — AI Research Copilot" },
      { property: "og:description", content: "Everything you need in one library." },
    ],
  }),
  component: Resources,
});

const cats = ["All", "GitHub", "Research Papers", "Datasets", "Courses", "Videos", "Blogs", "API Libraries"];

function Resources() {
  const [cat, setCat] = useState("All");
  const items = cat === "All" ? resources : resources.filter((r) => r.cat === cat);
  return (
    <div>
      <PageHeader title="Resources" subtitle="Hand-picked GitHub repos, papers, datasets, courses and blogs." />
      <div className="mb-6 flex flex-wrap gap-2">
        {cats.map((c) => (
          <button key={c} onClick={() => setCat(c)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${cat === c ? "border-primary/40 bg-primary/10 text-primary" : "border-border/70 bg-white hover:bg-accent"}`}>
            {c}
          </button>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((r) => (
          <div key={r.title} className="card-premium hover-lift overflow-hidden">
            <div className={`relative h-32 bg-gradient-to-br ${r.color}`}>
              <button onClick={() => toast.success("Bookmarked")} className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-white/80 text-primary hover:bg-white">
                <Bookmark className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between text-[10px] font-semibold uppercase text-muted-foreground">
                <span>{r.cat}</span>
                <span className="rounded-full bg-muted px-1.5 py-0.5">{r.difficulty}</span>
              </div>
              <div className="mt-1.5 text-sm font-bold leading-snug">{r.title}</div>
              <div className="mt-2 flex flex-wrap gap-1">
                {r.tags.map((t) => <span key={t} className="rounded bg-primary/5 px-1.5 py-0.5 text-[10px] font-medium text-primary">{t}</span>)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
