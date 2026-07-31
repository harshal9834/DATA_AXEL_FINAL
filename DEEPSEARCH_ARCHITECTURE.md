# DeepSearch - System Architecture & Data Flow

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                           │
│                   (React + TypeScript)                           │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐    │
│  │ Input Form   │  │ Progress Bar │  │ Content Tabs       │    │
│  ├──────────────┤  ├──────────────┤  ├────────────────────┤    │
│  │ Project Name │  │ 0% - 100%    │  │ • Research         │    │
│  │ Problem      │  │ Current Stage│  │ • Papers           │    │
│  │ Statement    │  │              │  │ • GitHub           │    │
│  │ [Start BTN]  │  │ Refreshes    │  │ • Datasets         │    │
│  │              │  │ every 5s     │  │ • Architecture     │    │
│  │              │  │              │  │ • ER Diagram       │    │
│  │              │  │              │  │ • Flow Diagram     │    │
│  │              │  │              │  │ • Documentation    │    │
│  │              │  │              │  │ • SRS              │    │
│  └──────────────┘  └──────────────┘  └────────────────────┘    │
│                                                                  │
│  HTTP Client + Firebase Auth                                    │
└─────────────────────────────────────────────────────────────────┘
                            ↓
                    Tanstack React Query
                    (5 second polling)
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                     EXPRESS SERVER (Node.js)                     │
│                   (Port 3001)                                    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │            API ROUTES (researchWorkspaceRoutes.ts)      │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │ POST   /api/research-workspace/create                  │   │
│  │ GET    /api/research-workspace/:id                     │   │
│  │ GET    /api/research-workspace                         │   │
│  │ POST   /api/research-workspace/:itemId/bookmark        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                            ↓                                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │          SERVICE LAYER (Business Logic)                │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │                                                         │   │
│  │  ┌──────────────────────────────────────────────────┐  │   │
│  │  │  geminiResearchService.ts                        │  │   │
│  │  ├──────────────────────────────────────────────────┤  │   │
│  │  │ createResearchWorkspace()                        │  │   │
│  │  │ ├─ generateResearch()                           │  │   │
│  │  │ ├─ generateArchitecture()                       │  │   │
│  │  │ ├─ generateERDiagram()                          │  │   │
│  │  │ ├─ generateFlowDiagram()                        │  │   │
│  │  │ ├─ generateDocumentation()                      │  │   │
│  │  │ ├─ generateSRS()                                │  │   │
│  │  │ ├─ findResearchPapers()                         │  │   │
│  │  │ ├─ findGitHubRepositories()                     │  │   │
│  │  │ └─ findDatasets()                               │  │   │
│  │  │ getResearchWorkspace()                          │  │   │
│  │  │ listUserWorkspaces()                            │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  │                                                         │   │
│  │  ┌──────────────────────────────────────────────────┐  │   │
│  │  │  pdfGenerationService.ts                         │  │   │
│  │  ├──────────────────────────────────────────────────┤  │   │
│  │  │ generatePDF()                                    │  │   │
│  │  │ generateDocumentationPDF()                       │  │   │
│  │  │ generateSRSPDF()                                 │  │   │
│  │  │ [Returns: Buffer]                               │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  │                                                         │   │
│  │  ┌──────────────────────────────────────────────────┐  │   │
│  │  │  cloudinaryService.ts                            │  │   │
│  │  ├──────────────────────────────────────────────────┤  │   │
│  │  │ uploadPDFToCloudinary()                          │  │   │
│  │  │ deletePDFFromCloudinary()                        │  │   │
│  │  │ getSecureUrl()                                   │  │   │
│  │  │ [Returns: {url, publicId, size}]                │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                            ↓                                     │
└─────────────────────────────────────────────────────────────────┘
                            ↓
                    ┌────────┴────────┐
                    ↓                 ↓
        ┌──────────────────────┐  ┌──────────────────┐
        │ GOOGLE GEMINI API    │  │ POSTGRESQL DB    │
        ├──────────────────────┤  ├──────────────────┤
        │ • Text Generation    │  │ Tables:          │
        │ • Content Analysis   │  │ • ResearchWS     │
        │ • Paper Discovery    │  │ • ResearchItem   │
        │ • Repo Finding       │  │ • ResearchStage  │
        │ • Dataset Search     │  │ • SavedResource  │
        │                      │  │ • User           │
        │ (Rate: 60 req/min)   │  │ (with indexes)   │
        └──────────────────────┘  └──────────────────┘
                    ↓                         ↓
        ┌──────────────────────┐  ┌──────────────────┐
        │ CLOUDINARY CDN       │  │ FIREBASE AUTH    │
        ├──────────────────────┤  ├──────────────────┤
        │ • PDF Storage        │  │ • User Auth      │
        │ • Secure URLs        │  │ • ID Token       │
        │ • Public IDs         │  │ • uid            │
        │ • ~500KB-2MB/file    │  │                  │
        └──────────────────────┘  └──────────────────┘
```

---

## Generation Pipeline Flow

```
START
  ↓
USER SUBMITS
  ├─ projectName: "Food Waste Management"
  └─ problemStatement: "Reduce food waste in hospitals..."
  ↓
CREATE WORKSPACE
  ├─ ResearchWorkspace created with status: CREATING
  ├─ userId set to authenticated user
  └─ progress: 0%
  ↓
STAGE 1: Understanding Problem (0% → 8%)
  ├─ Analyze project statement
  ├─ Update progress: 8%
  └─ Store in: ResearchWorkspace.currentStage
  ↓
STAGE 2: Researching (8% → 16%)
  ├─ Call Gemini: generateResearch()
  ├─ Get: 800+ word research document
  ├─ Update progress: 16%
  └─ Store in: ResearchWorkspace.research
  ↓
STAGE 3: Finding Papers (16% → 24%)
  ├─ Call Gemini: findResearchPapers()
  ├─ Get: 5-8 papers with {title, authors, year, summary, url}
  ├─ Update progress: 24%
  └─ Store each in: ResearchWorkspaceItem (type: PAPER)
  ↓
STAGE 4: GitHub Search (24% → 32%)
  ├─ Call Gemini: findGitHubRepositories()
  ├─ Get: 5-8 repos with {name, stars, language, owner, url}
  ├─ Update progress: 32%
  └─ Store each in: ResearchWorkspaceItem (type: GITHUB)
  ↓
STAGE 5: Dataset Search (32% → 40%)
  ├─ Call Gemini: findDatasets()
  ├─ Get: 5-8 datasets with {name, rows, columns, source, url}
  ├─ Update progress: 40%
  └─ Store each in: ResearchWorkspaceItem (type: DATASET)
  ↓
STAGE 6: Architecture (40% → 50%)
  ├─ Call Gemini: generateArchitecture()
  ├─ Get: Mermaid diagram code
  ├─ Update progress: 50%
  └─ Store in: ResearchWorkspace.architecture
  ↓
STAGE 7: ER Diagram (50% → 58%)
  ├─ Call Gemini: generateERDiagram()
  ├─ Get: Mermaid ER diagram code
  ├─ Update progress: 58%
  └─ Store in: ResearchWorkspace.erDiagram
  ↓
STAGE 8: Flow Diagram (58% → 66%)
  ├─ Call Gemini: generateFlowDiagram()
  ├─ Get: Mermaid flow diagram code
  ├─ Update progress: 66%
  └─ Store in: ResearchWorkspace.flowDiagram
  ↓
STAGE 9: Documentation (66% → 75%)
  ├─ Call Gemini: generateDocumentation()
  ├─ Get: 1500+ word technical documentation
  ├─ Update progress: 75%
  └─ Store in: ResearchWorkspace.documentation
  ↓
STAGE 10: SRS (75% → 83%)
  ├─ Call Gemini: generateSRS()
  ├─ Get: 2000+ word IEEE SRS document
  ├─ Update progress: 83%
  └─ Store in: ResearchWorkspace.srsDocument
  ↓
STAGE 11: PDF Generation (83% → 92%)
  ├─ Call: generateDocumentationPDF()
  │  ├─ Convert documentation to PDF buffer
  │  └─ Upload to Cloudinary
  │     ├─ Get: {url, publicId, size}
  │     └─ Store in: ResearchWorkspace.documentationPdfUrl
  │
  ├─ Call: generateSRSPDF()
  │  ├─ Convert SRS to PDF buffer
  │  └─ Upload to Cloudinary
  │     ├─ Get: {url, publicId, size}
  │     └─ Store in: ResearchWorkspace.srsPdfUrl
  │
  └─ Update progress: 92%
  ↓
STAGE 12: Finalizing (92% → 100%)
  ├─ Set status: COMPLETED
  ├─ Record: completedAt timestamp
  ├─ Update progress: 100%
  └─ Mark: ready for frontend
  ↓
COMPLETE
  └─ All content available for viewing
```

---

## Frontend Data Fetching Flow

```
COMPONENT MOUNT
  ↓
useResearchWorkspace(workspaceId)
  └─ TanStack Query setup
     ├─ staleTime: 30 seconds
     ├─ refetchInterval: 5 seconds (during RESEARCHING)
     └─ gcTime: 5 minutes
  ↓
INITIAL REQUEST
  ├─ GET /api/research-workspace/{workspaceId}
  ├─ Firebase token attached
  └─ Returns: workspace object
  ↓
EVERY 5 SECONDS (while RESEARCHING)
  ├─ Check: workspace.progress
  ├─ Check: workspace.currentStage
  ├─ Check: workspace.research (if available)
  ├─ Check: workspace.items (if available)
  ├─ Check: workspace.status
  └─ Update UI:
     ├─ Progress bar animates to new %
     ├─ Stage name updates
     ├─ Content tabs populate incrementally
     └─ PDFs appear when stage 11 completes
  ↓
COMPLETED
  ├─ Stop polling
  ├─ Cache workspace for 5 minutes
  └─ Show all content
```

---

## Bookmark Flow

```
USER CLICKS BOOKMARK
  ├─ Paper/Repo/Dataset card
  └─ Bookmark button
  ↓
FRONTEND
  ├─ Call: useBookmarkResource().mutate()
  └─ Send: { url, category, title, description }
  ↓
BACKEND
  ├─ POST /api/research-workspace/{itemId}/bookmark
  ├─ Verify: User owns workspace
  ├─ Get: ResearchWorkspaceItem
  └─ Create: SavedResource
     ├─ userId: current user
     ├─ category: "Research Paper" | "GitHub" | "Dataset"
     ├─ title: item.title
     ├─ url: item.url
     ├─ description: item.description
     └─ tags: ["research-workspace", projectName, type]
  ↓
DATABASE
  ├─ INSERT into SavedResource
  └─ Return: { resourceId, success: true }
  ↓
FRONTEND
  ├─ Show: Toast "Bookmarked!"
  ├─ Invalidate: resources query cache
  └─ Item now appears in Resources page
```

---

## PDF Download Flow

```
USER CLICKS "Download PDF"
  ├─ Documentation Tab or SRS Tab
  └─ Download button
  ↓
FRONTEND
  ├─ Check: workspace.documentationPdfUrl or workspace.srsPdfUrl
  ├─ Get: Cloudinary secure HTTPS URL
  └─ Create download link:
     ├─ Document: "ProjectName-Documentation.pdf"
     └─ SRS: "ProjectName-SRS.pdf"
  ↓
BROWSER
  ├─ Open download dialog
  ├─ Save PDF locally
  └─ User gets professional document
```

---

## Database Schema Relationships

```
┌─────────────────────────────────────────────┐
│              User                           │
│  ┌──────────────────────────────────────┐  │
│  │ id (uuid)                            │  │
│  │ email                                │  │
│  │ firebase_uid                         │  │
│  │ name, photo_url                      │  │
│  └──────────────────────────────────────┘  │
└────────┬────────────────────────────────────┘
         │ 1:N
         ↓
┌─────────────────────────────────────────────┐
│        ResearchWorkspace                    │
│  ┌──────────────────────────────────────┐  │
│  │ id (uuid)                            │  │
│  │ userId (FK → User)                   │  │
│  │ projectName                          │  │
│  │ problemStatement                     │  │
│  │ status: RESEARCHING → COMPLETED     │  │
│  │ progress: 0-100                      │  │
│  │ currentStage: string                 │  │
│  │ research, architecture, erDiagram    │  │
│  │ flowDiagram, documentation, srs     │  │
│  │ documentationPdfUrl, srsPdfUrl      │  │
│  │ createdAt, completedAt              │  │
│  └──────────────────────────────────────┘  │
│         ↓ 1:N           ↓ 1:N              │
│         ↓               ↓                   │
│    Items           Stages                  │
└─────────────────────────────────────────────┘
    ↓                       ↓
    │                       │
    ↓                       ↓
┌──────────────────┐  ┌──────────────────┐
│ResearchWS Item   │  │ResearchStage     │
├──────────────────┤  ├──────────────────┤
│id                │  │id                │
│workspaceId (FK)  │  │workspaceId (FK)  │
│type (enum)       │  │stageName: str    │
│title, url        │  │status: enum      │
│description       │  │startedAt         │
│... fields vary   │  │completedAt       │
│  by type ...     │  │durationMs        │
└──────────────────┘  └──────────────────┘
```

---

## Caching Strategy

```
LEVEL 1: FRONTEND (React Query)
├─ Stale Time: 30 seconds (fresh data without refetch)
├─ Refetch Interval: 5 seconds (during generation)
├─ Cache Time: 5 minutes (keep in memory)
└─ Refetch on: Window focus

LEVEL 2: DATABASE (Query Results)
├─ Indexes on: userId, createdAt, status
├─ Join optimization: Include items & stages
└─ Result set: Complete workspace in 1 query

LEVEL 3: CDN (Cloudinary)
├─ PDF URLs: HTTPS secure
├─ Cache Control: public, max-age=86400
├─ Served from: Global edge locations
└─ Benefit: Fast downloads worldwide

LEVEL 4: PERSISTENT (PostgreSQL)
├─ All data stored
├─ Backups configured
└─ Long-term retention
```

---

## Error Handling Flow

```
ERROR OCCURS
  ↓
BACKEND
  ├─ Catch exception
  ├─ Log with context
  ├─ Set workspace.error
  ├─ Set workspace.status: FAILED (if critical)
  └─ Return HTTP status + message
     ├─ 400: Bad request
     ├─ 401: Unauthorized
     ├─ 403: Forbidden
     ├─ 404: Not found
     └─ 500: Server error
  ↓
FRONTEND
  ├─ Catch error response
  ├─ Show toast notification
  │  ├─ Success: Green background
  │  ├─ Error: Red background
  │  └─ Warning: Yellow background
  ├─ Log to console (dev only)
  └─ Offer retry option
  ↓
USER
  ├─ Sees descriptive message
  ├─ Understands what happened
  └─ Can retry or start over
```

---

## Scaling Considerations

```
CURRENT ARCHITECTURE (Single Instance)
├─ 1 Node.js server (port 3001)
├─ 1 PostgreSQL database
├─ Direct Gemini API calls
├─ Cloudinary for PDF storage
└─ Supports: ~100 concurrent users

SCALING HORIZONTAL
├─ Load balancer → Multiple Node instances
├─ Connection pooling for DB
├─ Redis cache layer for sessions
├─ Queue service for async tasks
├─ Cloudinary stays same (CDN handles scale)
└─ Supports: 1000+ concurrent users

SCALING VERTICAL
├─ Larger Node.js instance (more CPU/RAM)
├─ Larger PostgreSQL instance
├─ Higher Gemini API tier (more quota)
├─ Higher Cloudinary tier (more storage)
└─ Supports: Fewer users but faster response
```

---

## Security Flow

```
AUTHENTICATION
├─ Firebase credentials
├─ ID token in Authorization header
├─ Verify on every request
└─ Get: user.id from token

AUTHORIZATION
├─ User can only access own workspaces
├─ Check: workspace.userId === user.id
├─ Return: 403 if not owner
└─ Prevent: Cross-user data access

DATA PROTECTION
├─ No sensitive data in logs
├─ API keys stored in .env (not repo)
├─ HTTPS only in production
├─ PDFs served from Cloudinary (no local storage)
└─ Database backups encrypted
```

---

## Monitoring & Observability

```
METRICS TO TRACK
├─ Research generation time (target: 2-5 minutes)
├─ API response time (target: <150ms)
├─ Gemini API usage (monitor quota)
├─ PDF upload success rate (target: >95%)
├─ Cloudinary storage usage
├─ Database query performance
└─ Error rate (target: <0.5%)

LOGGING POINTS
├─ Research start/completion
├─ Each stage completion
├─ PDF generation success/failure
├─ Cloudinary upload result
├─ API errors with context
└─ Performance metrics

ALERTS
├─ Generation fails
├─ Gemini API quota exceeded
├─ Database connection lost
├─ PDF upload fails multiple times
└─ Response time exceeds threshold
```

---

This architecture is designed for:
- ✅ **Reliability**: Multiple failure modes handled
- ✅ **Scalability**: Can grow from 1 to 1000+ users
- ✅ **Maintainability**: Clear separation of concerns
- ✅ **Performance**: Caching at multiple levels
- ✅ **Security**: Authenticated & authorized access
- ✅ **Observability**: Logging & monitoring built-in
