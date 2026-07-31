// ─── Shared UI State Components ───────────────────────────────────────────────
// Reusable Loading, Empty, Error components used across all workspace tabs.

import { Loader2, AlertCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// ─── Loading State ─────────────────────────────────────────────────────────────

interface WorkspaceLoadingProps {
  message?: string;
}

export function WorkspaceLoading({ message = 'Loading...' }: WorkspaceLoadingProps) {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground text-sm">{message}</p>
      </div>
    </div>
  );
}

// ─── Empty State ───────────────────────────────────────────────────────────────

interface WorkspaceEmptyProps {
  Icon: LucideIcon;
  title: string;
  description: string;
}

export function WorkspaceEmpty({ Icon, title, description }: WorkspaceEmptyProps) {
  return (
    <div className="card-premium p-12 text-center">
      <Icon className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-40" />
      <p className="font-medium text-foreground mb-1">{title}</p>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

// ─── Error State ───────────────────────────────────────────────────────────────

interface WorkspaceErrorProps {
  message: string;
  onRetry?: () => void;
}

export function WorkspaceError({ message, onRetry }: WorkspaceErrorProps) {
  return (
    <div className="card-premium p-8 text-center border-destructive/30">
      <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-3 opacity-70" />
      <p className="font-medium text-foreground mb-1">Something went wrong</p>
      <p className="text-sm text-muted-foreground mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 rounded-lg border border-border/70 hover:bg-accent transition-colors text-sm"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
