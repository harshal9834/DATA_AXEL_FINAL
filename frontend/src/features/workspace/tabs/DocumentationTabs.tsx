// ─── Documentation & SRS Tabs ─────────────────────────────────────────────────

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Eye, Download, X } from 'lucide-react';
import { toast } from 'sonner';
import { WorkspaceEmpty } from '../components/WorkspaceStates';
import type { ResearchWorkspace } from '../types/workspace.types';

// ─── PDF Preview Modal ─────────────────────────────────────────────────────────

interface PDFPreviewProps {
  title: string;
  pdfUrl: string;
  onClose: () => void;
}

function PDFPreview({ title, pdfUrl, onClose }: PDFPreviewProps) {
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
          className="bg-white dark:bg-slate-900 rounded-lg max-w-2xl w-full overflow-auto p-6"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold">{title}</h3>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1">
              <X className="h-5 w-5" />
            </button>
          </div>
          <iframe
            src={pdfUrl}
            className="w-full h-96 rounded-lg border border-border/70"
            title={title}
          />
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:shadow-lg transition-shadow"
          >
            <Download className="h-4 w-4" />
            Download Full PDF
          </a>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Document Card ─────────────────────────────────────────────────────────────

interface DocumentCardProps {
  content: string;
  title: string;
  pdfUrl: string | null;
}

function DocumentCard({ content, title, pdfUrl }: DocumentCardProps) {
  const [previewOpen, setPreviewOpen] = useState(false);

  const handleDownload = () => {
    if (!pdfUrl) {
      toast.error('PDF not available yet');
      return;
    }
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.target = '_blank';
    link.download = title.replace(/\s+/g, '_') + '.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('PDF download started');
  };

  return (
    <>
      <div className="card-premium p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">{title}</h3>
          {pdfUrl && (
            <div className="flex gap-2">
              <button
                onClick={() => setPreviewOpen(true)}
                className="p-2 rounded-lg border border-border/70 hover:bg-accent transition-colors"
                title="Preview PDF"
              >
                <Eye className="h-4 w-4" />
              </button>
              <button
                onClick={handleDownload}
                className="p-2 rounded-lg border border-border/70 hover:bg-accent transition-colors"
                title="Download PDF"
              >
                <Download className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
        <div className="prose prose-sm max-w-none dark:prose-invert text-sm leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto">
          {content}
        </div>
      </div>

      {previewOpen && pdfUrl && (
        <PDFPreview title={title} pdfUrl={pdfUrl} onClose={() => setPreviewOpen(false)} />
      )}
    </>
  );
}

// ─── Documentation Tab ─────────────────────────────────────────────────────────

export function DocumentationTab({ workspace }: { workspace: ResearchWorkspace }) {
  if (!workspace.documentation) {
    return (
      <WorkspaceEmpty
        Icon={FileText}
        title="Documentation not generated yet"
        description="Technical documentation will appear here once the AI pipeline completes."
      />
    );
  }

  return (
    <DocumentCard
      content={workspace.documentation}
      title="Technical Documentation"
      pdfUrl={workspace.documentationPdfUrl}
    />
  );
}

// ─── SRS Tab ───────────────────────────────────────────────────────────────────

export function SRSTab({ workspace }: { workspace: ResearchWorkspace }) {
  if (!workspace.srsDocument) {
    return (
      <WorkspaceEmpty
        Icon={FileText}
        title="SRS not generated yet"
        description="The Software Requirements Specification document will appear here once generated."
      />
    );
  }

  return (
    <DocumentCard
      content={workspace.srsDocument}
      title="Software Requirements Specification"
      pdfUrl={workspace.srsPdfUrl}
    />
  );
}
