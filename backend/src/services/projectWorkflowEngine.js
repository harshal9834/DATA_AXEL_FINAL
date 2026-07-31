"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startProjectWorkflow = startProjectWorkflow;
const server_1 = require("../server");
const researchAgent_1 = require("./agents/researchAgent");
const innovationAgent_1 = require("./agents/innovationAgent");
const architectureAgent_1 = require("./agents/architectureAgent");
const backendAgent_1 = require("./agents/backendAgent");
const frontendAgent_1 = require("./agents/frontendAgent");
const documentationAgent_1 = require("./agents/documentationAgent");
const analysisAgent_1 = require("./agents/analysisAgent");
const projectPlanningAgent_1 = require("./agents/projectPlanningAgent");
const databaseAgent_1 = require("./agents/databaseAgent");
const apiDesignAgent_1 = require("./agents/apiDesignAgent");
const diagramAgent_1 = require("./agents/diagramAgent");
const testingAgent_1 = require("./agents/testingAgent");
const devopsAgent_1 = require("./agents/devopsAgent");
const logger_1 = require("../utils/logger");
const delay = (ms) => new Promise(res => setTimeout(res, ms));
function emitWorkspaceDocument(workflowId, tabName, content) {
    server_1.io.emit("workspace_document_ready", { workflowId, tabName, content });
}
function emitWorkspaceDiagram(workflowId, diagramType, mermaidCode) {
    server_1.io.emit("workspace_diagram_ready", { workflowId, diagramType, mermaidCode });
}
function emitProgress(workflowId, percent, phase) {
    server_1.io.emit("workspace_progress", { workflowId, percent, currentPhase: phase });
}
function emitAgentStatus(workflowId, agentName, status, progress) {
    server_1.io.emit("agent_progress", { workflowId, name: agentName, status, progress });
}
async function findAgent(workflowId, name) {
    return server_1.prisma.workflowAgent.findFirst({ where: { workflowId, name } });
}
async function markAgentRunning(agentId) {
    await server_1.prisma.workflowAgent.update({
        where: { id: agentId },
        data: { status: "RUNNING", startedAt: new Date(), progress: 0 }
    });
}
async function markAgentDone(agentId, executionTime) {
    await server_1.prisma.workflowAgent.update({
        where: { id: agentId },
        data: { status: "COMPLETED", progress: 100, completedAt: new Date(), executionTime, currentTask: "Completed" }
    });
}
async function markAgentFailed(agentId, error) {
    await server_1.prisma.workflowAgent.update({
        where: { id: agentId },
        data: { status: "FAILED", error }
    });
}
async function startProjectWorkflow(workflowId) {
    logger_1.mcpLogger.info("ProjectWorkflowEngine", `Starting full project workflow: ${workflowId}`);
    await server_1.prisma.workflow.update({
        where: { id: workflowId },
        data: { status: "RUNNING", overallProgress: 0 }
    });
    server_1.io.emit("workflow_started", { id: workflowId, status: "RUNNING" });
    const workflow = await server_1.prisma.workflow.findUnique({
        where: { id: workflowId },
        include: { agents: true, user: true }
    });
    if (!workflow)
        throw new Error("Workflow not found");
    const idea = workflow.idea || "A software project";
    let researchData = null;
    let innovationData = null;
    let architectureData = null;
    let planningData = null;
    let databaseData = null;
    // === PHASE 1: Research ===
    emitProgress(workflowId, 5, "Research & Discovery");
    const researchAgent = await findAgent(workflowId, "Research & Discovery");
    if (researchAgent) {
        try {
            await markAgentRunning(researchAgent.id);
            const t = Date.now();
            const agent = new researchAgent_1.ResearchAgent();
            researchData = await agent.execute({
                workflowId, agentId: researchAgent.id,
                projectTitle: idea.substring(0, 80),
                problemStatement: idea,
                description: idea,
                technologyPreference: ""
            });
            await server_1.prisma.researchResult.create({ data: { workflowId, userId: workflow.userId, content: JSON.stringify(researchData) } });
            await markAgentDone(researchAgent.id, `${Math.round((Date.now() - t) / 1000)}s`);
            emitWorkspaceDocument(workflowId, "research", researchData);
            emitProgress(workflowId, 10, "Research Complete");
        }
        catch (e) {
            await markAgentFailed(researchAgent.id, e.message);
            logger_1.mcpLogger.error("ProjectWorkflowEngine", "Research failed", e);
        }
    }
    // === PHASE 2: Planning + Innovation (parallel) ===
    emitProgress(workflowId, 12, "Project Planning & Innovation");
    const planningAgent = await findAgent(workflowId, "Project Planning");
    const innovationAgent2 = await findAgent(workflowId, "Innovation & Strategy");
    const [planningResult, innovationResult] = await Promise.allSettled([
        (async () => {
            if (!planningAgent)
                return null;
            await markAgentRunning(planningAgent.id);
            const t = Date.now();
            const a = new projectPlanningAgent_1.ProjectPlanningAgent();
            const data = await a.execute({ workflowId, agentId: planningAgent.id, projectIdea: idea, researchData });
            await server_1.prisma.analysisResult.create({ data: { workflowId, userId: workflow.userId, content: `__TYPE:planning__${JSON.stringify(data)}` } });
            await markAgentDone(planningAgent.id, `${Math.round((Date.now() - t) / 1000)}s`);
            emitWorkspaceDocument(workflowId, "planning", data);
            return data;
        })(),
        (async () => {
            if (!innovationAgent2)
                return null;
            await markAgentRunning(innovationAgent2.id);
            const t = Date.now();
            const researchResult = await server_1.prisma.researchResult.findFirst({ where: { workflowId }, orderBy: { createdAt: "desc" } });
            if (!researchResult)
                return null;
            const rData = JSON.parse(researchResult.content);
            const a = new innovationAgent_1.InnovationAgent();
            const data = await a.execute({ workflowId, agentId: innovationAgent2.id, researchData: rData });
            await server_1.prisma.innovationResult.create({ data: { workflowId, userId: workflow.userId, content: JSON.stringify(data) } });
            await markAgentDone(innovationAgent2.id, `${Math.round((Date.now() - t) / 1000)}s`);
            emitWorkspaceDocument(workflowId, "innovation", data);
            return data;
        })(),
    ]);
    if (planningResult.status === "fulfilled")
        planningData = planningResult.value;
    if (innovationResult.status === "fulfilled")
        innovationData = innovationResult.value;
    emitProgress(workflowId, 25, "Architecture & Design");
    // === PHASE 3: Architecture ===
    const archAgentRec = await findAgent(workflowId, "Architecture & Development");
    if (archAgentRec) {
        try {
            await markAgentRunning(archAgentRec.id);
            const t = Date.now();
            const a = new architectureAgent_1.ArchitectureAgent();
            architectureData = await a.execute({
                workflowId, agentId: archAgentRec.id,
                projectIdea: idea,
                researchData: researchData || {},
                innovationData: innovationData || {}
            });
            await server_1.prisma.architectureResult.create({ data: { workflowId, userId: workflow.userId, content: JSON.stringify(architectureData) } });
            await markAgentDone(archAgentRec.id, `${Math.round((Date.now() - t) / 1000)}s`);
            emitWorkspaceDocument(workflowId, "architecture", architectureData);
            // Create blueprint
            await server_1.prisma.projectBlueprint.create({
                data: {
                    workflowId, userId: workflow.userId,
                    researchSummary: architectureData.executiveArchitectureSummary || "Architecture generated",
                    innovationSummary: innovationData?.executiveInnovationSummary || "Innovation mapped",
                    architecture: architectureData.backendArchitecture || "Designed",
                    databaseSchema: JSON.stringify(architectureData.databaseSchema || {}),
                    folderStructure: architectureData.folderStructure || "Planned",
                    apiDesign: JSON.stringify(architectureData.apiBlueprint || {}),
                }
            });
        }
        catch (e) {
            if (archAgentRec)
                await markAgentFailed(archAgentRec.id, e.message);
            logger_1.mcpLogger.error("ProjectWorkflowEngine", "Architecture failed", e);
        }
    }
    emitProgress(workflowId, 40, "Database, API Design, Diagrams");
    // === PHASE 4: Database + API Design + Diagrams (parallel) ===
    const dbAgentRec = await findAgent(workflowId, "Database Design");
    const apiAgentRec = await findAgent(workflowId, "API Design");
    const diagramAgentRec = await findAgent(workflowId, "Diagram Generation");
    await Promise.allSettled([
        (async () => {
            if (!dbAgentRec)
                return;
            await markAgentRunning(dbAgentRec.id);
            const t = Date.now();
            const a = new databaseAgent_1.DatabaseAgent();
            databaseData = await a.execute({ workflowId, agentId: dbAgentRec.id, projectIdea: idea, architectureData, planningData });
            await server_1.prisma.analysisResult.create({ data: { workflowId, userId: workflow.userId, content: `__TYPE:database__${JSON.stringify(databaseData)}` } });
            await markAgentDone(dbAgentRec.id, `${Math.round((Date.now() - t) / 1000)}s`);
            emitWorkspaceDocument(workflowId, "database", databaseData);
            if (databaseData.erdMermaid)
                emitWorkspaceDiagram(workflowId, "erd", databaseData.erdMermaid);
        })(),
        (async () => {
            if (!apiAgentRec)
                return;
            await markAgentRunning(apiAgentRec.id);
            const t = Date.now();
            const a = new apiDesignAgent_1.ApiDesignAgent();
            const data = await a.execute({ workflowId, agentId: apiAgentRec.id, projectIdea: idea, architectureData, planningData });
            await server_1.prisma.analysisResult.create({ data: { workflowId, userId: workflow.userId, content: `__TYPE:apidesign__${JSON.stringify(data)}` } });
            await markAgentDone(apiAgentRec.id, `${Math.round((Date.now() - t) / 1000)}s`);
            emitWorkspaceDocument(workflowId, "apidesign", data);
        })(),
        (async () => {
            if (!diagramAgentRec)
                return;
            await markAgentRunning(diagramAgentRec.id);
            const t = Date.now();
            const a = new diagramAgent_1.DiagramAgent();
            const data = await a.execute({ workflowId, agentId: diagramAgentRec.id, projectIdea: idea, architectureData });
            await server_1.prisma.analysisResult.create({ data: { workflowId, userId: workflow.userId, content: `__TYPE:diagrams__${JSON.stringify(data)}` } });
            await markAgentDone(diagramAgentRec.id, `${Math.round((Date.now() - t) / 1000)}s`);
            emitWorkspaceDocument(workflowId, "diagrams", data);
            // Emit individual diagrams
            Object.entries(data).forEach(([key, val]) => {
                if (typeof val === "string" && val.length > 10) {
                    emitWorkspaceDiagram(workflowId, key, val);
                }
            });
        })(),
    ]);
    emitProgress(workflowId, 60, "Backend & Frontend Generation");
    // === PHASE 5: Backend + Frontend (parallel) ===
    const backendAgentRec = await findAgent(workflowId, "Backend Generation");
    const frontendAgentRec = await findAgent(workflowId, "Frontend Generation");
    await Promise.allSettled([
        (async () => {
            if (!backendAgentRec)
                return;
            await markAgentRunning(backendAgentRec.id);
            const t = Date.now();
            const a = new backendAgent_1.BackendAgent();
            const data = await a.execute({
                workflowId, agentId: backendAgentRec.id, projectIdea: idea,
                researchData: researchData || {}, innovationData: innovationData || {}, architectureData: architectureData || {}
            });
            await server_1.prisma.backendResult.create({ data: { workflowId, userId: workflow.userId, content: JSON.stringify(data) } });
            await markAgentDone(backendAgentRec.id, `${Math.round((Date.now() - t) / 1000)}s`);
            emitWorkspaceDocument(workflowId, "backend", data);
            server_1.io.emit("backend_generated", { workflowId, backendData: data });
        })(),
        (async () => {
            if (!frontendAgentRec)
                return;
            await markAgentRunning(frontendAgentRec.id);
            const t = Date.now();
            const a = new frontendAgent_1.FrontendAgent();
            const data = await a.execute({ workflowId, agentId: frontendAgentRec.id, projectIdea: idea, backendData: {} });
            await server_1.prisma.frontendResult.create({ data: { workflowId, userId: workflow.userId, content: JSON.stringify(data) } });
            await markAgentDone(frontendAgentRec.id, `${Math.round((Date.now() - t) / 1000)}s`);
            emitWorkspaceDocument(workflowId, "frontend", data);
        })(),
    ]);
    emitProgress(workflowId, 80, "Testing & DevOps");
    // === PHASE 6: Testing + DevOps (parallel) ===
    const testingAgentRec = await findAgent(workflowId, "Testing Strategy");
    const devopsAgentRec = await findAgent(workflowId, "DevOps & Deployment");
    await Promise.allSettled([
        (async () => {
            if (!testingAgentRec)
                return;
            await markAgentRunning(testingAgentRec.id);
            const t = Date.now();
            const a = new testingAgent_1.TestingAgent();
            const data = await a.execute({ workflowId, agentId: testingAgentRec.id, projectIdea: idea });
            await server_1.prisma.analysisResult.create({ data: { workflowId, userId: workflow.userId, content: `__TYPE:testing__${JSON.stringify(data)}` } });
            await markAgentDone(testingAgentRec.id, `${Math.round((Date.now() - t) / 1000)}s`);
            emitWorkspaceDocument(workflowId, "testing", data);
        })(),
        (async () => {
            if (!devopsAgentRec)
                return;
            await markAgentRunning(devopsAgentRec.id);
            const t = Date.now();
            const a = new devopsAgent_1.DevOpsAgent();
            const data = await a.execute({ workflowId, agentId: devopsAgentRec.id, projectIdea: idea, architectureData });
            await server_1.prisma.analysisResult.create({ data: { workflowId, userId: workflow.userId, content: `__TYPE:devops__${JSON.stringify(data)}` } });
            await markAgentDone(devopsAgentRec.id, `${Math.round((Date.now() - t) / 1000)}s`);
            emitWorkspaceDocument(workflowId, "devops", data);
        })(),
    ]);
    emitProgress(workflowId, 90, "Documentation & Analysis");
    // === PHASE 7: Documentation + Analysis (parallel) ===
    const docsAgentRec = await findAgent(workflowId, "Documentation & Presentation");
    const analysisAgentRec = await findAgent(workflowId, "Project Analysis");
    await Promise.allSettled([
        (async () => {
            if (!docsAgentRec)
                return;
            await markAgentRunning(docsAgentRec.id);
            const t = Date.now();
            const a = new documentationAgent_1.DocumentationAgent();
            const data = await a.execute({ workflowId, agentId: docsAgentRec.id, projectIdea: idea, backendData: {}, frontendData: {} });
            await server_1.prisma.documentationResult.create({ data: { workflowId, userId: workflow.userId, content: JSON.stringify(data) } });
            await markAgentDone(docsAgentRec.id, `${Math.round((Date.now() - t) / 1000)}s`);
            emitWorkspaceDocument(workflowId, "documentation", data);
        })(),
        (async () => {
            if (!analysisAgentRec)
                return;
            await markAgentRunning(analysisAgentRec.id);
            const t = Date.now();
            const a = new analysisAgent_1.AnalysisAgent();
            const data = await a.execute({ workflowId, agentId: analysisAgentRec.id, projectIdea: idea, backendData: {}, frontendData: {}, documentationData: {} });
            await server_1.prisma.analysisResult.create({ data: { workflowId, userId: workflow.userId, content: JSON.stringify(data) } });
            await markAgentDone(analysisAgentRec.id, `${Math.round((Date.now() - t) / 1000)}s`);
            emitWorkspaceDocument(workflowId, "analysis", data);
        })(),
    ]);
    // === COMPLETE ===
    await server_1.prisma.workflow.update({
        where: { id: workflowId },
        data: { status: "COMPLETED", overallProgress: 100, currentAgent: null }
    });
    server_1.io.emit("workflow_completed", { id: workflowId, status: "COMPLETED", overallProgress: 100 });
    emitProgress(workflowId, 100, "All Done!");
    logger_1.mcpLogger.info("ProjectWorkflowEngine", `Completed: ${workflowId}`);
}
//# sourceMappingURL=projectWorkflowEngine.js.map