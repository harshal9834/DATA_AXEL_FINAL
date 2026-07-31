import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wand2, X, Sparkles } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

interface PromptBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const outputFormats = [
  "Detailed Analysis",
  "Executive Summary",
  "Bullet Points",
  "Market Report",
  "Beginner Guide",
  "Technical Deep-Dive",
];

export default function PromptBuilderModal({ isOpen, onClose }: PromptBuilderModalProps) {
  const [topic, setTopic] = useState("");
  const [goal, setGoal] = useState("");
  const [audience, setAudience] = useState("");
  const [selectedFormat, setSelectedFormat] = useState("Detailed Analysis");
  const navigate = useNavigate();

  const handleBuild = () => {
    if (!topic.trim()) return;
    onClose();
    navigate({
      to: "/app/prompt-builder",
      search: {
        topic,
        goal,
        audience,
        format: selectedFormat
      }
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full max-w-[560px] rounded-3xl bg-white shadow-2xl pointer-events-auto overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-violet-600 to-purple-500 px-6 py-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Wand2 className="h-6 w-6 text-white" />
                  <h2 className="text-xl font-bold text-white">Prompt Builder</h2>
                  <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-md">
                    AI-Assisted
                  </span>
                </div>
                <button
                  onClick={onClose}
                  className="grid h-8 w-8 place-items-center rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 md:p-8 flex flex-col gap-6 bg-white">
                <p className="text-sm text-muted-foreground/80 font-medium">
                  Fill in the fields below and we'll craft a powerful research prompt for you.
                </p>

                {/* Fields */}
                <div className="flex flex-col gap-4">
                  {/* Topic */}
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 text-sm font-bold text-foreground">
                      <span>🎯</span> Research Topic <span className="text-red-500">*</span>
                    </label>
                    <input
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="e.g. India's EV market growth in 2026"
                      className="w-full rounded-xl border border-border/80 bg-white px-4 py-3 text-sm font-medium outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 placeholder:font-normal placeholder:text-muted-foreground/60"
                    />
                  </div>

                  {/* Goal */}
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 text-sm font-bold text-foreground">
                      <span>🚀</span> Research Goal
                    </label>
                    <input
                      value={goal}
                      onChange={(e) => setGoal(e.target.value)}
                      placeholder="e.g. Understand key players, funding trends, government policy"
                      className="w-full rounded-xl border border-border/80 bg-white px-4 py-3 text-sm font-medium outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 placeholder:font-normal placeholder:text-muted-foreground/60"
                    />
                  </div>

                  {/* Audience */}
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 text-sm font-bold text-foreground">
                      <span>👥</span> Target Audience
                    </label>
                    <input
                      value={audience}
                      onChange={(e) => setAudience(e.target.value)}
                      placeholder="e.g. Startup founder, student, investor"
                      className="w-full rounded-xl border border-border/80 bg-white px-4 py-3 text-sm font-medium outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 placeholder:font-normal placeholder:text-muted-foreground/60"
                    />
                  </div>
                </div>

                {/* Output Format */}
                <div className="flex flex-col gap-3">
                  <label className="flex items-center gap-2 text-sm font-bold text-foreground">
                    <span>📄</span> Output Format
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {outputFormats.map((format) => (
                      <button
                        key={format}
                        onClick={() => setSelectedFormat(format)}
                        className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition-all duration-200 ${
                          selectedFormat === format
                            ? "border-purple-500 bg-purple-500/5 text-purple-600 shadow-sm"
                            : "border-border/80 bg-white text-muted-foreground hover:border-purple-500/30 hover:bg-gray-50"
                        }`}
                      >
                        {format}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bottom Button */}
                <button 
                  onClick={handleBuild}
                  disabled={!topic.trim()}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#D2B2F9] py-3.5 text-white font-bold shadow-md transition-all duration-200 hover:bg-[#c49ef4] hover:shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Sparkles className="h-5 w-5" />
                  Build & Search Now
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
