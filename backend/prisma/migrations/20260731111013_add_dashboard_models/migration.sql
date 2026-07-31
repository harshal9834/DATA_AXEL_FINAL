-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "firebase_uid" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "photo_url" TEXT,
    "provider" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "language" TEXT NOT NULL DEFAULT 'en',
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Workflow" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "problemStatement" TEXT,
    "idea" TEXT NOT NULL,
    "domain" TEXT,
    "priority" TEXT,
    "timeline" TEXT,
    "status" TEXT NOT NULL DEFAULT 'CREATED',
    "expectedDeliverables" TEXT,
    "additionalNotes" TEXT,
    "overallProgress" INTEGER NOT NULL DEFAULT 0,
    "currentAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Workflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowAgent" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'WAITING',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "currentTask" TEXT,
    "executionTime" TEXT,
    "outputJson" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "error" TEXT,

    CONSTRAINT "WorkflowAgent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResearchResult" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "ResearchResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InnovationResult" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "InnovationResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArchitectureResult" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "ArchitectureResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentationResult" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "DocumentationResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BackendResult" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "BackendResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FrontendResult" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "FrontendResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalysisResult" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "AnalysisResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowLog" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "agentName" TEXT,
    "level" TEXT NOT NULL DEFAULT 'info',
    "title" TEXT NOT NULL,
    "detail" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkflowLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Analytics" (
    "id" TEXT NOT NULL,
    "metric" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectBlueprint" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "researchSummary" TEXT NOT NULL,
    "innovationSummary" TEXT NOT NULL,
    "architecture" TEXT NOT NULL,
    "databaseSchema" TEXT NOT NULL,
    "folderStructure" TEXT NOT NULL,
    "apiDesign" TEXT NOT NULL,
    "approvedAt" TIMESTAMP(3),
    "approvedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "ProjectBlueprint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MemoryNode" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "entityName" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "attributes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MemoryNode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MemoryEdge" (
    "id" TEXT NOT NULL,
    "sourceNodeId" TEXT NOT NULL,
    "targetNodeId" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MemoryEdge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConversationMemory" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConversationMemory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectMemoryState" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "projectName" TEXT,
    "problemStatement" TEXT,
    "targetUsers" TEXT,
    "industry" TEXT,
    "goals" TEXT,
    "completedPhases" TEXT,
    "pendingPhases" TEXT,
    "generatedFiles" TEXT,
    "generatedAPIs" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectMemoryState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrendingTechnology" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "mention" INTEGER NOT NULL DEFAULT 1,
    "lastUpdated" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrendingTechnology_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResearchPaper" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "authors" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "url" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "summary" TEXT,
    "keywords" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResearchPaper_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recommendation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "actionLink" TEXT,
    "viewed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "Recommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hackathon" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "prize" TEXT,
    "registrationDate" TIMESTAMP(3),
    "eventDate" TIMESTAMP(3) NOT NULL,
    "website" TEXT,
    "status" TEXT NOT NULL DEFAULT 'UPCOMING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Hackathon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedResource" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "description" TEXT,
    "tags" TEXT,
    "difficulty" TEXT,
    "savedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedResource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AISession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "workflowId" TEXT,
    "type" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "duration" INTEGER,
    "messageCount" INTEGER NOT NULL DEFAULT 0,
    "language" TEXT NOT NULL DEFAULT 'en',
    "voiceUsed" BOOLEAN NOT NULL DEFAULT false,
    "llmUsed" TEXT,
    "tokensUsed" INTEGER NOT NULL DEFAULT 0,
    "estimatedCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AISession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAnalytics" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "projectsCreated" INTEGER NOT NULL DEFAULT 0,
    "researchGenerated" INTEGER NOT NULL DEFAULT 0,
    "aiCallsMade" INTEGER NOT NULL DEFAULT 0,
    "voiceSessionsCount" INTEGER NOT NULL DEFAULT 0,
    "documentsGenerated" INTEGER NOT NULL DEFAULT 0,
    "totalMessagesExchanged" INTEGER NOT NULL DEFAULT 0,
    "totalTokensUsed" INTEGER NOT NULL DEFAULT 0,
    "innovationScore" INTEGER NOT NULL DEFAULT 0,
    "lastActiveAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DashboardMetric" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "metric" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "previousValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "delta" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "dataPoints" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DashboardMetric_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_firebase_uid_key" ON "User"("firebase_uid");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ResearchResult_workflowId_key" ON "ResearchResult"("workflowId");

-- CreateIndex
CREATE UNIQUE INDEX "InnovationResult_workflowId_key" ON "InnovationResult"("workflowId");

-- CreateIndex
CREATE UNIQUE INDEX "ArchitectureResult_workflowId_key" ON "ArchitectureResult"("workflowId");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentationResult_workflowId_key" ON "DocumentationResult"("workflowId");

-- CreateIndex
CREATE UNIQUE INDEX "BackendResult_workflowId_key" ON "BackendResult"("workflowId");

-- CreateIndex
CREATE UNIQUE INDEX "FrontendResult_workflowId_key" ON "FrontendResult"("workflowId");

-- CreateIndex
CREATE UNIQUE INDEX "AnalysisResult_workflowId_key" ON "AnalysisResult"("workflowId");

-- CreateIndex
CREATE UNIQUE INDEX "Analytics_metric_userId_key" ON "Analytics"("metric", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectBlueprint_workflowId_key" ON "ProjectBlueprint"("workflowId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectMemoryState_workflowId_key" ON "ProjectMemoryState"("workflowId");

-- CreateIndex
CREATE UNIQUE INDEX "TrendingTechnology_name_key" ON "TrendingTechnology"("name");

-- CreateIndex
CREATE INDEX "TrendingTechnology_name_idx" ON "TrendingTechnology"("name");

-- CreateIndex
CREATE INDEX "ResearchPaper_userId_createdAt_idx" ON "ResearchPaper"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Recommendation_userId_createdAt_idx" ON "Recommendation"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Hackathon_eventDate_idx" ON "Hackathon"("eventDate");

-- CreateIndex
CREATE INDEX "SavedResource_userId_category_idx" ON "SavedResource"("userId", "category");

-- CreateIndex
CREATE UNIQUE INDEX "SavedResource_userId_url_key" ON "SavedResource"("userId", "url");

-- CreateIndex
CREATE INDEX "AISession_userId_startedAt_idx" ON "AISession"("userId", "startedAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserAnalytics_userId_key" ON "UserAnalytics"("userId");

-- CreateIndex
CREATE INDEX "DashboardMetric_userId_idx" ON "DashboardMetric"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DashboardMetric_userId_metric_key" ON "DashboardMetric"("userId", "metric");

-- AddForeignKey
ALTER TABLE "Workflow" ADD CONSTRAINT "Workflow_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowAgent" ADD CONSTRAINT "WorkflowAgent_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResearchResult" ADD CONSTRAINT "ResearchResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InnovationResult" ADD CONSTRAINT "InnovationResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArchitectureResult" ADD CONSTRAINT "ArchitectureResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentationResult" ADD CONSTRAINT "DocumentationResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BackendResult" ADD CONSTRAINT "BackendResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FrontendResult" ADD CONSTRAINT "FrontendResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalysisResult" ADD CONSTRAINT "AnalysisResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowLog" ADD CONSTRAINT "WorkflowLog_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Analytics" ADD CONSTRAINT "Analytics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectBlueprint" ADD CONSTRAINT "ProjectBlueprint_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectBlueprint" ADD CONSTRAINT "ProjectBlueprint_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemoryNode" ADD CONSTRAINT "MemoryNode_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemoryEdge" ADD CONSTRAINT "MemoryEdge_sourceNodeId_fkey" FOREIGN KEY ("sourceNodeId") REFERENCES "MemoryNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemoryEdge" ADD CONSTRAINT "MemoryEdge_targetNodeId_fkey" FOREIGN KEY ("targetNodeId") REFERENCES "MemoryNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationMemory" ADD CONSTRAINT "ConversationMemory_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMemoryState" ADD CONSTRAINT "ProjectMemoryState_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResearchPaper" ADD CONSTRAINT "ResearchPaper_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedResource" ADD CONSTRAINT "SavedResource_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AISession" ADD CONSTRAINT "AISession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAnalytics" ADD CONSTRAINT "UserAnalytics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DashboardMetric" ADD CONSTRAINT "DashboardMetric_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
