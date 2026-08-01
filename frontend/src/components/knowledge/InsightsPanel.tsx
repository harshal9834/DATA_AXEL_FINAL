import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, TrendingUp, AlertTriangle, Lightbulb } from "lucide-react";

export function InsightsPanel({ node, insight, onClose, loading }: { node: any, insight: any, onClose: () => void, loading: boolean }) {
  if (!node) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 50 }}
        className="card-premium absolute right-4 top-4 bottom-4 w-80 overflow-y-auto z-20 flex flex-col backdrop-blur-xl bg-background/80"
      >
        <div className="sticky top-0 z-10 p-4 border-b border-border/50 bg-background/90 backdrop-blur flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: node.color || "#888" }} />
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{node.category}</span>
            </div>
            <h3 className="font-bold text-lg leading-tight">{node.name}</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-white/10 text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4 flex-1 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-40 gap-3 text-muted-foreground">
              <Sparkles className="h-5 w-5 animate-pulse text-blue-500" />
              <span className="text-sm">Analyzing {node.name}...</span>
            </div>
          ) : insight ? (
            <>
              {/* Confidence Score */}
              {insight.confidence && (
                <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-white/5">
                  <span className="text-sm font-medium">AI Confidence</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-16 bg-white/10 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }} animate={{ width: `${insight.confidence}%` }} 
                        className={`h-full ${insight.confidence > 90 ? 'bg-emerald-500' : insight.confidence > 75 ? 'bg-amber-500' : 'bg-red-500'}`} 
                      />
                    </div>
                    <span className="text-sm font-bold">{insight.confidence}%</span>
                  </div>
                </div>
              )}

              {/* Summary */}
              <div>
                <h4 className="flex items-center gap-1.5 text-sm font-bold mb-3 text-blue-400">
                  <Sparkles className="h-4 w-4" /> AI Insight
                </h4>
                <ul className="space-y-2">
                  {insight.summary?.map((point: string, i: number) => (
                    <motion.li 
                      key={i}
                      initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                      className="text-sm text-muted-foreground flex gap-2 items-start leading-snug"
                    >
                      <span className="text-blue-500 mt-1">•</span>
                      <span>{point}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>

              {/* Recommendation */}
              {insight.recommendation && (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                  className="p-3 rounded-lg border border-indigo-500/30 bg-indigo-500/10"
                >
                  <h4 className="flex items-center gap-1.5 text-xs font-bold mb-2 text-indigo-400 uppercase tracking-wider">
                    <Lightbulb className="h-3.5 w-3.5" /> Recommendation
                  </h4>
                  <p className="text-sm text-foreground/90 italic">"{insight.recommendation}"</p>
                </motion.div>
              )}

              {/* Metrics */}
              {insight.metrics && insight.metrics.length > 0 && (
                <div>
                  <h4 className="flex items-center gap-1.5 text-sm font-bold mb-3 text-amber-400">
                    <TrendingUp className="h-4 w-4" /> Key Metrics
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {insight.metrics.map((m: any, i: number) => (
                      <div key={i} className="p-2 rounded border border-border/50 bg-white/5 text-center">
                        <div className="text-[10px] text-muted-foreground mb-1">{m.label}</div>
                        <div className="text-sm font-bold">{m.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-sm text-muted-foreground">Click a node to generate insights.</div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
