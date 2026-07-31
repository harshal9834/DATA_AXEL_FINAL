# Backend API Documentation

## Overview

Complete REST API documentation for the DATA AXEL INSIGHT backend. All endpoints require Firebase authentication unless otherwise noted.

---

## Authentication

All protected endpoints require a Firebase ID token in the Authorization header:

```
Authorization: Bearer <firebase_id_token>
```

The token is automatically attached by the frontend `api-client.ts`.

---

## Base URL

```
http://localhost:3001/api
```

---

## Endpoints

### Dashboard Endpoints

#### Get Dashboard Summary
```
GET /dashboard/summary
```

Returns key metrics overview.

**Response:**
```json
{
  "projectsCount": 24,
  "researchCount": 187,
  "resourcesCount": 1243,
  "aiSessionsCount": 512,
  "documentationCount": 96,
  "innovationScore": 91
}
```

---

#### Get Dashboard Metrics
```
GET /dashboard/metrics
```

Returns metric cards with trends and historical data.

**Response:**
```json
[
  {
    "label": "Projects",
    "value": 24,
    "delta": "+12%",
    "icon": "layers",
    "data": [4, 6, 5, 8, 7, 10, 12],
    "metric": "total_projects"
  },
  ...
]
```

**Cache:** 5 minutes

---

#### Get Recent Projects
```
GET /dashboard/recent-projects?limit=4
```

Returns user's recent projects sorted by last updated.

**Query Parameters:**
- `limit` (optional): Number of projects to return (default: 4, max: 20)

**Response:**
```json
[
  {
    "id": "uuid",
    "title": "AI for Food Waste Reduction",
    "domain": "Sustainability",
    "status": "In Progress",
    "progress": 68,
    "research": 82,
    "updated": "2h ago",
    "description": "...",
    "objectives": [],
    "users": [],
    "outcome": ""
  }
]
```

**Cache:** 3 minutes

---

#### Get Recommendations
```
GET /dashboard/recommendations
```

Returns personalized recommendations for today.

**Response:**
```json
{
  "today": [
    "Prototype a real-time surplus-matching algorithm",
    "Interview 3 restaurant managers this week",
    "Draft the ML feature store spec"
  ],
  "trending": [
    "Small Language Models",
    "Retrieval-Augmented Agents",
    "Edge AI on RISC-V"
  ],
  "research": [
    "LLM-guided causal discovery (arXiv 2410.xxxx)",
    "Zero-shot forecasting with time-series foundation models",
    "Multimodal medical reasoning benchmarks"
  ],
  "hackathons": [
    {
      "name": "Global AI Summit Hack",
      "date": "Dec 5",
      "prize": "$50k"
    }
  ]
}
```

**Cache:** 2 minutes

---

#### Get Trending Technologies
```
GET /dashboard/trending-tech
```

Returns trending technologies.

**Response:**
```json
[
  "Small Language Models",
  "Retrieval-Augmented Agents",
  "Edge AI on RISC-V",
  "Diffusion Policies",
  "Federated Learning"
]
```

**Cache:** 30 minutes

---

#### Get Latest Research
```
GET /dashboard/latest-research
```

Returns latest research papers from user's collection.

**Response:**
```json
[
  "Predicting Restaurant Food Waste with Transformer-based Demand Models",
  "Large Language Models as Zero-shot Forecasters",
  "Multimodal Medical Reasoning Benchmarks"
]
```

**Cache:** 30 minutes

---

#### Get All Projects
```
GET /dashboard/all-projects?page=1&limit=20
```

Returns paginated list of all user projects.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 50)

**Response:**
```json
{
  "total": 42,
  "page": 1,
  "limit": 20,
  "projects": [
    {
      "id": "uuid",
      "title": "Project Name",
      "domain": "Category",
      "status": "In Progress",
      "progress": 68,
      "updated": "2h ago"
    }
  ]
}
```

**Cache:** 2 minutes

---

#### Mark Recommendation as Viewed
```
POST /dashboard/mark-recommendation-viewed/:id
```

Marks a recommendation as viewed.

**Response:**
```json
{
  "success": true
}
```

---

### Resources Endpoints

#### Get Bookmarked Resources
```
GET /resources?category=GitHub&page=1&limit=12
```

Returns user's bookmarked resources.

**Query Parameters:**
- `category` (optional): Filter by category
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 12)

**Categories:**
- GitHub
- Research Papers
- Datasets
- Courses
- Videos
- Blogs
- API Libraries
- Tools

**Response:**
```json
{
  "total": 45,
  "page": 1,
  "limit": 12,
  "resources": [
    {
      "id": "uuid",
      "cat": "GitHub",
      "title": "awesome-ai-research",
      "tags": ["curated", "papers"],
      "difficulty": "All",
      "color": "from-indigo-500 to-blue-500",
      "url": "https://...",
      "description": "..."
    }
  ]
}
```

**Cache:** 5 minutes

---

#### Bookmark a Resource
```
POST /resources/bookmark
```

Saves a new resource to user's bookmarks.

**Request Body:**
```json
{
  "category": "GitHub",
  "title": "awesome-ai-research",
  "url": "https://github.com/awesome/ai-research",
  "description": "Curated list of AI research papers",
  "tags": ["curated", "papers"],
  "difficulty": "All"
}
```

**Response:**
```json
{
  "success": true,
  "resource": {
    "id": "uuid",
    "cat": "GitHub",
    "title": "awesome-ai-research",
    "tags": ["curated", "papers"],
    "difficulty": "All"
  }
}
```

**Status Codes:**
- 201: Created
- 409: Resource already bookmarked

---

#### Remove Bookmarked Resource
```
DELETE /resources/:id
```

Removes a bookmarked resource.

**Response:**
```json
{
  "success": true
}
```

---

#### Get Resource Categories
```
GET /resources/categories/list
```

Returns available resource categories.

**Response:**
```json
[
  "GitHub",
  "Research Papers",
  "Datasets",
  "Courses",
  "Videos",
  "Blogs",
  "API Libraries",
  "Tools"
]
```

---

### Analytics Endpoints

#### Track AI Session Start
```
POST /analytics/track-session
```

Starts tracking an AI session.

**Request Body:**
```json
{
  "workflowId": "workflow-uuid",
  "type": "workflow",
  "language": "en",
  "voiceUsed": false,
  "llmUsed": "openrouter",
  "tokensUsed": 0
}
```

**Response:**
```json
{
  "success": true,
  "sessionId": "session-uuid"
}
```

---

#### End AI Session
```
POST /analytics/end-session/:sessionId
```

Ends AI session tracking with final metrics.

**Request Body:**
```json
{
  "messageCount": 12,
  "tokensUsed": 4250
}
```

**Response:**
```json
{
  "success": true,
  "session": {
    "id": "session-uuid",
    "duration": 930000,
    "messageCount": 12,
    "tokensUsed": 4250,
    "estimatedCost": 0.043
  }
}
```

---

#### Get User Analytics
```
GET /analytics/user
```

Returns user's aggregated analytics.

**Response:**
```json
{
  "id": "uuid",
  "userId": "user-uuid",
  "projectsCreated": 24,
  "researchGenerated": 187,
  "aiCallsMade": 512,
  "voiceSessionsCount": 45,
  "documentsGenerated": 96,
  "totalMessagesExchanged": 2350,
  "totalTokensUsed": 125000,
  "innovationScore": 91,
  "lastActiveAt": "2025-07-31T...",
  "createdAt": "2025-07-20T..."
}
```

**Cache:** 10 minutes

---

#### Get Past Sessions
```
GET /analytics/sessions?limit=20
```

Returns user's past AI sessions.

**Query Parameters:**
- `limit` (optional): Number of sessions (default: 20)

**Response:**
```json
[
  {
    "id": "session-uuid",
    "userId": "user-uuid",
    "workflowId": "workflow-uuid",
    "type": "workflow",
    "startedAt": "2025-07-31T10:00:00Z",
    "endedAt": "2025-07-31T10:15:30Z",
    "duration": 930000,
    "messageCount": 12,
    "language": "en",
    "voiceUsed": true,
    "llmUsed": "openrouter",
    "tokensUsed": 4250,
    "estimatedCost": 0.043
  }
]
```

**Cache:** 5 minutes

---

#### Update Innovation Score
```
POST /analytics/update-innovation-score
```

Updates user's innovation score.

**Request Body:**
```json
{
  "score": 92
}
```

**Score Range:** 0-100

**Response:**
```json
{
  "success": true,
  "innovationScore": 92
}
```

---

### Workflow Endpoints (Existing)

#### Create Workflow
```
POST /workflows
```

Creates a new workflow and starts AI execution.

**Request Body:**
```json
{
  "idea": "Build AI for Food Waste Reduction"
}
```

**Response:**
```json
{
  "success": true,
  "workflowId": "workflow-uuid"
}
```

---

#### Get Workflow Dashboard
```
GET /workflows/dashboard
```

Returns active tasks and analytics for dashboard.

**Response:**
```json
{
  "activeTasks": [...],
  "liveActivity": [...],
  "analytics": [...]
}
```

---

#### Get Blueprint
```
GET /workflows/:id/blueprint
```

Retrieves project blueprint for approval.

---

#### Approve Blueprint
```
POST /workflows/:id/approve-blueprint
```

Approves architecture blueprint to proceed to backend generation.

---

### Workspace Endpoints (Existing)

#### Get Workspace
```
GET /workspace/:workflowId
```

Returns complete workspace state including all agent results.

---

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error message describing what went wrong"
}
```

**Common Status Codes:**
- 200: Success
- 201: Created
- 400: Bad Request (validation error)
- 401: Unauthorized (missing/invalid token)
- 404: Not Found
- 409: Conflict (e.g., resource already exists)
- 500: Internal Server Error

---

## Rate Limiting

No strict rate limiting implemented, but recommended:
- Dashboard endpoints: 60 requests/minute
- Analytics endpoints: 100 requests/minute
- Resources endpoints: 100 requests/minute

---

## Caching Strategy

Frontend caching via TanStack Query:
- Dashboard metrics: 5 minutes
- Recent projects: 3 minutes
- Recommendations: 2 minutes
- Trending tech: 30 minutes
- Latest research: 30 minutes
- User analytics: 10 minutes

Manual cache invalidation:
```typescript
const { invalidateAll } = useInvalidateDashboard();
invalidateAll();
```

---

## WebSocket Events (Real-time)

Dashboard updates in real-time via Socket.io:

```
workflow_progress      - Workflow progress update
agent_started          - Agent execution started
agent_progress         - Agent progress update
agent_completed        - Agent completed
agent_failed           - Agent failed
ai_thinking            - AI thinking state
log_created            - System log created
analysis_generated     - Analysis completed
backend_generated      - Backend code generated
workflow_completed     - Workflow completed
workflow_failed        - Workflow failed
workflow_status        - Status change
```

---

## Examples

### Track Complete Workflow
```bash
# 1. Create workflow
curl -X POST http://localhost:3001/api/workflows \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"idea": "Build food waste AI"}'

# Response: { "workflowId": "abc123" }

# 2. Start tracking session
curl -X POST http://localhost:3001/api/analytics/track-session \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"workflowId": "abc123", "type": "workflow"}'

# Response: { "sessionId": "sess456" }

# 3. [Workflow executes in background, updates in real-time via Socket.io]

# 4. End tracking session
curl -X POST http://localhost:3001/api/analytics/end-session/sess456 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"messageCount": 50, "tokensUsed": 8500}'

# Response: { "session": {...metrics} }

# 5. Get updated dashboard
curl -X GET http://localhost:3001/api/dashboard/summary \
  -H "Authorization: Bearer $TOKEN"

# Response: { "projectsCount": 25, ... }
```

---

## Development

### Add New Endpoint

1. Create route in `src/routes/{feature}Routes.ts`
2. Add authentication middleware
3. Implement business logic
4. Register route in `src/server.ts`
5. Add API client method in `frontend/src/lib/api-client.ts`
6. Create React hook in `frontend/src/hooks/use{Feature}Data.ts`
7. Use hook in components

---

## Environment Variables

```
DATABASE_URL=postgresql://user:pass@host:5432/db
OPENROUTER_API_KEY=sk_...
FIREBASE_PROJECT_ID=project-id
PORT=3001
```

---

## Testing Endpoints

### Using cURL
```bash
# Get dashboard summary
curl -X GET http://localhost:3001/api/dashboard/summary \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Using Postman
1. Set Collection variable: `token` = Firebase ID token
2. Add to Headers: `Authorization: Bearer {{token}}`
3. Create requests for each endpoint

---

## Support

For issues or questions, check:
- `MIGRATION_GUIDE.md` - Database and overall architecture
- `backend/API_DOCUMENTATION.md` - This file
- Issue tracker on GitHub
