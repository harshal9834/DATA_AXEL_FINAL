import OpenAI from 'openai';
import axios from 'axios';
import { Response } from 'express';

const getGroqClient = () => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not set in environment variables.');
  }
  return new OpenAI({
    apiKey,
    baseURL: 'https://api.groq.com/openai/v1',
  });
};

async function searchTavily(query: string): Promise<any[]> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    console.log('[DeepSearchService] TAVILY_API_KEY is missing, skipping real-world data.');
    return [];
  }
  try {
    console.log(`[DeepSearchService] Fetching Tavily for query: ${query}`);
    const response = await axios.post('https://api.tavily.com/search', {
      api_key: apiKey,
      query,
      search_depth: 'advanced',
      include_answer: false,
      include_raw_content: false,
      max_results: 5,
    }, { timeout: 15000 });
    console.log(`[DeepSearchService] Tavily returned ${response.data.results?.length} results`);
    return response.data.results || [];
  } catch (error: any) {
    console.error('[DeepSearchService] Tavily search failed:', error.message);
    return [];
  }
}

export interface DeepSearchOptions {
  topic: string;
  category: string;
  previousContext?: any;
}

export async function streamDeepSearchCategory(res: Response, options: DeepSearchOptions) {
  const { topic, category } = options;
  const sendEvent = (event: string, data: any) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    if (typeof (res as any).flush === 'function') {
      (res as any).flush();
    }
  };

  try {
    sendEvent('status', { step: `Analyzing requirement for ${category}` });
    await new Promise(r => setTimeout(r, 600));

    let sources: any[] = [];
    if (category !== 'Diagrams') {
      sendEvent('status', { step: `Gathering real-world data for ${category}` });
      const searchQuery = `${topic} ${category.toLowerCase()}`;
      sources = await searchTavily(searchQuery);
      
      if (sources.length > 0) {
        sendEvent('status', { step: `Successfully retrieved ${sources.length} sources` });
      } else {
        sendEvent('status', { step: `No external sources found, relying on AI knowledge` });
      }
      await new Promise(r => setTimeout(r, 600));
    }

    sendEvent('status', { step: 'Structuring insights and generating response' });

    const contextText = sources.length > 0 
      ? sources.map((s, i) => `[Source ${i + 1}] ${s.title} (${s.url}): ${s.content}`).join('\n\n')
      : "No external context provided. Rely on your vast internal knowledge.";

    let categorySchema = '';
    if (category === 'Research Papers') {
      categorySchema = `
      "results": [{
        "title": "string",
        "authors": "string",
        "publication": "string",
        "year": "string",
        "aiSummary": "string",
        "keyContributions": "string",
        "whyRelevant": "string",
        "citation": "string",
        "url": "string (use actual URL from context if possible)"
      }]`;
    } else if (category === 'GitHub') {
      categorySchema = `
      "results": [{
        "repositoryName": "string",
        "description": "string",
        "language": "string",
        "stars": "number (estimate if unknown)",
        "lastUpdated": "string",
        "whyUseful": "string",
        "url": "string"
      }]`;
    } else if (category === 'Datasets') {
      categorySchema = `
      "results": [{
        "datasetName": "string",
        "source": "string",
        "description": "string",
        "suggestedUse": "string",
        "aiRecommendation": "string",
        "url": "string"
      }]`;
    } else if (category === 'Diagrams') {
      categorySchema = `
      "results": [{
        "diagramTitle": "string",
        "mermaidCode": "string (MUST be valid Mermaid.js syntax, NO markdown codeblock ticks inside the string)",
        "aiExplanation": "string",
        "whyImportant": "string"
      }]`;
    } else if (category === 'News') {
      categorySchema = `
      "results": [{
        "headline": "string",
        "publisher": "string",
        "date": "string",
        "aiSummary": "string",
        "whyMatters": "string",
        "url": "string"
      }]`;
    } else if (category === 'Government') {
      categorySchema = `
      "results": [{
        "title": "string",
        "department": "string",
        "summary": "string",
        "whyMatters": "string",
        "url": "string"
      }]`;
    }

    const systemPrompt = `You are a world-class AI Research Analyst specializing in ${category}.
Your goal is to provide deeply insightful, highly relevant information about the topic: "${topic}".
Output MUST strictly be in JSON format. Do not use markdown blocks outside the JSON.

JSON Schema:
{
  "aiReasoning": {
    "summary": "A 2-3 paragraph professional summary analyzing the intersection of the topic and this category.",
    "keyInsights": ["string", "string", "string"],
    "projectRelevance": "string explaining how this specifically applies to the user's project topic",
    "actionableRecommendations": ["string", "string"],
    "reliabilityScore": "number 1-100 representing confidence in this data",
    "suggestedNextStep": "string"
  },
  ${categorySchema}
}`;

    const userPrompt = `Topic: ${topic}
Category: ${category}

Context from Web Search:
${contextText}

Generate the comprehensive research response in JSON format. Generate at least 3-5 results.`;

    const groqClient = getGroqClient();
    
    console.log(`[DeepSearchService] Initiating Groq API call for ${category}...`);
    const completion = await groqClient.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.2,
      response_format: { type: 'json_object' }
    }, { timeout: 45000 });
    console.log(`[DeepSearchService] Groq API call successful`);

    const reportContent = completion.choices[0]?.message?.content || '{}';
    let reportData = JSON.parse(reportContent);
    
    console.log(`[DeepSearchService] Parsing successful, sending complete event`);
    sendEvent('complete', reportData);

  } catch (error: any) {
    console.error('[DeepSearchService] Error generating deep search:', error.message || error);
    sendEvent('error', { message: error.message || 'Failed to generate research for this category' });
  } finally {
    console.log(`[DeepSearchService] Request finished, ending response`);
    res.end();
  }
}
