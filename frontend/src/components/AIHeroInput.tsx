import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Mic, Paperclip, ArrowRight,
  FileText, CheckCircle2, Loader2, AlertCircle, X,
  Brain, Rocket
} from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { auth } from '../firebase/firebase';
import { BACKEND_URL } from '../lib/api';
import { VoiceModal } from './VoiceModal';
import { useCreateProject } from '../hooks/useProjects';

// ─── Types ───────────────────────────────────────────────────────────────────
type ProcessingStep =
  | 'uploading'
  | 'extracting'
  | 'understanding'
  | 'generating'
  | 'launching'
  | 'done'
  | null;

type VoiceState = 'IDLE' | 'LISTENING' | 'THINKING' | 'SPEAKING';

// ─── Processing step config ───────────────────────────────────────────────────
const PROCESSING_STEPS: Record<Exclude<ProcessingStep, null | 'done'>, { label: string; icon: React.ReactNode }> = {
  uploading: { label: 'Uploading your files...', icon: <Paperclip className="h-6 w-6" /> },
  extracting: { label: 'Extracting content...', icon: <FileText className="h-6 w-6" /> },
  understanding: { label: 'Understanding your project...', icon: <Brain className="h-6 w-6" /> },
  generating: { label: 'Generating project context...', icon: <Sparkles className="h-6 w-6" /> },
  launching: { label: 'Starting Execution Engine...', icon: <Rocket className="h-6 w-6" /> }
};

const SUGGESTIONS = ['AI SaaS', 'Healthcare', 'Education', 'FinTech', 'E-Commerce', 'Government', 'IoT', 'Agriculture'];

const EXAMPLES = [
  'Food Waste Management Platform',
  'Hospital Management AI',
  'College ERP',
  'Inventory System',
  'AI Resume Screener',
  'CRM Platform',
  'Voice Assistant'
];

const ALLOWED_EXTENSIONS = '.pdf,.docx,.doc,.txt,.md,.csv,.pptx,.xlsx,.zip,.jpg,.jpeg,.png,.webp,.gif';

// ─── Component ────────────────────────────────────────────────────────────────
interface AIHeroInputProps {
  onSubmit?: (prompt: string) => void;
}

export function AIHeroInput({ onSubmit }: AIHeroInputProps) {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const createProject = useCreateProject();

  const [prompt, setPrompt] = useState('');
  const [exampleIndex, setExampleIndex] = useState(0);
  const [processingStep, setProcessingStep] = useState<ProcessingStep>(null);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Rotate example prompts
  useEffect(() => {
    const iv = setInterval(() => setExampleIndex(p => (p + 1) % EXAMPLES.length), 3000);
    return () => clearInterval(iv);
  }, []);

  // ─── Text Submit ─────────────────────────────────────────────────────────
  const handleTextSubmit = async () => {
    const trimmed = prompt.trim();
    if (!trimmed) return;

    try {
      setProcessingStep('launching');
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`${BACKEND_URL}/api/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: trimmed.slice(0, 80), description: trimmed, domain: 'Technology' })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setProcessingStep(null);
      navigate({ to: '/app/workflow/$workflowId', params: { workflowId: data.project.id } });
    } catch (err: any) {
      setProcessingError(err.message || 'Failed to create project. Please try again.');
      setProcessingStep(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleTextSubmit(); }
  };

  // ─── File Upload ─────────────────────────────────────────────────────────
  const processFiles = async (files: File[]) => {
    if (!files.length) return;
    setProcessingError(null);
    setSelectedFiles(files);

    const formData = new FormData();
    files.forEach(f => formData.append('files', f));
    if (prompt.trim()) formData.append('prompt', prompt.trim());

    try {
      setProcessingStep('uploading');
      await new Promise(r => setTimeout(r, 800));

      setProcessingStep('extracting');
      const token = await auth.currentUser?.getIdToken();

      const res = await fetch(`${BACKEND_URL}/api/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      setProcessingStep('understanding');
      await new Promise(r => setTimeout(r, 600));

      setProcessingStep('generating');
      await new Promise(r => setTimeout(r, 600));

      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      setProcessingStep('launching');
      await new Promise(r => setTimeout(r, 400));

      setProcessingStep('done');
      await new Promise(r => setTimeout(r, 500));

      setProcessingStep(null);
      setSelectedFiles([]);
      navigate({ to: '/app/workflow/$workflowId', params: { workflowId: data.workflowId } });

    } catch (err: any) {
      setProcessingError(err.message || 'Upload failed. Please try again.');
      setProcessingStep(null);
      setSelectedFiles([]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) processFiles(Array.from(e.target.files));
    e.target.value = '';
  };

  // ─── Drag & Drop ─────────────────────────────────────────────────────────
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length) processFiles(files);
  };

  // ─── Voice confirm ─────────────────────────────────────────────────────
  const handleVoiceConfirm = async (idea: string) => {
    setVoiceModalOpen(false);
    setProcessingStep('launching');
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`${BACKEND_URL}/api/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: idea.slice(0, 80), description: idea, domain: 'Technology' })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setProcessingStep(null);
      navigate({ to: '/app/workflow/$workflowId', params: { workflowId: data.project.id } });
    } catch (err: any) {
      setProcessingError(err.message);
      setProcessingStep(null);
    }
  };

  const isProcessing = processingStep !== null;

  return (
    <>
      {/* ─── Voice Modal ────────────────────────────────────────────────── */}
      <VoiceModal
        isOpen={voiceModalOpen}
        onClose={() => setVoiceModalOpen(false)}
        onConfirmResearch={handleVoiceConfirm}
      />

      {/* ─── Processing Overlay ─────────────────────────────────────────── */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-md mx-4 flex flex-col items-center text-center"
            >
              {/* Animated glow ring */}
              <div className="relative mb-8">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-indigo-500/40">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-0 rounded-full border-4 border-transparent border-t-white/60"
                  />
                  <div className="text-white z-10">
                    {processingStep && processingStep !== 'done'
                      ? PROCESSING_STEPS[processingStep]?.icon
                      : <CheckCircle2 className="h-8 w-8" />}
                  </div>
                </div>
              </div>

              <h3 className="text-2xl font-black text-slate-800 mb-3">
                {processingStep === 'done' ? 'Launching Engine...' : 'Processing'}
              </h3>

              {/* Step list */}
              <div className="w-full space-y-3 mb-8">
                {(Object.keys(PROCESSING_STEPS) as Exclude<ProcessingStep, null | 'done'>[]).map((step) => {
                  const steps = Object.keys(PROCESSING_STEPS) as string[];
                  const currentIdx = steps.indexOf(processingStep as string);
                  const stepIdx = steps.indexOf(step);
                  const done = stepIdx < currentIdx || processingStep === 'done';
                  const active = step === processingStep;

                  return (
                    <div key={step} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${active ? 'bg-indigo-50 border border-indigo-200' : 'bg-transparent'}`}>
                      <div className={`h-5 w-5 flex-shrink-0 rounded-full flex items-center justify-center ${done ? 'bg-emerald-500' : active ? 'bg-indigo-500' : 'bg-slate-200'}`}>
                        {done
                          ? <CheckCircle2 className="h-3 w-3 text-white" />
                          : active
                          ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}><Loader2 className="h-3 w-3 text-white" /></motion.div>
                          : null}
                      </div>
                      <span className={`text-[13px] font-semibold ${active ? 'text-indigo-700' : done ? 'text-slate-500 line-through' : 'text-slate-400'}`}>
                        {PROCESSING_STEPS[step].label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {selectedFiles.length > 0 && (
                <p className="text-[12px] text-slate-400 font-medium">
                  {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} being analyzed
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Error Banner ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {processingError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-4 flex items-start gap-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl px-4 py-3 text-[13px] font-semibold"
          >
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span className="flex-1">{processingError}</span>
            <button onClick={() => setProcessingError(null)}><X className="h-4 w-4" /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Main Input ──────────────────────────────────────────────────── */}
      <div
        className={`w-full max-w-2xl relative transition-all duration-300 ${isDragging ? 'scale-105' : ''}`}
        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        {isDragging && (
          <div className="absolute inset-0 z-20 rounded-2xl border-2 border-dashed border-indigo-400 bg-indigo-50/80 flex items-center justify-center pointer-events-none">
            <p className="text-indigo-600 font-bold text-sm">Drop files here</p>
          </div>
        )}

        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-2xl blur opacity-20 group-hover:opacity-40 focus-within:opacity-50 transition duration-500" />
          <div className="relative flex items-center bg-white border border-slate-200 rounded-2xl shadow-sm focus-within:shadow-lg focus-within:border-indigo-300 transition-all duration-300 overflow-hidden p-2">
            <div className="pl-3 pr-2 text-indigo-500 flex-shrink-0">
              <Sparkles className="h-6 w-6" />
            </div>
            <input
              type="text"
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="What would you like to build today?"
              disabled={isProcessing}
              className="flex-1 bg-transparent border-none outline-none py-4 px-2 text-[16px] font-medium text-slate-800 placeholder-slate-400 min-w-0 disabled:opacity-50"
            />
            <div className="flex items-center gap-1 pr-2 flex-shrink-0">
              {/* Mic */}
              <button
                onClick={() => setVoiceModalOpen(true)}
                disabled={isProcessing}
                title="Voice input"
                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors disabled:opacity-40"
              >
                <Mic className="h-5 w-5" />
              </button>
              {/* Attachment */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                title="Upload files"
                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors disabled:opacity-40"
              >
                <Paperclip className="h-5 w-5" />
              </button>
              {/* Send */}
              <button
                onClick={handleTextSubmit}
                disabled={!prompt.trim() || isProcessing}
                title="Submit prompt"
                className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 hover:shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed ml-1"
              >
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Rotating example */}
        <div className="mt-4 text-[13px] font-medium text-slate-400 flex items-center justify-center gap-2 h-6">
          Example:&nbsp;
          <AnimatePresence mode="wait">
            <motion.span
              key={exampleIndex}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3 }}
              className="text-slate-600 font-semibold"
            >
              {EXAMPLES[exampleIndex]}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      {/* ─── Suggestion Chips ────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
        {SUGGESTIONS.map(s => (
          <button
            key={s}
            onClick={() => setPrompt(prev => prev ? `${prev} — ${s}` : s)}
            disabled={isProcessing}
            className="px-4 py-2 rounded-full bg-white border border-slate-200 text-[13px] font-bold text-slate-600 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 hover:-translate-y-0.5 transition-all shadow-sm disabled:opacity-40"
          >
            {s}
          </button>
        ))}
      </div>

      {/* ─── Hidden File Input ───────────────────────────────────────────── */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={ALLOWED_EXTENSIONS}
        onChange={handleFileChange}
        className="hidden"
      />
    </>
  );
}
