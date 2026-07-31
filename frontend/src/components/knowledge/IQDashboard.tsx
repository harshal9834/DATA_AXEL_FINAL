import React from "react";
import { motion } from "framer-motion";
import { Brain, Search, Lightbulb, Code, BookOpen, Layers } from "lucide-react";

export function IQDashboard({ iqData, loading }: { iqData: any, loading: boolean }) {
  if (loading || !iqData) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 animate-pulse">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="h-20 rounded-xl bg-white/5 border border-border/50" />
        ))}
      </div>
    );
  }

  const stats = [
    { label: "Overall IQ", value: iqData.overallIQ, icon: Brain, color: "text-purple-400", bg: "bg-purple-500/10" },
    { label: "Coverage", value: iqData.coverage, icon: Layers, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Research", value: iqData.researchQuality, icon: Search, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Innovation", value: iqData.innovation, icon: Lightbulb, color: "text-amber-400", bg: "bg-amber-500/10" },
    { label: "Tech Ready", value: iqData.technicalReadiness, icon: Code, color: "text-cyan-400", bg: "bg-cyan-500/10" },
    { label: "Arch Ready", value: iqData.architectureReadiness, icon: Layers, color: "text-indigo-400", bg: "bg-indigo-500/10" },
    { label: "Docs", value: iqData.documentationProgress, icon: BookOpen, color: "text-rose-400", bg: "bg-rose-500/10" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="card-premium p-3 flex flex-col justify-between relative overflow-hidden group"
        >
          <div className="absolute -right-4 -top-4 w-12 h-12 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity" style={{ backgroundColor: 'currentColor' }} />
          
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{stat.label}</span>
            <div className={`p-1.5 rounded-md ${stat.bg} ${stat.color}`}>
              <stat.icon className="h-3.5 w-3.5" />
            </div>
          </div>
          
          <div className="flex items-end gap-1.5">
            <span className="text-2xl font-bold leading-none">{stat.value}</span>
            <span className="text-xs text-muted-foreground mb-0.5">/ 100</span>
          </div>

          <div className="mt-3 h-1 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }} 
              animate={{ width: `${stat.value}%` }} 
              transition={{ duration: 1, delay: i * 0.1 }}
              className={`h-full ${stat.color.replace('text-', 'bg-')}`} 
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
