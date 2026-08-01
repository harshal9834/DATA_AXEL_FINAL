import { generateResponse } from '../../config/AIProvider';
import { mcpLogger } from '../../utils/logger';
import { BaseAgent } from './baseAgent';

export class KnowledgeAgent extends BaseAgent {
  public validate(input: any): boolean {
    return !!input.workflowId;
  }

  public async execute(input: any): Promise<any> {
    return {}; // Unused for knowledge agent as it has specific methods
  }

  public async generateGraphData(workflowId: string, projectData: any) {
    const systemPrompt = `You are the core intelligence of the Knowledge Engine. Analyze the project data and generate a complex, highly interconnected Knowledge Graph.
Nodes must include categories like: Root, Research, GitHub, Technologies, Datasets, APIs, Papers, Core Concept, Database, Infrastructure.
Relationships should be semantic (e.g., "Used in", "Depends On", "Similar To", "Recommended With", "Supports", "Based On").
Confidence score must be 0-100.
Return ONLY valid JSON in this format:
{
  "nodes": [
    { "id": "string", "name": "string", "category": "string", "confidence": 95, "color": "#2563eb", "description": "short" }
  ],
  "links": [
    { "source": "node_id", "target": "node_id", "label": "string" }
  ]
}`;

    const userPrompt = `Project Data: ${JSON.stringify(projectData, null, 2)}`;

    try {
      const response = await generateResponse([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ], { temperature: 0.2, jsonMode: true });
      return JSON.parse(response.text || '{"nodes":[],"links":[]}');
    } catch (e) {
      mcpLogger.error('KnowledgeAgent', 'Graph Generation Failed', e);
      throw e;
    }
  }

  public async generateNodeInsight(nodeName: string, workflowId: string, projectData: any) {
    const systemPrompt = `You are an AI providing instant, deep insights for a specific node in a knowledge graph.
Analyze the node in the context of the project.
Provide a summary of what it means for the project, and a specific actionable recommendation.
Return ONLY valid JSON in this format:
{
  "summary": ["bullet 1", "bullet 2"],
  "recommendation": "string",
  "confidence": 95,
  "metrics": [
    { "label": "string", "value": "string" }
  ]
}`;
    const userPrompt = `Project: ${projectData?.title}\nFocus Node: ${nodeName}\nContext: ${JSON.stringify(projectData)}`;
    
    try {
      const response = await generateResponse([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ], { temperature: 0.3, jsonMode: true });
      return JSON.parse(response.text || '{}');
    } catch (e) {
      throw e;
    }
  }

  public async predictImpact(changeDesc: string, projectData: any) {
    const systemPrompt = `You are an AI Architect. Predict the impact of a proposed change.
Return ONLY valid JSON in this format:
{
  "impacts": [
    { "area": "Performance", "direction": "up|down|neutral", "reason": "string" }
  ],
  "requiredActions": ["action 1", "action 2"],
  "riskLevel": "Low|Medium|High"
}`;
    const userPrompt = `Project: ${projectData?.title}\nChange: ${changeDesc}`;
    
    try {
      const response = await generateResponse([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ], { temperature: 0.3, jsonMode: true });
      return JSON.parse(response.text || '{}');
    } catch (e) {
      throw e;
    }
  }

  public async searchKnowledge(query: string, projectData: any) {
    const systemPrompt = `You are a helpful AI answering questions based on the project's knowledge base. Provide a direct, concise, insightful answer. Format as markdown.`;
    const userPrompt = `Project Context: ${JSON.stringify(projectData)}\n\nUser Question: ${query}`;
    
    try {
      const response = await generateResponse([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ], { temperature: 0.4 });
      return { answer: response.text };
    } catch (e) {
      throw e;
    }
  }

  public async getDashboardStats(projectData: any) {
    const systemPrompt = `You are a Project IQ analyzer. Evaluate the project completeness and readiness.
Calculate scores (0-100) and identify missing areas.
Return ONLY valid JSON in this format:
{
  "coverage": 92,
  "researchQuality": 88,
  "innovation": 95,
  "technicalReadiness": 70,
  "architectureReadiness": 65,
  "documentationProgress": 40,
  "overallIQ": 85,
  "missingAreas": ["Competitor Analysis", "Patent Search"],
  "nextSteps": ["Generate SRS", "Search More Papers"]
}`;
    const userPrompt = `Project Data: ${JSON.stringify(projectData)}`;
    
    try {
      const response = await generateResponse([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ], { temperature: 0.2, jsonMode: true });
      return JSON.parse(response.text || '{}');
    } catch (e) {
      throw e;
    }
  }
}
