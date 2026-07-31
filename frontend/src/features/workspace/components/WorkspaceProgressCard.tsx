// ─── Workspace Progress Header ─────────────────────────────────────────────────

import { Loader2, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import type { ResearchWorkspace } from '../types/workspace.types';

interface WorkspaceProgressCardProps {
  workspace: ResearchWorkspace;
}

export function WorkspaceProgressCard({ workspace }: WorkspaceProgressCardProps) {
  const isGenerating = workspace.status === 'RESEARCHING';
  const isComplete = workspace.status === 'COMPLETED';

  return (
    <div className="card-premium p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold">{workspace.projectName}</h2>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {workspace.problemStatement}
          </p>
        </div>
        <div className="text-right flex-shrink-0 ml-4">
          <p className="text-sm font-medium text-muted-foreground">Progress</p>
          <p className="text-3xl font-bold">{workspace.progress}%</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-3 bg-muted rounded-full overflow-hidden mb-4">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${workspace.progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="h-full bg-gradient-brand rounded-full"
        />
      </div>

      {/* Stage Indicator */}
      <div className="flex items-center gap-2">
        {isGenerating && <Loader2 className="h-4 w-4 text-primary animate-spin" />}
        {isComplete && <CheckCircle2 className="h-4 w-4 text-green-500" />}
        <span className="text-sm font-medium">
          {isGenerating
            ? workspace.currentStage ?? 'Generating...'
            : isComplete
            ? 'Research Complete'
            : workspace.status === 'FAILED'
            ? 'Generation Failed'
            : 'Ready to generate'}
        </span>
        {workspace.progress > 0 && (
          <span className="text-xs text-muted-foreground ml-auto">
            Stage {Math.round((workspace.progress / 100) * workspace.totalStages)} of{' '}
            {workspace.totalStages}
          </span>
        )}
      </div>

      {workspace.error && (
        <div className="mt-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
          <p className="text-sm text-destructive">{workspace.error}</p>
        </div>
      )}
    </div>
  );
}
