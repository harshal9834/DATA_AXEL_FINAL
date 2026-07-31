# AI Research Operating System - Implementation Tasks

## Task 1: Update Database Schema
- **Objective**: Add missing fields to ResearchWorkspace
- **Files**: `backend/prisma/schema.prisma`
- **Changes**:
  - Add `apiDatabaseDesign: String?` to ResearchWorkspace
  - Add `competitorAnalysis: String?` to ResearchWorkspace (optional)
- **Acceptance Criteria**:
  - Schema compiles without errors
  - Migration generated successfully
  - New fields nullable (no default required)

## Task 2: Implement Gemini Research Service
- **Objective**: Create all 11 Gemini generation functions
- **Files**: `backend/src/services/geminiResearchService.ts`
- **Functions**:
  1. `generateResearch(projectName, problemStatement)` → string
  2. `findResearchPapers(projectName, problemStatement)` → Paper[]
  3. `findGitHubRepositories(projectName, problemStatement)` → Repo[]
  4. `findDatasets(projectName, problemStatement)` → Dataset[]
  5. `generateArchitecture(projectName, problemStatement)` → string
  6. `generateERDiagram(projectName, problemStatement)` → string
  7. `generateFlowDiagram(projectName, problemStatement)` → string
  8. `generateDocumentation(projectName, problemStatement)` → string
  9. `generateSRS(projectName, problemStatement)` → string
  10. `generateAPIDatabase Design(projectName, problemStatement)` → string
  11. `createResearchWorkspace(userId, projectName, problemStatement)` → workspaceId (orchestrator)
- **Acceptance Criteria**:
  - All functions call Gemini with optimized prompts
  - JSON parsing for papers/repos/datasets
  - Error handling with try-catch
  - No Gemini API key exposed in code
  - Functions are testable (pure, no side effects except Gemini call)

## Task 3: Implement Pipeline Orchestrator
- **Objective**: Execute 12 stages sequentially with progress updates
- **Files**: `backend/src/services/geminiResearchService.ts`
- **Implementation**:
  - After workspace creation, fire background job
  - Loop through 12 stages
  - Call appropriate Gemini function for each stage
  - Update workspace progress and currentStage
  - Save generated content to ResearchWorkspace
  - Save papers/repos/datasets as ResearchWorkspaceItem
  - Emit Socket.IO updates for each stage
  - Set status to COMPLETED on success
  - Set status to FAILED with error message on failure
- **Acceptance Criteria**:
  - All 12 stages execute in order
  - Progress updates every stage (8%, 16%, 24%, ..., 100%)
  - Socket.IO messages sent to user
  - Workspace completed in <5 minutes
  - No blocking of HTTP response
  - Graceful error handling (stage fails, continues to next)

## Task 4: Add Socket.IO Real-time Updates
- **Objective**: Send progress updates to frontend in real-time
- **Files**: `backend/src/services/geminiResearchService.ts`
- **Implementation**:
  - Import `io` from `../server`
  - After each stage, emit `research_workspace_update` event
  - Payload: `{ workspaceId, stage, progress, timestamp }`
  - Send to authenticated user only
- **Acceptance Criteria**:
  - Events emitted after each stage completes
  - Frontend receives updates in real-time
  - Progress bar updates without page refresh
  - Current stage text updates
  - No console errors on frontend

## Task 5: Update Research Routes
- **Objective**: Ensure routes use new Gemini service
- **Files**: `backend/src/routes/researchWorkspaceRoutes.ts`
- **Changes**:
  - POST /api/research-workspace/create: Calls `createResearchWorkspace()` (orchestrator)
  - Background job runs fire-and-forget
  - Returns `{ success: true, workspaceId: "..." }` immediately
- **Acceptance Criteria**:
  - HTTP response returns in <1 second
  - Workspace visible immediately in database
  - Pipeline runs in background
  - Socket.IO updates sent to user

## Task 6: Update Frontend Workspace Types
- **Objective**: Add new fields to TypeScript interfaces
- **Files**: `frontend/src/features/workspace/types/workspace.types.ts`
- **Changes**:
  - Ensure ResearchWorkspace type includes all fields
  - Add apiDatabaseDesign: string | null
- **Acceptance Criteria**:
  - TypeScript compiles without errors
  - Types match backend schema
  - No `any` types used

## Task 7: Create API & Database Design Tab Component
- **Objective**: Display API & Database design in new tab (optional)
- **Files**: `frontend/src/features/workspace/tabs/APIDesignTab.tsx` (NEW)
- **Implementation**:
  - Display workspace.apiDatabaseDesign as formatted markdown
  - Show empty state if not generated yet
- **Acceptance Criteria**:
  - Tab displays content correctly
  - Empty state shows while generating
  - Markdown renders with proper formatting
  - Tab appears in tab navigation

## Task 8: Update Workspace Tabs to Handle New Content
- **Objective**: Ensure all tabs display generated content correctly
- **Files**: Multiple tab components
- **Changes**:
  - Research Tab: Display workspace.research
  - Papers Tab: Display papers from workspace.items
  - GitHub Tab: Display repos from workspace.items
  - Datasets Tab: Display datasets from workspace.items
  - Architecture Tab: Render workspace.architecture as Mermaid
  - ER Diagram Tab: Render workspace.erDiagram as Mermaid
  - Flow Diagram Tab: Render workspace.flowDiagram as Mermaid
  - Documentation Tab: Render workspace.documentation as Markdown
  - SRS Tab: Render workspace.srsDocument as Markdown
- **Acceptance Criteria**:
  - All tabs display content correctly
  - Empty states show while generating
  - No console errors
  - Mermaid diagrams render properly
  - Markdown renders with formatting

## Task 9: Test Pipeline End-to-End
- **Objective**: Verify entire pipeline works
- **Files**: Test in frontend UI
- **Test Steps**:
  1. Log in to application
  2. Go to DeepSearch page
  3. Enter project name: "Hospital Management System"
  4. Enter problem: "Manage patient records, appointments, and billing"
  5. Click "Start Research"
  6. Observe progress bar updating 0% → 100%
  7. Verify all tabs populate with content
  8. Check database for workspace and items
  9. Close and reopen workspace, verify data persists
- **Acceptance Criteria**:
  - All stages complete successfully
  - Progress updates in real-time
  - All tabs show generated content
  - No console errors
  - Workspace persists in database

## Task 10: Error Handling & Edge Cases
- **Objective**: Handle failures gracefully
- **Files**: `backend/src/services/geminiResearchService.ts`
- **Implementation**:
  - Wrap each stage in try-catch
  - If stage fails, log error and continue
  - Set workspace.error with error message
  - If JSON parsing fails for papers/repos/datasets, return empty array
  - If Gemini returns empty response, handle gracefully
  - Add exponential backoff retry for transient errors (optional)
- **Acceptance Criteria**:
  - Partial failures don't break entire pipeline
  - Error messages logged with timestamps
  - Frontend shows "No results" instead of blank
  - Workspace completes even if some stages fail
  - No unhandled rejections in console

## Task 11: Performance Optimization
- **Objective**: Ensure pipeline completes in reasonable time
- **Files**: `backend/src/services/geminiResearchService.ts`
- **Optimizations**:
  - Parallelize independent Gemini calls where possible (optional)
  - Batch database inserts (ResearchWorkspaceItem)
  - Use database indexes for fast queries
  - Optimize Gemini token usage (shorter prompts)
- **Acceptance Criteria**:
  - Pipeline completes in <5 minutes
  - No timeout errors
  - Database queries efficient (<500ms)
  - Socket.IO updates sent within 100ms

## Task 12: Documentation & README
- **Objective**: Document how to use the system
- **Files**: Create/update README
- **Content**:
  - How to trigger research pipeline
  - What each tab displays
  - How to interpret results
  - Limitations (Gemini-generated recommendations)
  - Future enhancements (API integrations)
- **Acceptance Criteria**:
  - Clear instructions for end users
  - Technical documentation for developers
  - Known limitations documented

---

## Implementation Order

1. ✅ Task 1: Update Database Schema
2. ✅ Task 2: Implement Gemini Service (Functions)
3. ✅ Task 3: Implement Pipeline Orchestrator
4. ✅ Task 4: Add Socket.IO Updates
5. ✅ Task 5: Update Routes
6. ✅ Task 6: Update Types
7. ✅ Task 7: Create New Tab (optional)
8. ✅ Task 8: Update Tab Components
9. ✅ Task 9: End-to-End Testing
10. ✅ Task 10: Error Handling
11. ✅ Task 11: Performance
12. ✅ Task 12: Documentation

---

## Timeline
- **MVP Implementation**: 3-4 hours
- **Testing & Debugging**: 1-2 hours
- **Total**: ~1 day

## Success Definition
- User enters project → Pipeline runs automatically → All tabs populated with Gemini-generated content → Process completes in <5 minutes
