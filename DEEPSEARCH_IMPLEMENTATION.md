# DeepSearch - AI Research Workspace Implementation Guide

## Overview

DeepSearch is a production-grade AI Research Workspace powered by Google Gemini API. It transforms project ideas into comprehensive research packages including documentation, architecture diagrams, research papers, GitHub repositories, and datasets.

## Architecture

### Frontend Stack
- **Framework**: React + TypeScript with Tanstack Router
- **State Management**: Tanstack Query for API data fetching and caching
- **PDF Preview**: Embedded iframe rendering
- **UI Library**: Custom card components with Framer Motion animations

### Backend Stack
- **Runtime**: Node.js with Express
- **AI Engine**: Google Gemini 2.0 Flash
- **Database**: PostgreSQL with Prisma ORM
- **PDF Generation**: jsPDF for document creation
- **Cloud Storage**: Cloudinary for PDF hosting
- **Auth**: Firebase

## Database Models

### ResearchWorkspace
Stores the main research project state:
```prisma
model ResearchWorkspace {
  id                    String   @id @default(uuid())
  userId                String
  projectName           String
  problemStatement      String
  status                String   @default("CREATED") // CREATED, RESEARCHING, COMPLETED, FAILED
  
  // Generated content
  research              String?      // Gemini-generated research
  architecture          String?      // Mermaid architecture diagram
  erDiagram             String?      // Mermaid ER diagram
  flowDiagram           String?      // Mermaid flow diagram
  srsDocument           String?      // IEEE SRS document
  documentation        String?      // Technical documentation
  
  // PDFs
  documentationPdfUrl   String?      // Cloudinary URL
  srsPdfUrl             String?      // Cloudinary URL
  documentationPdfId    String?      // Cloudinary public ID
  srsPdfId              String?      // Cloudinary public ID
  
  // Progress tracking
  currentStage          String?
  progress              Int @default(0)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  completedAt DateTime?
  
  user ResearchWorkspace @relation(fields: [userId], references: [id], onDelete: Cascade)
  items ResearchWorkspaceItem[]
  stages ResearchStage[]
}
```

### ResearchWorkspaceItem
Stores discovered resources (papers, repos, datasets):
```prisma
model ResearchWorkspaceItem {
  id              String @id @default(uuid())
  workspaceId     String
  type            String // "PAPER", "GITHUB", "DATASET"
  
  // Common
  title           String
  description     String?
  url             String?
  
  // Paper-specific
  authors         String?
  publishedYear   Int?
  summary         String?
  
  // GitHub-specific
  repoName        String?
  stars           Int?
  language        String?
  owner           String?
  
  // Dataset-specific
  rows            Int?
  columns         Int?
  datasource      String? // "Kaggle", "UCI", "HuggingFace", "OpenML", "Government"
  license         String?
  
  relevanceScore  Float @default(0.5)
  confidence      Float @default(0.5)
  
  workspace ResearchWorkspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
}
```

## API Endpoints

### Create Research Workspace
```http
POST /api/research-workspace/create
Content-Type: application/json
Authorization: Bearer {firebase_token}

{
  "projectName": "Food Waste Management System",
  "problemStatement": "Build a system to reduce food waste in hospitals..."
}

Response:
{
  "success": true,
  "workspaceId": "uuid-here"
}
```

### Get Research Workspace
```http
GET /api/research-workspace/{workspaceId}
Authorization: Bearer {firebase_token}

Response:
{
  "id": "uuid",
  "projectName": "Food Waste Management System",
  "status": "COMPLETED",
  "progress": 100,
  "research": "...",
  "architecture": "mermaid diagram...",
  "erDiagram": "mermaid diagram...",
  "flowDiagram": "mermaid diagram...",
  "documentation": "...",
  "srsDocument": "...",
  "documentationPdfUrl": "https://cloudinary.com/...",
  "srsPdfUrl": "https://cloudinary.com/...",
  "items": [
    {
      "id": "uuid",
      "type": "PAPER",
      "title": "Research Paper Title",
      "authors": "Author1, Author2",
      "publishedYear": 2023,
      "url": "https://arxiv.org/...",
      "summary": "..."
    }
  ],
  "stages": [...]
}
```

### List User Workspaces
```http
GET /api/research-workspace?limit=20
Authorization: Bearer {firebase_token}

Response:
{
  "success": true,
  "count": 5,
  "workspaces": [...]
}
```

### Bookmark Research Item
```http
POST /api/research-workspace/{itemId}/bookmark
Authorization: Bearer {firebase_token}

Response:
{
  "success": true,
  "resourceId": "uuid"
}
```

## Generation Stages (12 Total)

The research generation follows these stages in sequence:

1. **Understanding Problem** (0-8%)
   - Analyzes the project idea and problem statement

2. **Researching** (8-16%)
   - Generates comprehensive research analysis

3. **Finding Research Papers** (16-24%)
   - Discovers relevant academic papers using Gemini-powered search

4. **Searching GitHub** (24-32%)
   - Finds relevant open-source repositories

5. **Searching Datasets** (32-40%)
   - Identifies public datasets relevant to the project

6. **Generating Architecture** (40-50%)
   - Creates Mermaid architecture diagram

7. **Generating ER Diagram** (50-58%)
   - Creates Mermaid entity-relationship diagram

8. **Generating Flow Diagram** (58-66%)
   - Creates Mermaid process flow diagram

9. **Writing Documentation** (66-75%)
   - Generates technical documentation

10. **Generating SRS** (75-83%)
    - Creates IEEE-style SRS document

11. **Creating PDF** (83-92%)
    - Generates and uploads PDFs to Cloudinary

12. **Finalizing** (92-100%)
    - Completes the workspace

## Frontend Components

### Main Component: `AnalyticsDashboard`
Located at: `frontend/src/routes/app.deepsearch.tsx`

**State Management:**
```typescript
const [activeTab, setActiveTab] = useState<'search' | 'workspace'>('search');
const [projectName, setProjectName] = useState('');
const [problemStatement, setProblemStatement] = useState('');
const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null);

const createWorkspaceMutation = useCreateResearchWorkspace();
const workspaceQuery = useResearchWorkspace(activeWorkspaceId || '');
```

**Key Features:**
- Input form for project details
- Real-time progress tracking
- Tab-based content display
- Full-screen diagram views
- PDF preview and download
- Bookmark functionality

### Tabs

1. **Research** - Full research summary text
2. **Papers** - Discovered research papers with external links
3. **GitHub** - GitHub repositories with star counts and language info
4. **Datasets** - Discovered datasets with row/column counts
5. **Architecture** - Mermaid diagram with fullscreen view
6. **ER Diagram** - Mermaid entity-relationship diagram
7. **Flow Diagram** - Mermaid process flow diagram
8. **Docs** - Technical documentation with PDF download
9. **SRS** - Software requirements specification with PDF download

## Frontend Hooks

### `useCreateResearchWorkspace()`
Mutation for creating a new research workspace.

```typescript
const mutation = useCreateResearchWorkspace();
const result = await mutation.mutateAsync({
  projectName: "Food Waste Management",
  problemStatement: "Build a system to..."
});
```

### `useResearchWorkspace(workspaceId)`
Query for fetching workspace data with auto-refetch every 5 seconds during generation.

```typescript
const { data: workspace, isLoading } = useResearchWorkspace(workspaceId);
```

## Backend Services

### `geminiResearchService.ts`

**Core Functions:**

```typescript
// Main generation workflow
createResearchWorkspace(userId, projectName, problemStatement): Promise<string>

// Individual generators
generateResearch(projectName, problemStatement): Promise<string>
generateArchitecture(projectName, problemStatement): Promise<string>
generateERDiagram(projectName, problemStatement): Promise<string>
generateFlowDiagram(projectName, problemStatement): Promise<string>
generateDocumentation(projectName, problemStatement): Promise<string>
generateSRS(projectName, problemStatement): Promise<string>

// Resource discovery
findResearchPapers(projectName, problemStatement): Promise<Paper[]>
findGitHubRepositories(projectName, problemStatement): Promise<Repo[]>
findDatasets(projectName, problemStatement): Promise<Dataset[]>

// Utilities
getResearchWorkspace(workspaceId): Promise<Workspace>
listUserWorkspaces(userId, limit): Promise<Workspace[]>
```

### `pdfGenerationService.ts`

Generates professional PDFs using jsPDF.

```typescript
generatePDF(options: PDFGenerationOptions): Buffer
generateDocumentationPDF(projectName, documentation, author?): Buffer
generateSRSPDF(projectName, srsDocument, author?): Buffer
```

### `cloudinaryService.ts`

Handles PDF uploads and cloud storage.

```typescript
uploadPDFToCloudinary(
  pdfBuffer: Buffer, 
  filename: string, 
  folder?: string
): Promise<CloudinaryUploadResult>

deletePDFFromCloudinary(publicId: string): Promise<boolean>
getSecureUrl(publicId: string): string | null
isCloudinaryConfigured(): boolean
```

## Environment Variables

### Required

```env
# Firebase
FIREBASE_PROJECT_ID=your_project_id

# Gemini API
GEMINI_API_KEY=your_gemini_api_key

# Cloudinary (optional, PDF uploads will be skipped if not configured)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Getting API Keys

**Gemini:**
1. Go to [Google AI Studio](https://aistudio.google.com)
2. Create a new project
3. Generate API key

**Cloudinary:**
1. Sign up at [Cloudinary](https://cloudinary.com)
2. Go to Account Settings
3. Copy Cloud Name and API credentials

## Installation & Setup

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Migrate database
npx prisma migrate deploy

# Start server
npm run dev
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

### Environment Configuration

1. Copy `.env.template` to `.env`
2. Add your Gemini API key
3. (Optional) Add Cloudinary credentials for PDF uploads
4. Ensure DATABASE_URL is set

## Usage Flow

### User Perspective

1. **Navigate to DeepSearch** → `/app/deepsearch`
2. **Enter Project Details**
   - Project name: e.g., "Food Waste Management System"
   - Problem statement: Describe the problem
3. **Click "Start Research Analysis"**
4. **Watch Real-Time Progress**
   - Progress bar updates every 5 seconds
   - Current stage displayed
5. **View Results** (Auto-populated as each stage completes)
   - Research summary
   - Papers with external links
   - GitHub repositories with bookmark option
   - Datasets with download links
   - Architecture diagrams
   - Entity-relationship diagram
   - Process flow diagram
   - Technical documentation with PDF download
   - SRS document with PDF download
6. **Save Items to Bookmarks**
   - Click bookmark icon on any card
   - Saved to `SavedResource` table
7. **Download PDFs**
   - Click Download button for Docs or SRS
   - Opens PDF from Cloudinary
   - Or saves locally

## Real-Time Updates

The frontend polls the backend every 5 seconds to check for progress updates:

```typescript
const { data: workspace } = useResearchWorkspace(workspaceId);
// Automatically refetches every 5 seconds during RESEARCHING status
```

As each stage completes:
1. Backend updates `ResearchWorkspace.progress`
2. Backend updates `ResearchWorkspace.currentStage`
3. Backend creates `ResearchStage` record
4. Frontend receives updated data
5. Progress bar animates to new percentage
6. Content tabs populate with new data

## Error Handling

### Generation Failures
- If any stage fails, status set to "FAILED"
- Error message stored in workspace
- UI displays error state
- User can retry or start new research

### PDF Generation
- PDFs are optional - if Cloudinary not configured, research still completes
- Warning logged but generation continues
- PDF URLs remain null if upload fails

### API Errors
- All errors caught and returned with descriptive messages
- Firebase auth failures return 401
- Ownership verification returns 403
- Invalid requests return 400
- Server errors return 500 with error details

## Performance Considerations

### Caching
- Research workspaces cached with 30-second stale time
- Auto-refetch every 5 seconds for active generation
- Infinite cache time after generation completes

### Parallel Execution
- All Gemini calls parallelized where possible
- Database writes batched for efficiency
- PDF generation only when documentation/SRS complete

### Database Optimization
- Indexes on `userId`, `createdAt`, `status`
- Eager loading of `items` and `stages` relationships
- Proper foreign key constraints

## Troubleshooting

### PDFs Not Uploading
1. Check `CLOUDINARY_CLOUD_NAME` environment variable
2. Verify `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET`
3. Ensure Cloudinary account is active
4. Check network connectivity

### Research Generation Fails
1. Verify `GEMINI_API_KEY` is valid
2. Check API rate limits
3. Ensure adequate project quotas
4. Check Firebase authentication

### Content Not Appearing
1. Refresh the page
2. Check browser console for errors
3. Verify workspace ID is correct
4. Ensure user has access to workspace

## Future Enhancements

1. **Real-time WebSocket updates** instead of polling
2. **Custom prompts** for specialized research
3. **Multi-language support** for generated content
4. **Batch research** for multiple projects
5. **Collaboration** on shared workspaces
6. **Version history** of generated documents
7. **Export to Word/HTML** formats
8. **Custom templates** for documentation
9. **Integration with project management tools**
10. **AI-powered Q&A** about research results

## Testing

### Manual Testing Checklist

- [ ] Create new research workspace
- [ ] Monitor progress bar updates
- [ ] Verify all content tabs populate correctly
- [ ] Test external links (papers, repos, datasets)
- [ ] Bookmark items and verify they save
- [ ] Download PDFs and verify they work
- [ ] Test fullscreen diagram views
- [ ] Test copy to clipboard functionality
- [ ] Verify pagination of items
- [ ] Test on mobile/tablet view

### Example Test Projects

```
1. Food Waste Management System
   - Problem: Reduce food waste in large organizations
   - Expected: Agriculture, IoT, ML papers; Waste tracking repos

2. Hospital Management System
   - Problem: Streamline patient and resource management
   - Expected: Healthcare datasets; Hospital software repos

3. AI Resume Screening
   - Problem: Automate recruitment process
   - Expected: NLP papers; ML datasets; Resume parsing repos

4. College ERP
   - Problem: Unified college management platform
   - Expected: ERP systems repos; Education datasets

5. Inventory Management
   - Problem: Real-time inventory tracking
   - Expected: Supply chain papers; Inventory management tools
```

## Support & Contributions

For issues, questions, or contributions:
1. Check the troubleshooting section
2. Review the API documentation
3. Check database schema
4. Enable debug logging in services

---

**Version**: 1.0.0
**Last Updated**: 2024
**Status**: Production Ready
