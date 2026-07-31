import { Router } from 'express';
import { streamPromptReport, streamFollowUpReport } from '../services/promptBuilderService';

const router = Router();

router.get('/stream', async (req, res) => {
  // Set headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  // Flush headers so client gets the connection immediately
  res.flushHeaders();

  const { topic, goal, audience, format } = req.query;

  if (!topic || typeof topic !== 'string') {
    res.write(`event: error\ndata: ${JSON.stringify({ message: 'Topic is required' })}\n\n`);
    res.end();
    return;
  }

  // Handle client disconnect
  req.on('close', () => {
    res.end();
  });

  await streamPromptReport(res, {
    topic,
    goal: typeof goal === 'string' ? goal : '',
    audience: typeof audience === 'string' ? audience : '',
    format: typeof format === 'string' ? format : 'Detailed Analysis',
  });
});

router.post('/stream-followup', async (req, res) => {
  // Set headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  // Flush headers so client gets the connection immediately
  res.flushHeaders();

  const { topic, previousReport, conversationHistory, currentQuestion } = req.body;

  if (!topic || !currentQuestion) {
    res.write(`event: error\ndata: ${JSON.stringify({ message: 'Topic and currentQuestion are required' })}\n\n`);
    res.end();
    return;
  }

  // Handle client disconnect
  req.on('close', () => {
    res.end();
  });

  await streamFollowUpReport(res, {
    topic,
    previousReport,
    conversationHistory: Array.isArray(conversationHistory) ? conversationHistory : [],
    currentQuestion
  });
});

export default router;
