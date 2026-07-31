import { motion } from 'framer-motion';

// ─── Metric Card Skeleton ───────────────────────────────────────────────────
export function MetricCardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0.5 }}
      animate={{ opacity: 1 }}
      transition={{ repeat: Infinity, duration: 1.5 }}
      className="card-premium p-5 space-y-4"
    >
      <div className="flex items-start justify-between">
        <div className="h-10 w-10 rounded-xl bg-slate-200" />
        <div className="h-6 w-12 rounded-full bg-slate-200" />
      </div>
      <div className="h-8 w-16 rounded bg-slate-200" />
      <div className="h-4 w-20 rounded bg-slate-200" />
      <div className="h-10 rounded bg-slate-200" />
    </motion.div>
  );
}

// ─── Metric Grid Skeleton ───────────────────────────────────────────────────
export function MetricsGridSkeleton() {
  return (
    <div className="grid gap-4 grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
      {Array(6).fill(0).map((_, i) => (
        <MetricCardSkeleton key={i} />
      ))}
    </div>
  );
}

// ─── Project Card Skeleton ──────────────────────────────────────────────────
export function ProjectCardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0.5 }}
      animate={{ opacity: 1 }}
      transition={{ repeat: Infinity, duration: 1.5 }}
      className="card-premium p-5 space-y-4"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="h-4 w-48 rounded bg-slate-200 mb-2" />
          <div className="space-y-1">
            <div className="h-3 w-64 rounded bg-slate-100" />
            <div className="h-3 w-48 rounded bg-slate-100" />
          </div>
        </div>
        <div className="flex gap-1.5">
          <div className="h-8 w-16 rounded bg-slate-200" />
          <div className="h-8 w-16 rounded bg-slate-200" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-1.5 rounded-full bg-slate-200" />
      </div>
    </motion.div>
  );
}

// ─── Project List Skeleton ──────────────────────────────────────────────────
export function ProjectListSkeleton() {
  return (
    <div className="space-y-3">
      {Array(4).fill(0).map((_, i) => (
        <ProjectCardSkeleton key={i} />
      ))}
    </div>
  );
}

// ─── Recommendation Panel Skeleton ──────────────────────────────────────────
export function RecommendationPanelSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0.5 }}
      animate={{ opacity: 1 }}
      transition={{ repeat: Infinity, duration: 1.5 }}
      className="card-premium p-5 space-y-3"
    >
      <div className="h-4 w-32 rounded bg-slate-200 mb-3" />
      {Array(3).fill(0).map((_, i) => (
        <div key={i} className="flex gap-2">
          <div className="h-3 w-3 rounded bg-slate-200 mt-1.5 flex-shrink-0" />
          <div className="flex-1 h-3 rounded bg-slate-200" />
        </div>
      ))}
    </motion.div>
  );
}

// ─── Sidebar Skeleton ───────────────────────────────────────────────────────
export function SidebarSkeleton() {
  return (
    <aside className="space-y-4">
      {Array(4).fill(0).map((_, i) => (
        <RecommendationPanelSkeleton key={i} />
      ))}
    </aside>
  );
}

// ─── Table Row Skeleton ─────────────────────────────────────────────────────
export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <motion.tr
      initial={{ opacity: 0.5 }}
      animate={{ opacity: 1 }}
      transition={{ repeat: Infinity, duration: 1.5 }}
    >
      {Array(columns).fill(0).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 rounded bg-slate-200" />
        </td>
      ))}
    </motion.tr>
  );
}

// ─── Resource Card Skeleton ─────────────────────────────────────────────────
export function ResourceCardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0.5 }}
      animate={{ opacity: 1 }}
      transition={{ repeat: Infinity, duration: 1.5 }}
      className="card-premium p-4 space-y-3"
    >
      <div className="h-4 w-20 rounded bg-slate-200" />
      <div className="h-5 w-full rounded bg-slate-200" />
      <div className="flex gap-1">
        {Array(3).fill(0).map((_, i) => (
          <div key={i} className="h-6 w-12 rounded bg-slate-200" />
        ))}
      </div>
      <div className="h-8 w-full rounded bg-slate-200" />
    </motion.div>
  );
}

// ─── Resource Grid Skeleton ─────────────────────────────────────────────────
export function ResourceGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {Array(count).fill(0).map((_, i) => (
        <ResourceCardSkeleton key={i} />
      ))}
    </div>
  );
}

// ─── Page Section Skeleton ──────────────────────────────────────────────────
export function PageSectionSkeleton({ height = 'h-40' }: { height?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0.5 }}
      animate={{ opacity: 1 }}
      transition={{ repeat: Infinity, duration: 1.5 }}
      className={`rounded-xl border border-border/60 bg-slate-100 ${height}`}
    />
  );
}
