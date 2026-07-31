import React from "react";
import { motion } from "framer-motion";
import { Clock, CheckCircle2 } from "lucide-react";

export function KnowledgeTimeline({ events = [] }: { events?: any[] }) {
  // Mock events if none provided to show the evolution feature
  const timelineEvents = events.length > 0 ? events : [
    { day: "Day 1", action: "Research Added", desc: "12 papers and 5 repos analyzed." },
    { day: "Day 2", action: "Architecture Generated", desc: "System design completed." },
    { day: "Day 3", action: "Knowledge Clustered", desc: "Relationships mapped." },
    { day: "Day 4", action: "Gaps Detected", desc: "Competitor analysis missing." }
  ];

  return (
    <div className="card-premium p-4 mt-6">
      <h3 className="flex items-center gap-2 font-bold mb-4">
        <Clock className="h-4 w-4 text-indigo-400" />
        Knowledge Evolution
      </h3>
      
      <div className="flex justify-between items-start relative">
        <div className="absolute top-3 left-0 right-0 h-0.5 bg-border/50 z-0" />
        
        {timelineEvents.map((evt, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="relative z-10 flex flex-col items-center flex-1"
          >
            <div className="w-6 h-6 rounded-full bg-indigo-500/20 border-2 border-indigo-500 flex items-center justify-center mb-2 bg-background">
              <CheckCircle2 className="h-3 w-3 text-indigo-400" />
            </div>
            <span className="text-xs font-bold text-foreground mb-1">{evt.day}</span>
            <span className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider text-center">{evt.action}</span>
            <span className="text-[9px] text-muted-foreground text-center mt-1 max-w-[100px]">{evt.desc}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
