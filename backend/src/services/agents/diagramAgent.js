"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiagramAgent = void 0;
const AIProvider_1 = require("../../config/AIProvider");
const logger_1 = require("../../utils/logger");
const baseAgent_1 = require("./baseAgent");
function extractJson(text) {
    const m = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (m && m[1])
        return m[1];
    const f = text.indexOf("{"), l = text.lastIndexOf("}");
    if (f !== -1 && l !== -1)
        return text.substring(f, l + 1);
    return text;
}
class DiagramAgent extends baseAgent_1.BaseAgent {
    validate(input) { return !!(input && input.projectIdea); }
    async execute(input) {
        logger_1.mcpLogger.info("DiagramAgent", "Generating system diagrams...");
        this.updateState("running", 10, "Generating diagrams...");
        const systemPrompt = `You are a Senior Software Architect specializing in system diagrams.
Generate valid Mermaid diagram syntax for each diagram type.
Return ONLY a single valid JSON object (no markdown wrapper around the JSON itself):
{
  "highLevelArchitecture": "graph TB\\n  Client[Browser] --> LB[Load Balancer]\\n  LB --> API[API Server]\\n  API --> DB[(Database)]\\n  API --> Cache[(Redis)]",
  "componentDiagram": "graph LR\\n  subgraph Frontend\\n    UI[React App]\\n  end\\n  subgraph Backend\\n    API[Express API]\\n    Auth[Auth Service]\\n  end\\n  UI --> API",
  "sequenceDiagram": "sequenceDiagram\\n  participant User\\n  participant API\\n  participant DB\\n  User->>API: POST /login\\n  API->>DB: Find user\\n  DB-->>API: User data\\n  API-->>User: JWT token",
  "deploymentDiagram": "graph TB\\n  subgraph Cloud[AWS Cloud]\\n    subgraph VPC\\n      ALB[Application LB]\\n      ECS[ECS Containers]\\n      RDS[(RDS PostgreSQL)]\\n    end\\n  end\\n  Internet --> ALB --> ECS --> RDS",
  "flowDiagram": "flowchart TD\\n  A[User Request] --> B{Authenticated?}\\n  B -->|Yes| C[Process Request]\\n  B -->|No| D[Return 401]\\n  C --> E[Return Response]",
  "classDiagram": "classDiagram\\n  class User {\\n    +String id\\n    +String email\\n    +login()\\n    +logout()\\n  }",
  "activityDiagram": "flowchart TD\\n  Start([Start]) --> Login[User Logs In]\\n  Login --> Auth{Valid Credentials?}\\n  Auth -->|Yes| Dashboard[Load Dashboard]\\n  Auth -->|No| Error[Show Error]",
  "stateDiagram": "stateDiagram-v2\\n  [*] --> Idle\\n  Idle --> Loading: Submit Request\\n  Loading --> Success: Response OK\\n  Loading --> Error: Response Failed\\n  Success --> Idle\\n  Error --> Idle",
  "authFlowDiagram": "sequenceDiagram\\n  participant Client\\n  participant AuthServer\\n  participant ResourceServer\\n  Client->>AuthServer: POST /auth/login\\n  AuthServer-->>Client: JWT Token\\n  Client->>ResourceServer: GET /api/data + Bearer Token\\n  ResourceServer->>AuthServer: Verify token\\n  AuthServer-->>ResourceServer: Valid\\n  ResourceServer-->>Client: Protected Data"
}`;
        const response = await (0, AIProvider_1.generateResponse)([
            { role: "system", content: systemPrompt },
            { role: "user", content: `Generate professional Mermaid diagrams for: ${input.projectIdea}` }
        ], { temperature: 0.3 });
        const text = response.text || "{}";
        const jsonStr = extractJson(text);
        try {
            this.resultData = JSON.parse(jsonStr);
        }
        catch {
            this.resultData = JSON.parse(jsonStr.replace(/,\s*([}\]])/g, "$1"));
        }
        this.updateState("completed", 100, "Diagrams generated");
        return this.resultData;
    }
}
exports.DiagramAgent = DiagramAgent;
//# sourceMappingURL=diagramAgent.js.map