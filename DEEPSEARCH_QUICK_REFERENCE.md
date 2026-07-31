# DeepSearch - Quick Reference Card

## File Structure

```
backend/
├── src/
│   ├── services/
│   │   ├── geminiResearchService.ts        ← Main research generation
│   │   ├── pdfGenerationService.ts         ← PDF creation (NEW)
│   │   └── cloudinaryService.ts            ← Cloud storage (NEW)
│   ├── routes/
│   │   └── researchWorkspaceRoutes.ts      ← API endpoints (UPDATED)
│   └── server.ts                            ← API registration (✓)
└── prisma/
    └── schema.prisma                        ← DB models (UPDATED)

frontend/
├── src/
│   ├── routes/
│   │   └── app.deepsearch.tsx              ← UI component (UPDATED)
│   ├── hooks/
│   │   └── useResearchWorkspace.ts         ← API hooks (✓)
│   └── firebase/
│       └── firebase.ts                      ← Auth setup (✓)
```

## Key Files Modified/Created

| File | Type | Status |
|------|------|--------|
| `geminiResearchService.ts` | Service | ✅ UPDATED (PDF integration) |
| `pdfGenerationService.ts` | Service | 🆕 NEW |
| `cloudinaryService.ts` | Service | 🆕 NEW |
| `researchWorkspaceRoutes.ts` | Routes | ✅ UPDATED (bookmark endpoint) |
| `app.deepsearch.tsx` | Component | ✅ UPDATED (functional buttons) |
| `package.json` | Config | ✅ UPDATED (new deps) |
| `.env` | Config | ✅ UPDATED (Cloudinary vars) |

## API Quick Reference

### Create Workspace
```
POST /api/research-workspace/create
Body: { projectName, problemStatement }
Returns: { workspaceId }
Time: ~2-5 minutes to complete
```

### Get Workspace
```
GET /api/research-workspace/{workspaceId}
Returns: { workspace with all generated content and items }
Poll: Every 5 seconds for updates
```

### List Workspaces
```
GET /api/research-workspace?limit=20
Returns: { count, workspaces[] }
```

### Bookmark Item
```
POST /api/research-workspace/{itemId}/bookmark
Returns: { resourceId, success: true }
Saves: To SavedResource table with category
```

## Database Models Quick Reference

### ResearchWorkspace
```prisma
id                    String @id
userId                String  // Owner
projectName           String
problemStatement      String
status                String  // CREATED | RESEARCHING | COMPLETED | FAILED
progress              Int     // 0-100
currentStage          String
research              String?
architecture          String? // Mermaid
erDiagram             String? // Mermaid
flowDiagram           String? // Mermaid
documentation         String?
srsDocument           String?
documentationPdfUrl   String? // Cloudinary
srsPdfUrl             String? // Cloudinary
documentationPdfId    String? // For deletion
srsPdfId              String? // For deletion
```

### ResearchWorkspaceItem
```prisma
id              String
workspaceId     String
type            String    // PAPER | GITHUB | DATASET
title           String
description     String?
url             String?
authors         String?        // Papers only
publishedYear   Int?           // Papers only
repoName        String?        // GitHub only
stars           Int?           // GitHub only
language        String?        // GitHub only
owner           String?        // GitHub only
rows            Int?           // Datasets only
columns         Int?           // Datasets only
datasource      String?        // Datasets: Kaggle, UCI, etc.
license         String?        // Datasets only
relevanceScore  Float
```

## Environment Variables

```env
# Required
GEMINI_API_KEY=your_key
FIREBASE_PROJECT_ID=your_project
DATABASE_URL=postgresql://...

# Optional (for PDF upload)
CLOUDINARY_CLOUD_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

## Frontend Hooks

```typescript
// Create workspace
const mutation = useCreateResearchWorkspace();
await mutation.mutateAsync({ projectName, problemStatement });

// Get workspace (auto-refetch every 5 seconds during generation)
const { data: workspace, isLoading } = useResearchWorkspace(workspaceId);

// List workspaces
const { data } = useUserResearchWorkspaces(limit);

// Bookmark resource
const bookmarkMutation = useBookmarkResource();
bookmarkMutation.mutate({ url, category, title, description });
```

## Common Tasks

### Check Generation Progress
```javascript
// In frontend component
const workspace = useResearchWorkspace(workspaceId).data;
console.log(`${workspace.progress}% - ${workspace.currentStage}`);
```

### Manually Start Generation
```javascript
// Check backend logs
// GET /api/research-workspace/{id} → status should be RESEARCHING
// Refresh every 5s to see updates
```

### Get Generated Content
```javascript
const { research, architecture, erDiagram, flowDiagram, documentation, srsDocument } = workspace;

// PDFs available at:
console.log(workspace.documentationPdfUrl);
console.log(workspace.srsPdfUrl);
```

### Bookmark Paper
```javascript
const paper = workspace.items.find(i => i.type === 'PAPER' && i.title === 'Title');
bookmarkMutation.mutate({
  url: paper.url,
  category: 'Research Paper',
  title: paper.title,
  description: paper.summary,
});
```

## Generation Stages (in order)

1. Understanding Problem (0%)
2. Researching (8%)
3. Finding Research Papers (16%)
4. Searching GitHub (24%)
5. Searching Datasets (32%)
6. Generating Architecture (40%)
7. Generating ER Diagram (50%)
8. Generating Flow Diagram (58%)
9. Writing Documentation (66%)
10. Generating SRS (75%)
11. Creating PDF (83%)
12. Finalizing (92% → 100%)

## Testing Commands

```bash
# Start backend
cd backend && npm run dev

# Start frontend
cd frontend && npm run dev

# Check database
npx prisma studio

# View logs
tail -f backend.log

# Test API
curl -X POST http://localhost:3001/api/research-workspace/create \
  -H "Authorization: Bearer {token}" \
  -d '{"projectName":"Test","problemStatement":"Test"}'
```

## Example Project Ideas to Test

- Food Waste Management System
- Hospital Management System
- College ERP
- AI Resume Screening
- Inventory Management System
- Real Estate Marketplace
- E-Learning Platform
- Supply Chain Tracking
- Telemedicine Platform
- Smart City Traffic Management

## Debugging Tips

### If research not starting:
1. Check GEMINI_API_KEY is set
2. Verify Firebase auth token is valid
3. Check database connection
4. Look for errors in backend logs

### If papers/repos not appearing:
1. Check backend logs for Gemini errors
2. Verify Gemini API quota not exceeded
3. Check ResearchWorkspaceItem table has items
4. Ensure workspace status is RESEARCHING or COMPLETED

### If PDFs not downloading:
1. Check CLOUDINARY_CLOUD_NAME is set (if using)
2. Verify PDF URLs are present in workspace
3. Check browser console for download errors
4. Try opening PDF URL directly in browser

## Performance Notes

- **Generation time**: 2-5 minutes typically
- **API response time**: <150ms (query), <30s (generation)
- **Cache time**: 30s stale, 5min memory
- **Database queries**: Indexed on userId, createdAt, status
- **PDF size**: ~500KB-2MB typically

## Security Reminders

- Never commit `.env` files
- Don't log API keys
- Verify user ownership in routes
- Use HTTPS in production
- Enable CORS properly
- Validate all inputs

## Useful Links

- [Gemini API Docs](https://ai.google.dev/)
- [Cloudinary Docs](https://cloudinary.com/documentation)
- [Prisma Docs](https://www.prisma.io/docs)
- [Firebase Docs](https://firebase.google.com/docs)
- [Mermaid Syntax](https://mermaid.js.org/)

---

**Print this card and keep it handy for quick reference!**
