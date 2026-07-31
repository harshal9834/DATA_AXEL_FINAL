import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageHeader } from '../components/app-shell';
import { CheckCircle2, Sparkles, Loader2, Download, Copy, FileText, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';

interface PromptBuilderSearch {
  topic: string;
  goal: string;
  audience: string;
  format: string;
}

export const Route = createFileRoute('/app/prompt-builder')({
  validateSearch: (search: Record<string, unknown>): PromptBuilderSearch => {
    return {
      topic: (search.topic as string) || '',
      goal: (search.goal as string) || '',
      audience: (search.audience as string) || '',
      format: (search.format as string) || '',
    };
  },
  component: PromptBuilderReport,
});

// The structure of the generated report
interface ReportData {
  executiveSummary: string;
  fullAnalysis: string;
  keyTakeaways: string[];
  timeline: { date: string; event: string }[];
  suggestedNextSteps: string[];
  relatedEntities: string[];
  projectTags: string[];
  followUpQuestions: string[];
  sources: {
    id: string;
    type: string;
    title: string;
    url: string;
    date: string;
    reliabilityScore: number;
    summary: string;
  }[];
}

function PromptBuilderReport() {
  const { topic, goal, audience, format } = Route.useSearch();
  
  const [statusSteps, setStatusSteps] = useState<{ step: string; status: 'loading' | 'done' }[]>([]);
  const [report, setReport] = useState<ReportData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<{ role: string; content: string }[]>([]);

  useEffect(() => {
    if (!topic) return;

    // Reset state for new search
    setReport(null);
    setError(null);
    setStatusSteps([]);
    setHistory([]);

    // Connect to SSE stream
    const params = new URLSearchParams({ topic, goal, audience, format });
    const eventSource = new EventSource(`http://localhost:3001/api/prompt-builder/stream?${params.toString()}`);

    eventSource.addEventListener('status', (e) => {
      const data = JSON.parse(e.data);
      setStatusSteps((prev) => {
        const newSteps = prev.map(p => ({ ...p, status: 'done' as const }));
        return [...newSteps, { step: data.step, status: 'loading' }];
      });
    });

    eventSource.addEventListener('complete', (e) => {
      const data = JSON.parse(e.data);
      setReport(data);
      setStatusSteps((prev) => prev.map(p => ({ ...p, status: 'done' as const })));
      eventSource.close();
    });

    eventSource.addEventListener('error', (e: any) => {
      let msg = 'Failed to generate report';
      try {
        const data = JSON.parse(e.data);
        msg = data.message || msg;
      } catch (err) {}
      setError(msg);
      eventSource.close();
    });

    return () => {
      eventSource.close();
    };
  }, [topic, goal, audience, format]);

  // Loading Screen (Deep Research Style)
  if (!report && !error) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center justify-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-violet-600 to-purple-500 shadow-lg shadow-purple-500/30">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Deep Researching</h2>
          </div>
          
          <div className="flex flex-col gap-4">
            <AnimatePresence>
              {statusSteps.map((s, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3 rounded-xl border border-border/60 bg-white/50 p-4 shadow-sm backdrop-blur-sm"
                >
                  {s.status === 'done' ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <Loader2 className="h-5 w-5 animate-spin text-purple-500" />
                  )}
                  <span className={`font-medium ${s.status === 'done' ? 'text-foreground' : 'text-purple-600'}`}>
                    {s.step}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        <h2 className="text-2xl font-bold">Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!report) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(report, null, 2));
    toast.success('Report copied to clipboard!');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleFollowUpClick = async (question: string) => {
    // 1. Save the previous report context and question to history
    const previousReport = report;
    if (!previousReport) return;
    
    const newHistory = [
      ...history,
      { role: 'user', content: question },
      { role: 'assistant', content: previousReport.executiveSummary }
    ];
    setHistory(newHistory);

    // 2. Clear current report to show deep research loading screen again
    setReport(null);
    setStatusSteps([]);
    setError(null);

    // 3. Start generating new report via POST stream
    try {
      const response = await fetch('http://localhost:3001/api/prompt-builder/stream-followup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          previousReport,
          conversationHistory: newHistory,
          currentQuestion: question
        })
      });

      if (!response.body) throw new Error('No response body');
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let currentEvent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          if (line.startsWith('event: ')) {
            currentEvent = line.substring(7).trim();
          } else if (line.startsWith('data: ')) {
            const dataStr = line.substring(6).trim();
            if (!dataStr) continue;
            let data;
            try {
              data = JSON.parse(dataStr);
            } catch (err) {
              console.error('Failed to parse SSE data:', dataStr);
              continue;
            }
            
            if (currentEvent === 'status') {
              setStatusSteps(prev => {
                // Ensure we don't duplicate the same step if it arrives multiple times
                if (prev.length > 0 && prev[prev.length - 1].step === data.step) {
                  return prev;
                }
                const newSteps = prev.map(s => ({ ...s, status: 'done' as const }));
                return [...newSteps, { step: data.step, status: 'loading' }];
              });
            } else if (currentEvent === 'complete') {
              setReport(data);
              setStatusSteps(prev => prev.map(p => ({ ...p, status: 'done' as const })));
            } else if (currentEvent === 'error') {
              setError(data.message || 'Follow-up failed');
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
      setError('Connection failed');
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader 
        title={`Research: ${topic}`} 
        subtitle="Generated by Groq Deep Research AI" 
        action={
          <div className="flex gap-2">
            <button onClick={handleCopy} className="flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-1.5 text-sm font-medium hover:bg-gray-50">
              <Copy className="h-4 w-4" /> Copy
            </button>
            <button onClick={handlePrint} className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-purple-500 px-4 py-1.5 text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all hover:scale-105">
              <Download className="h-4 w-4" /> Export PDF
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Executive Summary */}
          <div className="rounded-2xl border border-border/60 bg-white/80 p-6 shadow-sm backdrop-blur-xl">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-purple-700">
              <FileText className="h-5 w-5" /> Executive Summary
            </h3>
            <p className="text-foreground leading-relaxed">{report.executiveSummary}</p>
          </div>

          {/* Full Analysis */}
          <div className="rounded-2xl border border-border/60 bg-white/80 p-6 shadow-sm backdrop-blur-xl">
            <h3 className="mb-4 text-lg font-bold text-foreground">AI Generated Analysis</h3>
            <div className="text-foreground/90 leading-relaxed space-y-4">
              {report.fullAnalysis.split('\n').map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </div>

          {/* Key Takeaways */}
          <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-purple-500/5 to-violet-500/5 p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-bold text-purple-800">Key Takeaways</h3>
            <ul className="space-y-3">
              {report.keyTakeaways.map((takeaway, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-200 text-xs font-bold text-purple-700">{i + 1}</div>
                  <span className="text-foreground">{takeaway}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Source Cards */}
          {report.sources && report.sources.length > 0 && (
            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-bold text-foreground">Premium Source Cards</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {report.sources.map((source) => (
                  <div key={source.id} className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/60 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-purple-200">
                    <div className="absolute top-0 right-0 h-24 w-24 -translate-y-8 translate-x-8 rounded-full bg-purple-500/10 blur-2xl transition-all group-hover:bg-purple-500/20" />
                    
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="rounded-md bg-gray-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-gray-600">{source.type}</span>
                        <span className={`text-xs font-bold ${source.reliabilityScore >= 90 ? 'text-emerald-600' : 'text-amber-600'}`}>Score: {source.reliabilityScore}/100</span>
                      </div>
                      <h4 className="mb-2 font-bold leading-tight text-foreground line-clamp-2">{source.title}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-3">{source.summary}</p>
                    </div>
                    
                    <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-3">
                      <span className="text-[10px] text-muted-foreground/80">{source.date}</span>
                      <a href={source.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs font-semibold text-purple-600 hover:text-purple-700">
                        Open Source <ArrowRight className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-6">
          
          {/* Timeline */}
          {report.timeline && report.timeline.length > 0 && (
            <div className="rounded-2xl border border-border/60 bg-white/80 p-6 shadow-sm backdrop-blur-xl">
              <h3 className="mb-4 text-lg font-bold text-foreground">Timeline</h3>
              <div className="space-y-4">
                {report.timeline.map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="h-3 w-3 rounded-full bg-purple-500" />
                      {i !== report.timeline.length - 1 && <div className="h-full w-px bg-border mt-1" />}
                    </div>
                    <div className="pb-4">
                      <p className="text-xs font-bold text-purple-600">{item.date}</p>
                      <p className="text-sm font-medium text-foreground">{item.event}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags & Entities */}
          <div className="rounded-2xl border border-border/60 bg-white/80 p-6 shadow-sm backdrop-blur-xl">
            <h3 className="mb-4 text-lg font-bold text-foreground">Project Metadata</h3>
            
            <div className="mb-4">
              <span className="mb-2 block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Related Technologies</span>
              <div className="flex flex-wrap gap-2">
                {report.relatedEntities.map((entity, i) => (
                  <span key={i} className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 border border-blue-100">{entity}</span>
                ))}
              </div>
            </div>
            
            <div>
              <span className="mb-2 block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tags</span>
              <div className="flex flex-wrap gap-2">
                {report.projectTags.map((tag, i) => (
                  <span key={i} className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">{tag}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Follow-up Questions */}
          <div className="rounded-2xl border border-purple-200 bg-purple-50 p-6 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-purple-900">
              <Sparkles className="h-5 w-5 text-purple-600" /> Follow-up Questions
            </h3>
            <div className="flex flex-col gap-2">
              {report.followUpQuestions.map((q, i) => (
                <button 
                  key={i} 
                  onClick={() => handleFollowUpClick(q)}
                  className="text-left rounded-xl bg-white px-4 py-3 text-sm font-medium text-purple-800 shadow-sm border border-purple-100 hover:border-purple-300 hover:shadow transition-all group"
                >
                  <span className="flex items-center justify-between">
                    {q}
                    <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-purple-500" />
                  </span>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
