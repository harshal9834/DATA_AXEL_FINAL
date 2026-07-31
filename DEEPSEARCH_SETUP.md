# DeepSearch AI Research Workspace - Setup & Verification

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Firebase project
- Google Gemini API key
- (Optional) Cloudinary account for PDF storage

### Step 1: Backend Setup

```bash
cd backend

# Install new dependencies for PDF & Cloudinary
npm install

# Run database migrations
npx prisma migrate deploy

# (Optional) Seed test data
npm run prisma:seed

# Start development server
npm run dev
```

The backend will start on `http://localhost:3001`

### Step 2: Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will start on `http://localhost:5173` or `http://localhost:3000`

### Step 3: Configure Environment

#### Backend (.env)
```env
# Required
GEMINI_API_KEY=your_gemini_api_key
FIREBASE_PROJECT_ID=your_firebase_project
DATABASE_URL=your_postgres_url

# Optional (for PDF uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

#### Frontend (.env)
```env
VITE_BACKEND_URL=http://localhost:3001
VITE_FIREBASE_PROJECT_ID=your_firebase_project
```

## API Keys & Credentials

### Google Gemini API

1. Go to [Google AI Studio](https://aistudio.google.com)
2. Click "Create API Key"
3. Copy the key
4. Add to `GEMINI_API_KEY` in `.env`

**Free Tier Limits:**
- 60 requests per minute
- 1,500 requests per day

### Cloudinary (Optional)

1. Sign up at [Cloudinary](https://cloudinary.com)
2. Go to Settings → API Keys
3. Copy:
   - Cloud Name
   - API Key
   - API Secret
4. Add to `.env`

**Free Tier Includes:**
- 25 GB storage
- 25 GB bandwidth
- Unlimited uploads

### Firebase

1. Create project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication (Google provider)
3. Copy Project ID
4. Add to `.env` files

## Database Schema

The schema includes new models for the research workspace:

```bash
# View schema
npx prisma studio

# Create new migration after schema changes
npx prisma migrate dev --name migration_name

# Deploy migrations to production
npx prisma migrate deploy
```

## Testing DeepSearch

### Manual Test Flow

1. **Start Both Servers**
   ```bash
   # Terminal 1: Backend
   cd backend && npm run dev

   # Terminal 2: Frontend
   cd frontend && npm run dev
   ```

2. **Navigate to DeepSearch**
   - Go to `http://localhost:5173/app/deepsearch` (or your frontend URL)
   - You should see "New Research" and "Workspace" tabs

3. **Create Research Workspace**
   - Enter project name: "Food Waste Management System"
   - Problem statement: "Build an AI-powered system to reduce food waste in hospitals"
   - Click "Start Research Analysis"

4. **Monitor Progress**
   - Watch the progress bar advance from 0-100%
   - Stage indicator updates: "Understanding Problem", "Researching", etc.
   - Takes ~2-5 minutes depending on Gemini API speed

5. **Verify Generated Content**
   - [ ] Research Summary appears
   - [ ] Papers tab shows 5-8 papers with titles and links
   - [ ] GitHub tab shows 5-8 repositories with stars
   - [ ] Datasets tab shows 5-8 datasets with row counts
   - [ ] Architecture diagram appears (Mermaid)
   - [ ] ER diagram appears (Mermaid)
   - [ ] Flow diagram appears (Mermaid)
   - [ ] Documentation tab has content
   - [ ] SRS tab has content

6. **Test Interactive Features**
   - [ ] Click external link icons - opens paper/repo/dataset
   - [ ] Click bookmark icon - saves to resources
   - [ ] Copy button copies paper link
   - [ ] Download PDF button (if Cloudinary configured)
   - [ ] Fullscreen diagram button
   - [ ] Tab switching between views

### Debugging

**Check Backend Logs**
```bash
# Backend terminal should show:
[GeminiResearch] Starting research for workspace: {id}
[GeminiResearch] ✅ Researching completed
[GeminiResearch] ✅ Papers found: 8
[GeminiResearch] ✅ Repositories found: 7
[GeminiResearch] ✅ Datasets found: 6
```

**Check Frontend Console**
```javascript
// Open DevTools (F12) and check Console tab
// Should see API calls to:
// POST /api/research-workspace/create
// GET /api/research-workspace/{id}
```

**Check Database**
```bash
# Open Prisma Studio
npm run prisma:studio

# Navigate to ResearchWorkspace table
# Should see your workspace with status RESEARCHING → COMPLETED
# Check ResearchWorkspaceItem for papers, repos, datasets
# Check ResearchStage for 12 stages with timestamps
```

## Common Issues & Fixes

### Issue: "GEMINI_API_KEY not found"
```
Error: [GeminiResearch] ❌ GEMINI_API_KEY is not set
```
**Fix:**
- Check `.env` file in backend directory
- Ensure `GEMINI_API_KEY=` has a value
- Don't include quotes in actual key
- Restart backend server after changing .env

### Issue: "Network error connecting to Gemini"
```
Error: Error calling Gemini: Request failed
```
**Fix:**
- Verify internet connection
- Check API key is valid
- Check Gemini API quotas not exceeded
- Ensure rate limits not hit (60 req/min free tier)

### Issue: "Database connection failed"
```
Error: P1000: Authentication failed
```
**Fix:**
- Verify `DATABASE_URL` in `.env`
- Check database is running
- Verify credentials
- Try connecting with psql directly

### Issue: "PDFs not uploading"
```
Warning: [Cloudinary] Skipping upload - credentials not configured
```
**Fix:**
- Add Cloudinary credentials to `.env` (optional)
- Or continue without PDFs - research will complete anyway
- Research output will have `documentationPdfUrl: null`

### Issue: "External links returning 404"
```
Gemini returned papers/repos/datasets that don't exist
```
**Note:** This is rare but can happen if Gemini's data is outdated
- Gemini is instructed to only return verified URLs
- If it happens, it's a Gemini model limitation
- Papers/repos still have titles and descriptions

### Issue: "Frontend can't reach backend"
```
Error: Failed to fetch API
```
**Fix:**
- Verify `VITE_BACKEND_URL` in frontend `.env`
- Check backend is running on port 3001
- Check CORS is enabled in backend
- Try `http://localhost:3001` not `127.0.0.1:3001`

## Performance Tuning

### Gemini API Optimization
```typescript
// In geminiResearchService.ts
const response = await model.generateContent({
  // Adjust these for faster/better results:
  temperature: 0.7,           // Lower = more deterministic
  maxOutputTokens: 4000,      // Higher = longer responses
});
```

### Database Query Optimization
```sql
-- Add indexes for faster queries
CREATE INDEX idx_research_workspace_user_created 
ON research_workspace(user_id, created_at);

CREATE INDEX idx_research_item_workspace_type 
ON research_workspace_item(workspace_id, type);
```

### Frontend Caching
```typescript
// In useResearchWorkspace hook
staleTime: 30 * 1000,      // Data fresh for 30s
refetchInterval: 5000,     // Refetch every 5s during generation
gcTime: 5 * 60 * 1000,     // Keep in memory for 5 min
```

## Production Deployment

### Backend (Node.js)

```bash
# Build
npm run build

# Start production
NODE_ENV=production npm start
```

**Environment Variables (Production)**
```env
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://user:pass@host:5432/db
GEMINI_API_KEY=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
FIREBASE_PROJECT_ID=...
```

### Frontend (Deployed to Vercel/Netlify)

```bash
# Build
npm run build

# Deploy to Vercel
vercel deploy

# Or Netlify
netlify deploy --prod
```

**Environment Variables (Production)**
```env
VITE_BACKEND_URL=https://your-api.com
VITE_FIREBASE_PROJECT_ID=...
```

## Monitoring & Logging

### Backend Logging

The service includes detailed logging:

```typescript
// Available log levels
console.log()    // General info
console.warn()   // Warnings (e.g., PDF upload skipped)
console.error()  // Errors (will fail gracefully)
```

**Key Log Lines to Monitor**
```
[GeminiResearch] Starting research for workspace: {id}
[GeminiResearch] ✅ Research completed
[GeminiResearch] Error calling Gemini: {error}
[Cloudinary] ✅ PDF uploaded: {url}
[Cloudinary] Skipping upload - credentials not configured
```

### Frontend Error Tracking

```typescript
// Errors shown as toast notifications
import { toast } from 'sonner';

toast.error('Failed to start research')
toast.success('Research started!')
```

## Backup & Recovery

### Database Backups

```bash
# Backup PostgreSQL database
pg_dump -U user -h host dbname > backup.sql

# Restore
psql -U user -h host dbname < backup.sql
```

### Cloudinary Backups

Cloudinary automatically keeps CDN backups. To backup locally:

```javascript
// Export all PDFs from Cloudinary
const cloudinary = require('cloudinary').v2;
const resources = await cloudinary.api.resources({
  type: 'upload',
  resource_type: 'raw',
  max_results: 500,
});
```

## Security Considerations

### API Keys
- Never commit `.env` files
- Use environment variables in production
- Rotate Gemini API key quarterly
- Use service-to-service auth for Cloudinary

### Database
- Use strong PostgreSQL passwords
- Enable SSL connections
- Regular backups to secure location
- Restrict database access by IP

### Firebase
- Enable reCAPTCHA for auth
- Set up security rules for data
- Enable audit logging
- Use service accounts for backend

### File Uploads
- Sanitize filenames before storage
- Verify file types
- Set upload size limits
- Use CDN for served files

## Scaling Considerations

### Horizontal Scaling
- Use load balancer for multiple backend instances
- Use connection pooling for database
- Cache research results for popular queries
- Queue long-running Gemini calls

### Vertical Scaling
- Upgrade database instance size
- Increase Node.js memory allocation
- Upgrade Gemini API tier
- Increase Cloudinary storage

### Caching Strategy
```
Level 1: Frontend (React Query) - 30 seconds
Level 2: Backend (In-memory) - 5 minutes
Level 3: CDN (Cloudinary) - 24 hours
Level 4: Database - Permanent
```

## Troubleshooting Checklist

- [ ] Backend server running (`npm run dev`)
- [ ] Frontend server running (`npm run dev`)
- [ ] Database accessible and migrated
- [ ] Gemini API key valid and in `.env`
- [ ] Firebase authentication configured
- [ ] Browser console shows no errors
- [ ] Network tab shows API calls succeeding
- [ ] Prisma Studio shows workspace created
- [ ] Research progress advancing (check logs)
- [ ] Content appearing in tabs as generation completes

## Support Resources

- **Gemini API Docs**: https://ai.google.dev/
- **Cloudinary Docs**: https://cloudinary.com/documentation
- **Prisma Docs**: https://www.prisma.io/docs
- **Firebase Docs**: https://firebase.google.com/docs
- **React Query**: https://tanstack.com/query/latest

---

**Version**: 1.0.0
**Last Updated**: 2024
**Status**: Production Ready
