// ─── Diagram Tabs (Architecture, ER, Flow) ────────────────────────────────────

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Network, GitBranch, Workflow, Copy, Maximize2, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { toast } from 'sonner';
import { WorkspaceEmpty } from '../components/WorkspaceStates';
import type { ResearchWorkspace } from '../types/workspace.types';

// ─── Fullscreen Overlay ────────────────────────────────────────────────────────

interface FullscreenDiagramProps {
  diagram: string;
  title: string;
  onClose: () => void;
}

function FullscreenDiagram({ diagram, title, onClose }: FullscreenDiagramProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-slate-900 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-auto p-6"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold">{title}</h3>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1">
              <X className="h-5 w-5" />
            </button>
          </div>
          <pre className="text-xs font-mono text-muted-foreground">{diagram}</pre>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Diagram Card ──────────────────────────────────────────────────────────────

interface DiagramCardProps {
  diagram: string;
  title: string;
  EmptyIcon: LucideIcon;
}

function DiagramCard({ diagram, title, EmptyIcon: _Icon }: DiagramCardProps) {
  const [fullscreen, setFullscreen] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(diagram);
    toast.success('Mermaid code copied to clipboard');
  };

  return (
    <>
      <div className="card-premium p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">{title}</h3>
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="p-2 rounded-lg border border-border/70 hover:bg-accent transition-colors"
              title="Copy Mermaid code"
            >
              <Copy className="h-4 w-4" />
            </button>
            <button
              onClick={() => setFullscreen(true)}
              className="p-2 rounded-lg border border-border/70 hover:bg-accent transition-colors"
              title="View fullscreen"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-900/30 rounded-lg p-4 overflow-auto max-h-96">
          <pre className="text-xs text-muted-foreground font-mono">{diagram}</pre>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Copy the code above and paste it into{' '}
          <a
            href="https://mermaid.live"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Mermaid Live
          </a>{' '}
          to render the diagram.
        </p>
      </div>

      {fullscreen && (
        <FullscreenDiagram
          diagram={diagram}
          title={title}
          onClose={() => setFullscreen(false)}
        />
      )}
    </>
  );
}

// ─── Architecture Tab ──────────────────────────────────────────────────────────

export function ArchitectureTab({ workspace }: { workspace: ResearchWorkspace }) {
  if (!workspace.architecture) {
    return (
      <WorkspaceEmpty
        Icon={Network}
        title="Architecture diagram not generated yet"
        description="The system architecture diagram will appear here as Mermaid code once generated."
      />
    );
  }

  return (
    <DiagramCard
      diagram={workspace.architecture}
      title="System Architecture"
      EmptyIcon={Network}
    />
  );
}

// ─── ER Diagram Tab ────────────────────────────────────────────────────────────

export function ERDiagramTab({ workspace }: { workspace: ResearchWorkspace }) {
  if (!workspace.erDiagram) {
    return (
      <WorkspaceEmpty
        Icon={GitBranch}
        title="ER diagram not generated yet"
        description="The entity-relationship diagram will appear here once generated."
      />
    );
  }

  return (
    <DiagramCard
      diagram={workspace.erDiagram}
      title="Entity-Relationship Diagram"
      EmptyIcon={GitBranch}
    />
  );
}

// ─── Flow Diagram Tab ──────────────────────────────────────────────────────────

export function FlowDiagramTab({ workspace }: { workspace: ResearchWorkspace }) {
  if (!workspace.flowDiagram) {
    return (
      <WorkspaceEmpty
        Icon={Workflow}
        title="Flow diagram not generated yet"
        description="The process flow diagram will appear here once generated."
      />
    );
  }

  return (
    <DiagramCard
      diagram={workspace.flowDiagram}
      title="Process Flow Diagram"
      EmptyIcon={Workflow}
    />
  );
}
