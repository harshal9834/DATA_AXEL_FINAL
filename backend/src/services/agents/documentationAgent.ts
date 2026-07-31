import { generateResponse } from '../../config/AIProvider';
import { mcpLogger } from '../../utils/logger';
import { io } from '../../server';
import { BaseAgent } from './baseAgent';
import { ResearchAgentResult } from './researchAgent';
import { InnovationAgentResult } from './innovationAgent';
import { ArchitectureAgentResult } from './architectureAgent';

export interface DocumentationAgentInput {
  workflowId: string;
  agentId: string;
  projectIdea: string;
  researchData: ResearchAgentResult;
  innovationData: InnovationAgentResult;
  architectureData: ArchitectureAgentResult;
}

export interface DocumentationAgentResult {
  readmeSummary: string;
  installationSteps: string;
  userGuideSummary: string;
  developerGuide: string;
  apiUsageExamples: string;
  demoScript: string;
  elevatorPitch: string;
  judgeQA: string;
  srsSummary: string;
  pitchSummary: string;
  markdown?: string;
}

// ─── Enrichment layer ────────────────────────────────────────────────────────
function enrichDocumentation(idea: string, arch: ArchitectureAgentResult, raw: Partial<DocumentationAgentResult>): DocumentationAgentResult {
  return {
    readmeSummary: raw.readmeSummary || `# ${idea}

## Overview
An AI-powered platform that revolutionizes ${idea.toLowerCase()} through intelligent automation and real-time insights. Built with modern technologies including ${arch.techStack?.split(',').slice(0, 3).join(', ')}.

## Key Features
- 🤖 AI-powered automation and recommendations
- 📊 Real-time analytics and monitoring dashboard
- 🔒 Enterprise-grade security with JWT authentication
- 📱 Responsive design for web and mobile platforms
- 🚀 Scalable microservices architecture

## Tech Stack
${arch.techStack}

## Getting Started
See Installation section below.

## License
MIT — Free for commercial and personal use.`,

    installationSteps: raw.installationSteps || `## Installation Guide

### Prerequisites
- Node.js 18+ and npm/yarn
- PostgreSQL 14+
- Redis 7+
- Docker (optional, recommended)

### Quick Start with Docker
\`\`\`bash
# Clone repository
git clone https://github.com/your-org/${idea.toLowerCase().replace(/\s+/g, '-')}.git
cd ${idea.toLowerCase().replace(/\s+/g, '-')}

# Copy environment config
cp .env.example .env
# Fill in your API keys in .env

# Start all services
docker-compose up -d

# Run database migrations
npm run db:migrate

# Start development server
npm run dev
\`\`\`

### Manual Setup
\`\`\`bash
# Install dependencies
npm install

# Set up database
npm run db:create
npm run db:migrate
npm run db:seed

# Start backend
cd backend && npm run dev

# Start frontend (new terminal)
cd frontend && npm run dev
\`\`\`

The app will be available at http://localhost:3000`,

    userGuideSummary: raw.userGuideSummary || `## User Guide

### Getting Started
1. Create your account at the registration page
2. Verify your email address
3. Complete your profile setup

### Core Workflow
1. **Dashboard**: View your projects and activity at a glance
2. **Create Project**: Click "New Project" and describe your idea
3. **AI Analysis**: Our AI agents automatically analyze and generate insights
4. **View Results**: Navigate through Research, Innovation, Architecture, and Documentation tabs
5. **Export**: Download your report as PDF, Markdown, or JSON

### Tips for Best Results
- Be specific in your project description (50+ words recommended)
- Use the AI chat assistant for follow-up questions
- Save reports to your knowledge base for future reference`,

    developerGuide: raw.developerGuide || `## Developer Guide

### Architecture Overview
This project follows a clean microservices architecture:
- **Frontend**: React/Next.js SPA with TanStack Router
- **Backend**: Node.js/Express REST API
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis for session and query caching
- **AI**: OpenRouter API integration with fallback chain

### Development Setup
\`\`\`bash
# Run all tests
npm run test

# Run linter
npm run lint

# Build for production
npm run build

# Deploy to Vercel/AWS
npm run deploy
\`\`\`

### Project Structure
\`\`\`
/
├── frontend/          # React/Next.js client
│   ├── src/routes/   # File-based routing
│   ├── src/components/
│   └── src/lib/
├── backend/           # Node.js API server
│   ├── src/routes/   # Express routes
│   ├── src/services/ # Business logic + AI agents
│   └── prisma/       # Database schema
└── docker-compose.yml
\`\`\`

### Adding New Features
1. Create route handler in \`backend/src/routes/\`
2. Add service logic in \`backend/src/services/\`
3. Update Prisma schema and run migration
4. Add frontend component in \`frontend/src/components/\`
5. Register route in \`frontend/src/routes/\``,

    apiUsageExamples: raw.apiUsageExamples || `## API Usage Examples

### Authentication
\`\`\`bash
# Login
curl -X POST http://localhost:3001/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"user@example.com","password":"securepass"}'

# Response
{"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."}
\`\`\`

### Create Workflow
\`\`\`bash
curl -X POST http://localhost:3001/api/workflows \\
  -H "Authorization: Bearer {token}" \\
  -H "Content-Type: application/json" \\
  -d '{"idea": "${idea}"}'

# Response
{"success": true, "workflowId": "uuid-here"}
\`\`\`

### Check Status
\`\`\`bash
curl http://localhost:3001/api/workflows/{workflowId}/status \\
  -H "Authorization: Bearer {token}"
\`\`\`

### Get Results
\`\`\`bash
curl http://localhost:3001/api/workflows/{workflowId}/result \\
  -H "Authorization: Bearer {token}"
\`\`\``,

    demoScript: raw.demoScript || `## Demo Script (5 minutes)

**[0:00-0:30] Introduction**
"Welcome to ${idea} — an AI-powered platform that transforms ideas into implementation-ready projects in under 60 seconds."

**[0:30-1:30] Live Demo**
- Type project idea: "${idea}"
- Click "Run All Agents"
- Watch the AI execution engine process in real-time

**[1:30-3:00] Show Results**
- Research tab: Literature review, GitHub repos, technology trends
- Innovation tab: SWOT analysis, Business Model Canvas, Innovation Score
- Architecture tab: System diagram, database schema, API endpoints
- Documentation tab: README, developer guide, pitch materials

**[3:00-4:30] Key Differentiators**
- 60-second complete project analysis
- Persistent workflow — resume from anywhere
- Professional PDF export for stakeholders

**[4:30-5:00] Call to Action**
"Sign up free at [URL] — your next great project starts here."`,

    elevatorPitch: raw.elevatorPitch || `${idea} solves a critical problem in its domain by providing an AI-powered platform that automates research, generates architectural blueprints, and produces comprehensive documentation — all in under 60 seconds. Unlike competitors that require weeks of manual work, our platform delivers production-ready insights instantly, saving teams 40+ hours per project. Built for developers, product managers, and innovators who need to move fast.`,

    judgeQA: raw.judgeQA || `## Judge Q&A Preparation

**Q: How is this different from ChatGPT?**
A: Unlike ChatGPT (a general chatbot), we are a specialized end-to-end pipeline with structured outputs, persistent workflows, professional export formats, and domain-specific enrichment. We don't just generate text — we produce actionable project blueprints.

**Q: What's the accuracy of your AI outputs?**
A: Our 2-stage pipeline (AI summary + app enrichment) ensures outputs are always complete and professional, even when the AI model returns partial responses. Domain-specific templates fill gaps automatically.

**Q: How do you handle scalability?**
A: The backend uses async job processing, PostgreSQL for persistence, Redis for caching, and Docker/Kubernetes for horizontal scaling. Each AI agent call has a 15-second timeout with retry logic.

**Q: What's your monetization strategy?**
A: Freemium model — 3 free workflows/month, $29/month Pro (unlimited), $199/month Enterprise (team + API access).

**Q: What's next?**
A: Multi-user collaboration, GitHub integration for direct code generation, and a marketplace for custom AI agent workflows.`,

    srsSummary: raw.srsSummary || `Software Requirements Specification — ${idea}. System must process project ideas in under 60 seconds, support concurrent users, persist workflow state across sessions, export reports in PDF/Markdown/JSON formats, and maintain 99.9% uptime SLA.`,

    pitchSummary: raw.pitchSummary || `${idea} — Turn any project idea into a complete, production-ready blueprint in 60 seconds. AI-powered research, architecture, and documentation at the click of a button.`,
  };
}

export class DocumentationAgent extends BaseAgent {
  constructor() { super(); }

  public validate(input: any): boolean {
    return !!(input && input.projectIdea);
  }

  private emitProgress(workflowId: string, agentId: string, message: string) {
    mcpLogger.info('DocumentationAgent', message);
    io.emit('ai_thinking', { workflowId, agentId, thought: message });
  }

  public async execute(input: DocumentationAgentInput): Promise<DocumentationAgentResult> {
    const startTime = Date.now();
    this.updateState('running', 10, 'Initializing Documentation Agent...');
    this.emitProgress(input.workflowId, input.agentId, 'Generating documentation...');

    const contextSummary = `Project: ${input.projectIdea}. Summary: ${input.researchData?.executiveSummary?.substring(0, 200) || ''}`.substring(0, 400);

    // ── STAGE 1: Slim AI prompt ───────────────────────────────────────────
    const systemPrompt = `You are a technical writer. Return ONLY a valid JSON object, no markdown.`;
    const userPrompt = `Context: ${contextSummary}

Return JSON with these exact keys:
{
  "readmeSummary": "one paragraph README intro",
  "installationSteps": "3 installation steps as a string",
  "userGuideSummary": "one paragraph user guide",
  "elevatorPitch": "two sentence pitch",
  "srsSummary": "one sentence SRS summary"
}`;

    let aiData: Partial<DocumentationAgentResult> = {};
    try {
      const response = await generateResponse([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ], { temperature: 0.4, timeoutMs: 15000 });

      const text = response.text || '{}';
      const start = text.indexOf('{');
      const end = text.lastIndexOf('}');
      if (start !== -1 && end !== -1) {
        aiData = JSON.parse(text.substring(start, end + 1));
      }
    } catch (e) {
      mcpLogger.warn('DocumentationAgent', 'AI parse failed, using enrichment layer');
    }

    // ── STAGE 2: Application enrichment ───────────────────────────────────
    const result = enrichDocumentation(input.projectIdea, input.architectureData, aiData);

    this.resultData = result;
    this.updateState('completed', 100, 'Documentation completed');
    mcpLogger.info('DocumentationAgent', `Completed in ${Date.now() - startTime}ms`);
    return result;
  }
}
