/**
 * @deprecated
 * Use `@/features/workspace` hooks instead.
 * This file is kept for backward compatibility during the Phase 1 → Phase 2 migration.
 * It will be removed in Phase 2.
 */
export {
  useCreateWorkspace as useCreateResearchWorkspace,
  useWorkspace as useResearchWorkspace,
  useWorkspaceList as useUserResearchWorkspaces,
} from '../features/workspace';
