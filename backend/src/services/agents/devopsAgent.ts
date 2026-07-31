import { generateResponse } from "../../config/AIProvider";
import { mcpLogger } from "../../utils/logger";
import { BaseAgent } from "./baseAgent";

export interface DevOpsAgentInput {
  workflowId: string; agentId: string; projectIdea: string; backendData?: any; architectureData?: any;
}
export interface DevOpsAgentResult {
  dockerfile: string;
  dockerCompose: string;
  githubActionsCI: string;
  githubActionsCD: string;
  nginxConfig: string;
  envTemplate: string;
  deploymentGuide: string;
  infraDiagramMermaid: string;
  monitoringSetup: string;
}

function extractJson(text: string): string {
  const m = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (m && m[1]) return m[1];
  const f = text.indexOf("{"), l = text.lastIndexOf("}");
  if (f !== -1 && l !== -1) return text.substring(f, l + 1);
  return text;
}

export class DevOpsAgent extends BaseAgent {
  public validate(input: any): boolean { return !!(input && input.projectIdea); }
  public async execute(input: DevOpsAgentInput): Promise<DevOpsAgentResult> {
    mcpLogger.info("DevOpsAgent", "Generating DevOps configs...");
    this.updateState("running", 10, "Generating production configs...");

    const systemPrompt = `You are a Senior DevOps Engineer. Generate complete production-ready DevOps configuration files.
Return ONLY a single valid JSON object:
{
  "dockerfile": "FROM node:20-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci --only=production\nCOPY . .\nEXPOSE 3001\nCMD [\"node\", \"dist/server.js\"]",
  "dockerCompose": "version: '3.8'\nservices:\n  app:\n    build: .\n    ports:\n      - '3001:3001'\n    environment:\n      - NODE_ENV=production\n  db:\n    image: postgres:15\n    environment:\n      POSTGRES_DB: myapp",
  "githubActionsCI": "name: CI\non:\n  push:\n    branches: [main, develop]\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v3\n      - run: npm ci\n      - run: npm test",
  "githubActionsCD": "name: CD\non:\n  push:\n    branches: [main]\njobs:\n  deploy:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v3\n      - name: Deploy to production\n        run: echo Deploying...",
  "nginxConfig": "server {\n  listen 80;\n  server_name example.com;\n  location / {\n    proxy_pass http://localhost:3001;\n    proxy_set_header Host $host;\n  }\n}",
  "envTemplate": "# Application\nNODE_ENV=production\nPORT=3001\n\n# Database\nDATABASE_URL=postgresql://user:pass@localhost:5432/dbname\n\n# Auth\nJWT_SECRET=your-secret-here\n\n# AI\nOPENROUTER_API_KEY=your-key-here",
  "deploymentGuide": "1. Clone the repository\n2. Copy .env.example to .env and fill values\n3. Run docker-compose up -d\n4. Run database migrations\n5. Access the application at http://localhost",
  "infraDiagramMermaid": "graph TB\n  LB[Load Balancer] --> App1[App Server 1]\n  LB --> App2[App Server 2]\n  App1 --> DB[(PostgreSQL Primary)]\n  App2 --> DB\n  DB --> DBR[(PostgreSQL Replica)]\n  App1 --> Cache[(Redis)]\n  App2 --> Cache",
  "monitoringSetup": "Use Prometheus + Grafana for metrics, ELK stack for logs, and Sentry for error tracking."
}`;

    const response = await generateResponse([
      { role: "system", content: systemPrompt },
      { role: "user", content: `Generate DevOps configs for: ${input.projectIdea}` }
    ], { temperature: 0.3 });

    const text = response.text || "{}"; const jsonStr = extractJson(text);
    try { this.resultData = JSON.parse(jsonStr); } catch { this.resultData = JSON.parse(jsonStr.replace(/,\s*([}\]])/g, "$1")); }
    this.updateState("completed", 100, "DevOps config complete");
    return this.resultData;
  }
}
