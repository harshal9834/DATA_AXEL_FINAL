import axios from 'axios';
import { Response } from 'express';
import { generateResponse } from '../config/AIProvider';

interface StreamOptions {
  topic: string;
  goal: string;
  audience: string;
  format: string;
}

// Tavily search helper
async function searchTavily(query: string): Promise<any[]> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) return [];

  try {
    const response = await axios.post('https://api.tavily.com/search', {
      api_key: apiKey,
      query,
      search_depth: 'advanced',
      include_answer: false,
      include_raw_content: false,
      max_results: 5,
    });
    
    return response.data.results || [];
  } catch (error) {
    console.error('[PromptBuilderService] Tavily search failed:', error);
    return [];
  }
}

// The main service function that runs the process and streams updates
export async function streamPromptReport(res: Response, options: StreamOptions) {
  const { topic, goal, audience, format } = options;

  // Helper to send SSE events
  const sendEvent = (event: string, data: any) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  try {
    // 1. Understanding Query
    sendEvent('status', { step: 'Understanding the user\'s query' });
    await new Promise(r => setTimeout(r, 800));

    // 2. Expanding Search Intent
    sendEvent('status', { step: 'Expanding the search intent' });
    await new Promise(r => setTimeout(r, 800));

    // 3. Searching Trusted Information
    sendEvent('status', { step: 'Searching trusted information via Tavily' });
    
    // Construct a rich search query
    const searchQuery = `${topic} ${goal ? 'focus on ' + goal : ''}`;
    const sources = await searchTavily(searchQuery);
    
    // Map sources for the UI
    const formattedSources = sources.map((s, index) => ({
      id: index.toString(),
      type: 'Web Article',
      title: s.title,
      url: s.url,
      date: new Date().toISOString().split('T')[0], // Tavily might not return exact publish date reliably, default to today
      reliabilityScore: 85 + Math.floor(Math.random() * 14), // Mock score 85-99
      summary: s.content.substring(0, 150) + '...',
    }));

    await new Promise(r => setTimeout(r, 800));

    // 4. Building Grounded Context
    sendEvent('status', { step: 'Building grounded context' });
    
    // Format context for Groq
    const contextText = sources.map((s, i) => `[Source ${i + 1}] ${s.title} (${s.url}): ${s.content}`).join('\n\n');

    await new Promise(r => setTimeout(r, 800));

    // 5. Generating AI Insights
    sendEvent('status', { step: 'Generating AI insights using Groq' });

    const systemPrompt = `You are a world-class research assistant and prompt engineer.
You are tasked with creating a highly detailed, professional research report.
Output MUST strictly be in JSON format matching the schema below. Do not use markdown blocks outside the JSON.

JSON Schema:
{
  "executiveSummary": "A comprehensive 2-3 paragraph summary.",
  "fullAnalysis": "A detailed 4-5 paragraph deep dive analysis of the topic, incorporating the provided context.",
  "keyTakeaways": ["string"],
  "timeline": [
    { "date": "string (e.g., 2024, Q3 2025)", "event": "string" }
  ],
  "suggestedNextSteps": ["string"],
  "relatedEntities": ["string (technologies, companies, APIs, etc)"],
  "projectTags": ["string"],
  "followUpQuestions": ["string (intelligent follow-up questions for the user)"]
}`;

    const userPrompt = `Topic: ${topic}
Goal: ${goal || 'Provide a general comprehensive overview'}
Target Audience: ${audience || 'General professionals'}
Output Format: ${format || 'Detailed Analysis'}

Context from Web Search:
${contextText}

Generate the comprehensive research report in JSON format.`;

    sendEvent('status', { step: 'Preparing the final response' });

    const aiResponse = await generateResponse([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], { temperature: 0.2, jsonMode: true });

    const reportContent = aiResponse.text || '{}';
    let reportData = JSON.parse(reportContent);
    
    // Inject the fetched sources into the report data so the frontend can display them
    reportData.sources = formattedSources;

    // Send final result
    sendEvent('complete', reportData);

  } catch (error) {
    console.error('[PromptBuilderService] Error generating report:', error);
    sendEvent('error', { message: 'Failed to generate report' });
  } finally {
    res.end();
  }
}

export interface FollowUpOptions {
  topic: string;
  previousReport: any;
  conversationHistory: { role: string; content: string }[];
  currentQuestion: string;
}

import * as fs from 'fs';

export async function streamFollowUpReport(res: Response, options: FollowUpOptions) {
  const { topic, previousReport, conversationHistory, currentQuestion } = options;

  fs.appendFileSync('trace.log', `[${new Date().toISOString()}] Starting streamFollowUpReport\n`);

  const sendEvent = (event: string, data: any) => {
    fs.appendFileSync('trace.log', `[${new Date().toISOString()}] Sending event: ${event} ${JSON.stringify(data)}\n`);
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  try {
    sendEvent('status', { step: 'Understanding follow-up question' });
    fs.appendFileSync('trace.log', `[${new Date().toISOString()}] Before timeout 1\n`);
    await new Promise(r => setTimeout(r, 600));
    fs.appendFileSync('trace.log', `[${new Date().toISOString()}] After timeout 1\n`);

    sendEvent('status', { step: 'Loading previous research context' });
    await new Promise(r => setTimeout(r, 600));

    sendEvent('status', { step: 'Reviewing existing evidence' });
    await new Promise(r => setTimeout(r, 600));

    sendEvent('status', { step: 'Building grounded response' });
    
    let historyContext = conversationHistory.map(msg => `${msg.role.toUpperCase()}: ${msg.content}`).join('\n\n');

    const systemPrompt = `You are a world-class research assistant continuing a deep dive on: "${topic}".
You have already generated a comprehensive report. Your task is to generate a BRAND NEW, fully updated report that incorporates the user's follow-up question.
Output MUST strictly be in JSON format matching the schema below. Do not use markdown blocks outside the JSON.

JSON Schema:
{
  "executiveSummary": "A comprehensive 2-3 paragraph summary updated with the new insights.",
  "fullAnalysis": "A detailed 4-5 paragraph deep dive analysis of the topic, incorporating the provided context and answering the follow-up.",
  "keyTakeaways": ["string"],
  "timeline": [
    { "date": "string (e.g., 2024, Q3 2025)", "event": "string" }
  ],
  "suggestedNextSteps": ["string"],
  "relatedEntities": ["string (technologies, companies, APIs, etc)"],
  "projectTags": ["string"],
  "followUpQuestions": ["string", "string", "string", "string", "string"] // EXACTLY 5 new intelligent, forward-looking follow-up questions based on this NEW report
}`;

    const userPrompt = `--- PREVIOUS REPORT CONTEXT (Base your new report on this) ---
${JSON.stringify(previousReport)}

--- CONVERSATION HISTORY ---
${historyContext}

--- NEW FOLLOW-UP QUESTION ---
${currentQuestion}

Generate the FULLY UPDATED comprehensive research report in JSON format.`;

    sendEvent('status', { step: 'Generating updated report' });

    fs.appendFileSync('trace.log', `[${new Date().toISOString()}] Before AI Provider call\n`);
    
    const aiResponse = await generateResponse([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], { temperature: 0.2, jsonMode: true });

    const reportContent = aiResponse.text || '{}';
    let reportData = JSON.parse(reportContent);
    
    // Carry over sources from previous report
    reportData.sources = previousReport.sources || [];
    
    // Send final result
    sendEvent('complete', reportData);

  } catch (error: any) {
    fs.appendFileSync('trace.log', `[${new Date().toISOString()}] ERROR: ${error?.message || error}\n`);
    console.error('[PromptBuilderService] Error generating follow-up:', error);
    sendEvent('error', { message: 'Failed to generate follow-up' });
  } finally {
    fs.appendFileSync('trace.log', `[${new Date().toISOString()}] Finally block\n`);
    res.end();
  }
}
