import { generateResponse } from '../../config/AIProvider';
import { mcpLogger } from '../../utils/logger';
import { io } from '../../server';
import { BaseAgent } from './baseAgent';
import { ResearchAgentResult } from './researchAgent';
import { InnovationAgentResult } from './innovationAgent';

export interface ArchitectureAgentInput {
  workflowId: string;
  agentId: string;
  projectIdea: string;
  researchData: ResearchAgentResult;
  innovationData: InnovationAgentResult;
}

export interface ArchitectureAgentResult {
  techStack: string;
  systemArchitectureMermaid: string;
  erDiagramMermaid: string;
  databaseTables: Array<{
    name: string;
    columns: string;
  }>;
  apiEndpoints: Array<{
    method: string;
    endpoint: string;
    purpose: string;
  }>;
  securityChecklist: string[];
  deploymentSummary: string;
  markdown?: string;
}

// ─── Enrichment layer ────────────────────────────────────────────────────────
function enrichArchitecture(idea: string, research: ResearchAgentResult, raw: Partial<ArchitectureAgentResult>): ArchitectureAgentResult {
  const ideaWords = idea.toLowerCase().split(' ');
  const isDelivery = ideaWords.some(w => ['delivery', 'food', 'order'].includes(w));

  const defaultMermaid = isDelivery ? `graph TD
    A[Customer App\\nReact Native] -->|HTTPS| B[API Gateway\\nNginx]
    B --> C[Auth Service\\nFirebase Auth]
    B --> D[Order Service\\nNode.js]
    B --> E[Payment Service\\nStripe]
    B --> F[Notification Service\\nFCM]
    D --> G[(PostgreSQL\\nOrders DB)]
    D --> H[(Redis\\nSession Cache)]
    E --> I[Stripe API]
    F --> J[Firebase FCM]
    G --> K[Backup\\nAWS S3]` : `graph TD
    A[Client App\\nReact/Next.js] -->|HTTPS/REST| B[API Gateway\\nNginx/ALB]
    B --> C[Auth Service\\nJWT/OAuth]
    B --> D[Core Service\\nNode.js/Express]
    B --> E[AI Service\\nPython/FastAPI]
    D --> F[(PostgreSQL\\nPrimary DB)]
    D --> G[(Redis\\nCache Layer)]
    E --> H[OpenAI API]
    F --> I[Read Replica\\nPostgres]
    G --> J[Session Store]
    B --> K[CDN\\nCloudFront]`;

  const defaultER = isDelivery ? `erDiagram
    USERS ||--o{ ORDERS : places
    RESTAURANTS ||--o{ MENU_ITEMS : has
    MENU_ITEMS ||--o{ ORDER_ITEMS : contains
    ORDERS ||--o{ ORDER_ITEMS : includes
    ORDERS ||--|| PAYMENTS : has
    RIDERS ||--o{ ORDERS : delivers
    USERS {
      uuid id PK
      string name
      string email
      string phone
      string address
    }
    ORDERS {
      uuid id PK
      uuid user_id FK
      uuid restaurant_id FK
      uuid rider_id FK
      decimal total
      string status
      timestamp created_at
    }
    PAYMENTS {
      uuid id PK
      uuid order_id FK
      string stripe_id
      decimal amount
      string status
    }` : `erDiagram
    USERS ||--o{ PROJECTS : owns
    PROJECTS ||--o{ TASKS : contains
    TASKS ||--o{ COMMENTS : has
    USERS ||--o{ ACTIVITY_LOGS : generates
    USERS {
      uuid id PK
      string name
      string email
      string role
      timestamp created_at
    }
    PROJECTS {
      uuid id PK
      uuid user_id FK
      string title
      string status
      timestamp created_at
    }
    TASKS {
      uuid id PK
      uuid project_id FK
      string title
      string priority
      string status
    }`;

  const defaultTables = isDelivery ? [
    { name: 'users', columns: 'id (PK), name, email, phone, address, created_at' },
    { name: 'restaurants', columns: 'id (PK), name, location, rating, is_active' },
    { name: 'orders', columns: 'id (PK), user_id (FK), restaurant_id (FK), total, status, created_at' },
    { name: 'riders', columns: 'id (PK), name, phone, status, location' },
    { name: 'payments', columns: 'id (PK), order_id (FK), amount, method, status' },
  ] : [
    { name: 'users', columns: 'id (PK), name, email, role, created_at' },
    { name: 'projects', columns: 'id (PK), user_id (FK), title, description, status' },
    { name: 'sessions', columns: 'id (PK), user_id (FK), token, expires_at' },
    { name: 'audit_logs', columns: 'id (PK), user_id (FK), action, resource, timestamp' },
    { name: 'settings', columns: 'id (PK), user_id (FK), key, value, updated_at' },
  ];

  const defaultApis = isDelivery ? [
    { method: 'POST', endpoint: '/api/auth/login', purpose: 'User authentication' },
    { method: 'GET', endpoint: '/api/restaurants', purpose: 'List available restaurants' },
    { method: 'POST', endpoint: '/api/orders', purpose: 'Create new order' },
    { method: 'GET', endpoint: '/api/orders/:id', purpose: 'Track order status' },
    { method: 'POST', endpoint: '/api/payments', purpose: 'Process payment via Stripe' },
    { method: 'GET', endpoint: '/api/riders/:id/location', purpose: 'Get real-time rider location' },
  ] : [
    { method: 'POST', endpoint: '/api/auth/register', purpose: 'User registration' },
    { method: 'POST', endpoint: '/api/auth/login', purpose: 'Authentication + JWT' },
    { method: 'GET', endpoint: '/api/users/me', purpose: 'Get current user profile' },
    { method: 'GET', endpoint: '/api/projects', purpose: 'List user projects' },
    { method: 'POST', endpoint: '/api/projects', purpose: 'Create project' },
    { method: 'DELETE', endpoint: '/api/projects/:id', purpose: 'Delete project' },
  ];

  const techStackNames = research.technologies?.length
    ? research.technologies.join(', ')
    : 'React, Next.js, Node.js, Express, PostgreSQL, Redis, Docker, AWS';

  return {
    techStack: raw.techStack || techStackNames,
    systemArchitectureMermaid: raw.systemArchitectureMermaid || defaultMermaid,
    erDiagramMermaid: raw.erDiagramMermaid || defaultER,
    databaseTables: raw.databaseTables?.length ? raw.databaseTables : defaultTables,
    apiEndpoints: raw.apiEndpoints?.length ? raw.apiEndpoints : defaultApis,
    securityChecklist: raw.securityChecklist?.length ? raw.securityChecklist : [
      'JWT Authentication with refresh tokens',
      'HTTPS / TLS 1.3 enforced',
      'Rate limiting on all endpoints (100 req/min)',
      'Input validation and sanitization',
      'Password hashing with bcrypt (rounds=12)',
      'CORS whitelist configuration',
      'SQL injection prevention via parameterized queries',
      'XSS protection via Content Security Policy',
      'OWASP Top 10 compliance review',
    ],
    deploymentSummary: raw.deploymentSummary || `
**Frontend:** Vercel (automatic HTTPS, global CDN, zero-config deployment)
**Backend:** AWS EC2 / Render.com (auto-scaling, managed SSL)
**Database:** AWS RDS PostgreSQL (automated backups, multi-AZ)
**Cache:** Redis Cloud (managed, persistent, sub-ms latency)
**CI/CD:** GitHub Actions (build → test → deploy pipeline)
**Monitoring:** Prometheus + Grafana + Sentry error tracking
    `.trim(),
  };
}

export class ArchitectureAgent extends BaseAgent {
  constructor() { super(); }

  public validate(input: any): boolean {
    return !!(input && input.projectIdea);
  }

  private emitProgress(workflowId: string, agentId: string, message: string) {
    mcpLogger.info('ArchitectureAgent', message);
    io.emit('ai_thinking', { workflowId, agentId, thought: message });
  }

  public async execute(input: ArchitectureAgentInput): Promise<ArchitectureAgentResult> {
    const startTime = Date.now();
    this.updateState('running', 10, 'Initializing Architecture Agent...');
    this.emitProgress(input.workflowId, input.agentId, 'Designing system architecture...');

    const featuresSummary = input.researchData.keyFeatures?.slice(0, 3).join(', ') || 'core features';

    // ── STAGE 1: Slim AI prompt ───────────────────────────────────────────
    const systemPrompt = `You are a software architect. Return ONLY a valid JSON object, no markdown.`;
    const userPrompt = `Project: "${input.projectIdea}"
Features: ${featuresSummary}

Return JSON with these exact keys:
{
  "techStack": "comma-separated list of technologies",
  "systemArchitectureMermaid": "mermaid graph TD code",
  "erDiagramMermaid": "mermaid erDiagram code",
  "deploymentSummary": "brief deployment description"
}`;

    let aiData: Partial<ArchitectureAgentResult> = {};
    try {
      const response = await generateResponse([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ], { temperature: 0.3, timeoutMs: 15000 });

      const text = response.text || '{}';
      const start = text.indexOf('{');
      const end = text.lastIndexOf('}');
      if (start !== -1 && end !== -1) {
        aiData = JSON.parse(text.substring(start, end + 1));
      }
    } catch (e) {
      mcpLogger.warn('ArchitectureAgent', 'AI parse failed, using enrichment layer');
    }

    // ── STAGE 2: Application enrichment ───────────────────────────────────
    const result = enrichArchitecture(input.projectIdea, input.researchData, aiData);

    this.resultData = result;
    this.updateState('completed', 100, 'Architecture completed');
    mcpLogger.info('ArchitectureAgent', `Completed in ${Date.now() - startTime}ms`);
    return result;
  }
}
