import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { prisma } from '../server';
import { verifyFirebaseToken, AuthRequest } from '../middleware/verifyFirebaseToken';
import { startWorkflow } from '../services/workflowEngine';

const router = Router();
router.use(verifyFirebaseToken);

// ─── Multer Storage ──────────────────────────────────────────────────────────
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const ALLOWED_MIMES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'text/plain',
  'text/markdown',
  'text/csv',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/zip',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif'
];

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIMES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}`));
    }
  }
});

// ─── Text Extraction ─────────────────────────────────────────────────────────
async function extractTextFromFile(filePath: string, mimeType: string): Promise<string> {
  try {
    if (mimeType === 'application/pdf') {
      const pdfParse = require('pdf-parse');
      const buffer = fs.readFileSync(filePath);
      const data = await pdfParse(buffer);
      return data.text || '';
    }

    if (
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mimeType === 'application/msword'
    ) {
      const mammoth = await import('mammoth');
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value || '';
    }

    if (
      mimeType === 'text/plain' ||
      mimeType === 'text/markdown' ||
      mimeType === 'text/csv'
    ) {
      return fs.readFileSync(filePath, 'utf-8');
    }

    if (mimeType.startsWith('image/')) {
      // No system-level OCR available — return a meaningful placeholder
      return '[Image uploaded — visual content requires manual description or OCR integration]';
    }

    return '[File content could not be extracted automatically]';
  } catch (err: any) {
    console.error('[Upload] Extraction error:', err.message);
    return `[Extraction failed: ${err.message}]`;
  }
}

// ─── LLM Context Generation ──────────────────────────────────────────────────
async function generateProjectContext(
  extractedText: string,
  originalPrompt: string
): Promise<{ title: string; domain: string; context: string }> {
  const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;
  if (!OPENROUTER_KEY) return {
    title: 'New Project',
    domain: 'Technology',
    context: extractedText.slice(0, 2000)
  };

  const systemPrompt = `You are an AI Project Architect. Given uploaded file content and a user prompt, extract:
1. A concise project title (max 8 words)
2. Project domain (e.g., Healthcare, FinTech, Education, E-Commerce, Agriculture, IoT, Government)
3. A structured project context summarizing: Problem Statement, Key Requirements, Target Users, Technology Stack, Main Entities, Modules, and Deliverables.

Respond ONLY with valid JSON: {"title": string, "domain": string, "context": string}`;

  const userMessage = `User Prompt: ${originalPrompt || 'Build a project based on the uploaded files'}

File Content:
${extractedText.slice(0, 8000)}`;

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_KEY}`,
        'HTTP-Referer': 'http://localhost:3001',
        'X-Title': 'Data Axel Insight'
      },
      body: JSON.stringify({
        model: 'google/gemini-1.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        max_tokens: 1000,
        response_format: { type: 'json_object' }
      })
    });

    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content || '{}';
    const parsed = JSON.parse(raw);
    return {
      title: parsed.title || 'New Project',
      domain: parsed.domain || 'Technology',
      context: parsed.context || extractedText.slice(0, 2000)
    };
  } catch (err: any) {
    console.error('[Upload] LLM context generation failed:', err.message);
    return { title: 'New Project', domain: 'Technology', context: extractedText.slice(0, 2000) };
  }
}

// ─── POST /api/upload ────────────────────────────────────────────────────────
router.post('/', upload.array('files', 10), async (req: AuthRequest, res: Response) => {
  const files = req.files as Express.Multer.File[];
  try {
    const userId = req.user.id;
    const userPrompt = (req.body.prompt as string) || '';

    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded.' });
    }

    console.log(`[Upload] Processing ${files.length} file(s) for user ${userId}`);

    // Step 1: Extract text from all files
    const extractions = await Promise.all(files.map(async (file) => {
      const text = await extractTextFromFile(file.path, file.mimetype);
      return { file, text };
    }));

    const combinedText = extractions.map(e =>
      `=== ${e.file.originalname} ===\n${e.text}`
    ).join('\n\n');

    // Step 2: Generate AI project context
    const { title, domain, context } = await generateProjectContext(combinedText, userPrompt);
    console.log(`[Upload] Generated context — Title: "${title}", Domain: "${domain}"`);

    // Step 3: Create the workflow/project
    const workflow = await prisma.workflow.create({
      data: {
        title,
        idea: userPrompt || context.slice(0, 500),
        domain,
        projectContext: context,
        status: 'CREATED',
        userId
      }
    });

    // Step 4: Create default agents
    const agentNames = [
      'Research & Discovery',
      'Innovation & Strategy',
      'Architecture & Development',
      'Backend Generation',
      'Frontend Generation',
      'Documentation & Presentation',
      'Testing & Validation',
      'Project Export'
    ];
    for (const name of agentNames) {
      await prisma.workflowAgent.create({
        data: { workflowId: workflow.id, name, status: 'WAITING' }
      });
    }

    // Step 5: Persist uploaded files with extracted text
    await Promise.all(extractions.map(e =>
      prisma.uploadedFile.create({
        data: {
          workflowId: workflow.id,
          filename: e.file.filename,
          originalName: e.file.originalname,
          mimeType: e.file.mimetype,
          sizeBytes: e.file.size,
          extractedText: e.text,
          status: 'EXTRACTED'
        }
      })
    ));

    // Step 6: Clean up temp files
    files.forEach(f => { try { fs.unlinkSync(f.path); } catch (_) {} });

    // Step 7: Start execution engine
    startWorkflow(workflow.id);

    console.log(`[Upload] Workflow ${workflow.id} created and started.`);
    res.status(201).json({ success: true, workflowId: workflow.id, title, domain });

  } catch (err: any) {
    // Clean up on error
    if (files) files.forEach(f => { try { fs.unlinkSync(f.path); } catch (_) {} });
    console.error('[Upload] Error:', err.message, err.stack);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── Multer error handler ────────────────────────────────────────────────────
router.use((err: any, _req: Request, res: Response, next: any) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ success: false, message: 'File too large. Maximum size is 50MB.' });
  }
  if (err.message?.startsWith('Unsupported file type')) {
    return res.status(415).json({ success: false, message: err.message });
  }
  next(err);
});

export default router;
