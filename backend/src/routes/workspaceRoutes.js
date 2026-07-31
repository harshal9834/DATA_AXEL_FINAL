"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const server_1 = require("../server");
const logger_1 = require("../utils/logger");
const router = (0, express_1.Router)();
// Get full workspace state - no auth required for internal workspace polling
router.get("/:workflowId", async (req, res) => {
    try {
        const { workflowId } = req.params;
        const workflow = await server_1.prisma.workflow.findUnique({
            where: { id: workflowId },
            include: {
                agents: true,
                blueprint: true,
                memoryNodes: true,
                projectMemoryState: true,
            }
        });
        if (!workflow) {
            res.status(404).json({ error: "Workflow not found" });
            return;
        }
        // Fetch results separately to avoid Prisma include issues
        const [researchResults, innovationResults, architectureResults, backendResults, frontendResults, docsResults, analysisResults] = await Promise.all([
            server_1.prisma.researchResult.findFirst({ where: { workflowId }, orderBy: { createdAt: "desc" } }),
            server_1.prisma.innovationResult.findFirst({ where: { workflowId }, orderBy: { createdAt: "desc" } }),
            server_1.prisma.architectureResult.findFirst({ where: { workflowId }, orderBy: { createdAt: "desc" } }),
            server_1.prisma.backendResult.findFirst({ where: { workflowId }, orderBy: { createdAt: "desc" } }),
            server_1.prisma.frontendResult.findFirst({ where: { workflowId }, orderBy: { createdAt: "desc" } }),
            server_1.prisma.documentationResult.findFirst({ where: { workflowId }, orderBy: { createdAt: "desc" } }),
            server_1.prisma.analysisResult.findMany({ where: { workflowId }, orderBy: { createdAt: "desc" } }),
        ]);
        const parseResult = (result) => {
            if (!result?.content)
                return null;
            if (result.content.startsWith("__TYPE:"))
                return null; // skip extended docs
            try {
                return JSON.parse(result.content);
            }
            catch {
                return result.content;
            }
        };
        // Parse extended documents from analysisResults
        const extendedDocs = {};
        for (const r of analysisResults) {
            const match = r.content.match(/^__TYPE:([^_]+)__(.*)$/s);
            if (match) {
                const [, docType, docContent] = match;
                if (docType && docContent && !extendedDocs[docType]) {
                    try {
                        extendedDocs[docType] = JSON.parse(docContent);
                    }
                    catch {
                        extendedDocs[docType] = docContent;
                    }
                }
            }
        }
        const workspace = {
            workflowId: workflow.id, title: workflow.title, idea: workflow.idea,
            status: workflow.status, overallProgress: workflow.overallProgress,
            currentAgent: workflow.currentAgent, agents: workflow.agents,
            research: parseResult(researchResults),
            innovation: parseResult(innovationResults),
            architecture: parseResult(architectureResults),
            backend: parseResult(backendResults),
            frontend: parseResult(frontendResults),
            documentation: parseResult(docsResults),
            blueprint: workflow.blueprint,
            projectState: workflow.projectMemoryState?.[0],
            ...extendedDocs,
        };
        res.json({ success: true, workspace });
    }
    catch (error) {
        logger_1.mcpLogger.error("WorkspaceRoute", "Failed to get workspace", error);
        res.status(500).json({ error: "Failed to get workspace" });
    }
});
exports.default = router;
//# sourceMappingURL=workspaceRoutes.js.map