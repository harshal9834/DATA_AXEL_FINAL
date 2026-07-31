import React, { useState } from "react";
import { executeAgent } from "../lib/server/ai";
import { PageHeader } from "./app-shell";
import { Loader2, Play, Copy, Download, Sparkles, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { MarkdownRenderer } from "./MarkdownRenderer";

interface AgentWorkspaceProps {
  agentId: string;
  title: string;
  subtitle: string;
  placeholder: string;
  loadingText: string;
  Icon: React.ElementType;
}

export function AgentWorkspace({ agentId, title, subtitle, placeholder, loadingText, Icon }: AgentWorkspaceProps) {
  const [topic, setTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [output, setOutput] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleRun = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a project idea or context.");
      return;
    }
    
    setIsGenerating(true);
    setOutput(null);

    try {
      const response = await executeAgent({
        data: {
          agent: agentId,
          prompt: topic,
          projectId: "default-project"
        }
      });
      
      setOutput(response);
      toast.success(`${title} completed successfully!`);
    } catch (error: any) {
      toast.error(`Failed to execute ${title}: ` + (error.message || "Unknown error"));
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    if (!output) return;
    const blob = new Blob([output], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${agentId}-${Date.now()}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Exported as Markdown");
  };

  return (
    <div className="flex h-[calc(100vh-theme(spacing.16))] flex-col">
      <PageHeader title={title} subtitle={subtitle} />
      
      <div className="flex flex-1 flex-col overflow-hidden px-1">
        {/* Input Area */}
        <div className="mb-6 mt-4 flex items-center gap-4">
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-muted-foreground">
              <Icon className="h-5 w-5" />
            </div>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder={placeholder}
              className="h-14 w-full rounded-2xl border border-border/70 bg-white/70 pl-12 pr-4 text-sm shadow-soft outline-none backdrop-blur transition focus:border-primary/50 focus:bg-white focus:ring-4 focus:ring-primary/10"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isGenerating) handleRun();
              }}
              disabled={isGenerating}
            />
          </div>
          <button
            onClick={handleRun}
            disabled={isGenerating || !topic.trim()}
            className="flex h-14 items-center gap-2 rounded-2xl bg-gradient-brand px-8 text-sm font-bold text-white shadow-brand transition-all hover:scale-[1.02] hover:shadow-brand-hover disabled:pointer-events-none disabled:opacity-50"
          >
            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 fill-current" />}
            Run
          </button>
        </div>

        {/* Output Area */}
        <div className="card-premium relative flex-1 overflow-y-auto bg-white/60 p-8 backdrop-blur-md">
          <AnimatePresence mode="wait">
            {!isGenerating && !output && (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex h-full flex-col items-center justify-center text-center"
              >
                <div className="mb-6 grid h-20 w-20 place-items-center rounded-3xl bg-primary/5 shadow-inner">
                  <Sparkles className="h-8 w-8 text-primary/40" />
                </div>
                <h3 className="font-bold">Ready to Start</h3>
                <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                  {placeholder}
                </p>
              </motion.div>
            )}

            {isGenerating && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex h-full flex-col items-center justify-center"
              >
                <div className="relative grid h-24 w-24 place-items-center">
                  <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
                <p className="mt-6 font-semibold text-primary">{loadingText}</p>
                <p className="mt-2 text-xs text-muted-foreground">Reviewing project memory...</p>
              </motion.div>
            )}

            {output && !isGenerating && (
              <motion.div
                key="output"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mx-auto max-w-4xl"
              >
                {/* Actions */}
                <div className="mb-8 flex items-center justify-end gap-2 border-b border-border/50 pb-4">
                  <button onClick={handleCopy} className="flex h-8 items-center gap-1.5 rounded-lg border border-border/70 bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50">
                    {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                  <button onClick={handleExport} className="flex h-8 items-center gap-1.5 rounded-lg border border-border/70 bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50">
                    <Download className="h-3.5 w-3.5" />
                    Export
                  </button>
                </div>

                {/* Rendered Markdown */}
                <MarkdownRenderer content={output} />
                
                <div className="mt-12 flex items-center justify-center border-t border-border/50 pt-8 text-xs text-muted-foreground">
                  <Sparkles className="mr-1.5 h-3 w-3" />
                  Generated by DATA_AXEL AI
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
