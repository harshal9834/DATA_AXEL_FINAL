-- Migration: add_research_workspace
-- Created: 2026-07-31
-- Applied via: prisma db push (tables already exist in DB)
-- Purpose: Adds ResearchWorkspace, ResearchWorkspaceItem, ResearchStage models
--          and a @@unique([id, userId]) constraint on Workflow

-- ─── Workflow unique constraint ───────────────────────────────────────────────
ALTER TABLE "Workflow" ADD CONSTRAINT "Workflow_id_userId_key" UNIQUE ("id", "userId");

-- ─── ResearchWorkspace ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "ResearchWorkspace" (
    "id"                   TEXT NOT NULL,
    "userId"               TEXT NOT NULL,
    "projectName"          TEXT NOT NULL,
    "problemStatement"     TEXT NOT NULL,
    "status"               TEXT NOT NULL DEFAULT 'CREATED',
    "research"             TEXT,
    "architecture"         TEXT,
    "erDiagram"            TEXT,
    "flowDiagram"          TEXT,
    "srsDocument"          TEXT,
    "documentation"        TEXT,
    "documentationPdfUrl"  TEXT,
    "srsPdfUrl"            TEXT,
    "documentationPdfId"   TEXT,
    "srsPdfId"             TEXT,
    "documentationPdfSize" INTEGER,
    "srsPdfSize"           INTEGER,
    "currentStage"         TEXT,
    "progress"             INTEGER NOT NULL DEFAULT 0,
    "totalStages"          INTEGER NOT NULL DEFAULT 12,
    "error"                TEXT,
    "createdAt"            TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"            TIMESTAMP(3) NOT NULL,
    "completedAt"          TIMESTAMP(3),

    CONSTRAINT "ResearchWorkspace_pkey" PRIMARY KEY ("id")
);

-- ─── ResearchWorkspaceItem ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "ResearchWorkspaceItem" (
    "id"              TEXT NOT NULL,
    "workspaceId"     TEXT NOT NULL,
    "type"            TEXT NOT NULL,
    "title"           TEXT NOT NULL,
    "description"     TEXT,
    "url"             TEXT,
    "authors"         TEXT,
    "publishedYear"   INTEGER,
    "summary"         TEXT,
    "keyFindings"     TEXT,
    "applications"    TEXT,
    "repoName"        TEXT,
    "stars"           INTEGER,
    "language"        TEXT,
    "owner"           TEXT,
    "updatedDate"     TIMESTAMP(3),
    "rows"            INTEGER,
    "columns"         INTEGER,
    "downloadSource"  TEXT,
    "license"         TEXT,
    "datasource"      TEXT,
    "relevanceScore"  DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "confidence"      DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResearchWorkspaceItem_pkey" PRIMARY KEY ("id")
);

-- ─── ResearchStage ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "ResearchStage" (
    "id"            TEXT NOT NULL,
    "workspaceId"   TEXT NOT NULL,
    "stageName"     TEXT NOT NULL,
    "status"        TEXT NOT NULL DEFAULT 'PENDING',
    "message"       TEXT,
    "startedAt"     TIMESTAMP(3),
    "completedAt"   TIMESTAMP(3),
    "durationMs"    INTEGER,

    CONSTRAINT "ResearchStage_pkey" PRIMARY KEY ("id")
);

-- ─── Foreign Keys ─────────────────────────────────────────────────────────────
ALTER TABLE "ResearchWorkspace"
    ADD CONSTRAINT "ResearchWorkspace_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ResearchWorkspaceItem"
    ADD CONSTRAINT "ResearchWorkspaceItem_workspaceId_fkey"
    FOREIGN KEY ("workspaceId") REFERENCES "ResearchWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ResearchStage"
    ADD CONSTRAINT "ResearchStage_workspaceId_fkey"
    FOREIGN KEY ("workspaceId") REFERENCES "ResearchWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── Indexes ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS "ResearchWorkspace_userId_createdAt_idx" ON "ResearchWorkspace"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "ResearchWorkspace_status_idx" ON "ResearchWorkspace"("status");
CREATE INDEX IF NOT EXISTS "ResearchWorkspaceItem_workspaceId_type_idx" ON "ResearchWorkspaceItem"("workspaceId", "type");
CREATE INDEX IF NOT EXISTS "ResearchStage_workspaceId_idx" ON "ResearchStage"("workspaceId");
