# AI Research Operating System - Design (MVP)

## Overview

This is an MVP that uses **Gemini only** to generate all research outputs. No external APIs. Simple, fast implementation. Same UI.

---

## Architecture

### Backend Pipeline (12 Stages)

```
User clicks "Start Research"
  ↓
Create ResearchWorkspace (status = RESEARCHING, progress = 0%)
  ↓
Stage 1: Understanding Problem (Gemini analyzes input) → progress 8%
  ↓
Stage 2: Generate Research Summary (Gemini) → progress 16%
  ↓
Stage 3: Find Research Papers (Gemini recommends real papers) → progress 24%
  ↓
Stage 4: Find GitHub Repositories (Gemini recommends real repos) → progress 32%
  ↓
Stage 5: Find Datasets (Gemini recommends real datasets) → progress 40%
  ↓
Stage 6: Generate Architecture Diagram (Mermaid) → progress 50%
  ↓
Stage 7: Generate ER Diagram (Mermaid) → progress 58%
  ↓
Stage 8: Generate Flow Diagram (Mermaid) → progress 66%
  ↓
Stage 9: Generate Documentation (Markdown) → progress 75%
  ↓
Stage 10: Generate SRS (IEEE format) → progress 83%
  ↓
Stage 11: Generate API & Database Design → progress 92%
  ↓
Stage 12: Finalization → progress 100%, status = COMPLETED
  ↓
Send Socket.IO updates to frontend
  ↓
Workspace complete, all tabs populated
```

---

## Gemini Prompts (Optimized for MVP)

### Prompt 1: Understanding Problem
```
Analyze this project and extract key aspects:
Project: {projectName}
Problem: {problemStatement}

Provide:
- Core problem
- Expected outcomes
- Key challenges
```

### Prompt 2: Research Summary
```
Create a comprehensive research summary for:
Project: {projectName}
Problem: {problemStatement}

Include:
1. Executive Summary (100 words)
2. Problem Analysis (2-3 paragraphs)
3. Solution Overview (2-3 paragraphs)
4. Key Features (bullet points)
5. Technology Considerations (paragraph)
```

### Prompt 3: Research Papers (Gemini-Recommended)
```
Recommend 5-8 REAL research papers relevant to:
Project: {projectName}
Problem: {problemStatement}

For each paper, provide JSON:
{
  "title": "Exact paper title",
  "authors": "Author1, Author2",
  "year": 2023,
  "summary": "Brief summary (50 words)",
  "keyFindings": ["finding1", "finding2"],
  "url": "Link to paper (arXiv/Scholar/ResearchGate if known)"
}

Return ONLY valid JSON array. If unsure about URL, set to null.
```

### Prompt 4: GitHub Repositories (Gemini-Recommended)
```
Recommend 5-8 REAL open-source GitHub repositories relevant to:
Project: {projectName}
Problem: {problemStatement}

For each repo, provide JSON:
{
  "repoName": "Repository name",
  "description": "What it does",
  "url": "https://github.com/owner/repo",
  "stars": 1000,
  "language": "TypeScript",
  "owner": "username",
  "updatedDate": "2024-01-15"
}

Return ONLY valid JSON array. Only include REAL repos that exist on GitHub.
```

### Prompt 5: Datasets (Gemini-Recommended)
```
Recommend 5-8 REAL public datasets relevant to:
Project: {projectName}
Problem: {problemStatement}

For each dataset, provide JSON:
{
  "title": "Dataset name",
  "description": "What data it contains",
  "source": "Kaggle/HuggingFace/UCI/Kaggle/Government",
  "url": "Direct link to dataset",
  "rows": 10000,
  "columns": 25,
  "license": "CC-BY-4.0"
}

Return ONLY valid JSON array. Only include datasets with public URLs.
```

### Prompt 6: Architecture Diagram
```
Generate a Mermaid architecture diagram for:
Project: {projectName}
Problem: {problemStatement}

Show: Frontend, Backend, Database, Auth, Cache, External Services

Return ONLY Mermaid code block.
```

### Prompt 7: ER Diagram
```
Generate a Mermaid ER diagram for:
Project: {projectName}

Show: Main entities, attributes, relationships, keys

Return ONLY Mermaid code block.
```

### Prompt 8: Flow Diagram
```
Generate a Mermaid flowchart for:
Project: {projectName}

Show: Main workflows, decision points, data flow

Return ONLY Mermaid code block.
```

### Prompt 9: Technical Documentation
```
Generate technical documentation for:
Project: {projectName}
Problem: {problemStatement}

Include:
- Executive Summary
- Problem Statement
- System Objectives
- Functional Requirements (8-10)
- Non-Functional Requirements (5-6)
- Technology Stack
- Architecture Overview
- Modules & Components
- Database Design
- API Design
- Security Considerations
- Deployment Strategy

Use markdown formatting.
```

### Prompt 10: SRS Document
```
Generate IEEE SRS for:
Project: {projectName}
Problem: {problemStatement}

Include:
1. Introduction (Purpose, Scope, Definitions)
2. Overall Description (Perspective, Features, User Classes)
3. Specific Requirements (Functional, Use Cases, User Stories)
4. External Interfaces
5. Performance Requirements
6. Future Enhancements

Use professional SRS formatting.
```

### Prompt 11: API & Database Design
```
Design detailed API and database schema for:
Project: {projectName}
Problem: {problemStatement}

Provide:
1. REST API Endpoints (with methods, params, responses)
2. Database Tables (with fields, types, relationships)
3. Authentication Strategy
4. Error Handling

Use structured format.
```

---

## Database Changes

### ResearchWorkspace Model (Already Exists)
- ✅ id
- ✅ userId
- ✅ projectName
- ✅ problemStatement
- ✅ status (CREATED, RESEARCHING, COMPLETED, FAILED)
- ✅ progress (0-100)
- ✅ currentStage
- ✅ research (stores prompt #2 output)
- ✅ architecture (stores prompt #6 output)
- ✅ erDiagram (stores prompt #7 output)
- ✅ flowDiagram (stores prompt #8 output)
- ✅ documentation (stores prompt #9 output)
- ✅ srsDocument (stores prompt #10 output)
- ✅ apiDatabaseDesign (NEW: stores prompt #11 output)
- ✅ error
- ✅ createdAt, updatedAt, completedAt

### ResearchWorkspaceItem Model (Already Exists)
- ✅ Papers (type = "PAPER")
- ✅ GitHub repos (type = "GITHUB")
- ✅ Datasets (type = "DATASET")

### New Fields to Add
Add to ResearchWorkspace:
```prisma
apiDatabaseDesign String? // Stores API & database design from Prompt 11
competitorAnalysis String? // Optional: competitor analysis
technologyStack String? // Technology recommendations
```

---

## Backend Services

### geminiResearchService.ts

Functions:
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
11. `createResearchWorkspace(userId, projectName, problemStatement)` → workspaceId (MAIN ORCHESTRATOR)

### createResearchWorkspace Flow
```typescript
async function createResearchWorkspace(userId, projectName, problemStatement) {
  // Create workspace
  const workspace = await prisma.researchWorkspace.create({
    status: "RESEARCHING",
    progress: 0
  });

  // Fire-and-forget background job
  runPipeline(workspace.id, projectName, problemStatement);
  
  // Return immediately
  return workspace.id;
}

async function runPipeline(workspaceId, projectName, problemStatement) {
  try {
    // Stage 1: Understanding
    updateProgress(workspaceId, 8, "Understanding Problem");
    
    // Stage 2: Research
    updateProgress(workspaceId, 16, "Generating Research");
    const research = await generateResearch(projectName, problemStatement);
    await updateWorkspace(workspaceId, { research });
    
    // Stage 3: Papers
    updateProgress(workspaceId, 24, "Finding Research Papers");
    const papers = await findResearchPapers(projectName, problemStatement);
    for (const paper of papers) {
      await createWorkspaceItem(workspaceId, "PAPER", paper);
    }
    
    // Stage 4: GitHub
    updateProgress(workspaceId, 32, "Finding GitHub Repositories");
    const repos = await findGitHubRepositories(projectName, problemStatement);
    for (const repo of repos) {
      await createWorkspaceItem(workspaceId, "GITHUB", repo);
    }
    
    // Stage 5: Datasets
    updateProgress(workspaceId, 40, "Finding Datasets");
    const datasets = await findDatasets(projectName, problemStatement);
    for (const dataset of datasets) {
      await createWorkspaceItem(workspaceId, "DATASET", dataset);
    }
    
    // Stage 6-11: Diagrams, Docs, SRS, API Design
    // ... similar pattern
    
    // Stage 12: Finalize
    updateProgress(workspaceId, 100, "Complete");
    await updateWorkspace(workspaceId, { status: "COMPLETED" });
    
  } catch (error) {
    await updateWorkspace(workspaceId, { status: "FAILED", error: error.message });
  }
}
```

---

## Frontend Updates (Minimal)

### Existing Tabs (Keep as-is)
- Research Tab: Display workspace.research
- Papers Tab: Display workspace.items where type = "PAPER"
- GitHub Tab: Display workspace.items where type = "GITHUB"
- Datasets Tab: Display workspace.items where type = "DATASET"
- Architecture Tab: Display workspace.architecture (Mermaid)
- ER Diagram Tab: Display workspace.erDiagram (Mermaid)
- Flow Diagram Tab: Display workspace.flowDiagram (Mermaid)
- Documentation Tab: Display workspace.documentation (Markdown)
- SRS Tab: Display workspace.srsDocument (Markdown)

### New Tabs (Nice-to-Have for MVP)
- API & Database Design Tab: Display workspace.apiDatabaseDesign

### UI Updates
- ✅ Progress bar updates as stages complete
- ✅ Current stage text updates
- ✅ Tabs populate with data as they complete
- ✅ Empty states show "Generating..." while loading
- ✅ Socket.IO updates trigger UI refresh

---

## Implementation Priority

### Phase 1 (Week 1)
1. Add new Gemini service functions
2. Implement pipeline orchestrator
3. Add Socket.IO updates
4. Test with simple project

### Phase 2 (Week 2)
1. Complete all 12 stages
2. Error handling and retries
3. PDF export (if time permits)
4. UI polish

### Phase 3 (Future - Production)
1. Replace Gemini papers with arXiv API
2. Replace Gemini repos with GitHub API
3. Replace Gemini datasets with Kaggle API
4. Add Grok for trending tech
5. Add real data validation

---

## Key Points for MVP

✅ **Fast**: Gemini-only, no external API integrations  
✅ **Simple**: 12 sequential stages, clear flow  
✅ **Working**: Full pipeline produces complete output  
✅ **Same UI**: No redesign, just populate existing tabs  
✅ **Scalable Design**: Easy to replace Gemini outputs with real APIs later  
✅ **Background Processing**: Fire-and-forget, real-time progress updates  
✅ **Error Handling**: Graceful degradation if any stage fails  

---

## Success Criteria for MVP

1. User clicks "Start Research" → Workspace created instantly
2. Progress bar updates in real-time (0% → 100%)
3. All 9 tabs populate with Gemini-generated content
4. Papers, repos, datasets appear in their tabs
5. Diagrams render as Mermaid
6. Documentation and SRS display as markdown
7. No console errors
8. Process completes in <5 minutes
9. Workspace persists in database
10. User can view same workspace later
