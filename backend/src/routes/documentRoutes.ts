import { Router } from 'express';
import { prisma } from '../server';
import { verifyFirebaseToken, AuthRequest } from '../middleware/verifyFirebaseToken';
import { ProviderManager } from '../services/ai/provider-manager';
import multer from 'multer';
import fs from 'fs';

let pdfParse: any;
let mammoth: any;
try {
  pdfParse = require('pdf-parse');
  mammoth = require('mammoth');
} catch (e) {}

const router = Router();
router.use(verifyFirebaseToken);

const upload = multer({ dest: 'uploads/' });

const GEMINI_JSON_PROMPT = `
You are an expert AI Documentation Studio Assistant.
Your job is to take the provided context (either a project description or raw document text) and generate a HIGHLY STRUCTURED JSON output.
This JSON will be used to automatically render an 8-slide Pitch Deck (Presentation) and an 8-page Software Requirement Specification (SRS) document.

DO NOT return ANY markdown formatting, no \`\`\`json blocks. RETURN ONLY VALID RAW JSON.

You MUST generate diagrams using Mermaid.js syntax for workflow and architecture diagrams.

The required JSON structure must be EXACTLY:

{
  "projectName": "Name of the project",
  "summary": "1-2 sentence tagline",
  "problem": {
    "statement": "The core problem statement",
    "painPoints": ["Point 1", "Point 2", "Point 3"],
    "targetUsers": ["User 1", "User 2"]
  },
  "solution": {
    "overview": "Overview of the solution",
    "keyFeatures": ["Feature 1", "Feature 2", "Feature 3", "Feature 4"],
    "innovationPoints": ["Innovation 1", "Innovation 2"]
  },
  "techStack": {
    "frontend": ["Tech 1", "Tech 2"],
    "backend": ["Tech 1", "Tech 2"],
    "database": ["DB 1"],
    "aiModels": ["Model 1", "Model 2"],
    "cloud": ["Cloud 1"]
  },
  "workflow": {
    "description": "Brief process description",
    "mermaid": "graph LR\n  A[Upload/Select] --> B[AI Analysis]\n  B --> C[Research]\n  C --> D[Innovation]\n  D --> E[Documentation]\n  E --> F[Export]"
  },
  "architecture": {
    "description": "Brief architecture description",
    "mermaid": "graph TD\n  A[User] --> B[Frontend]\n  B --> C[Backend API]\n  C --> D[AI Engine]\n  C --> E[(Database)]\n  C --> F[Reports]"
  },
  "results": {
    "impact": "Expected impact description"
  },
  "srs": {
    "version": "1.0",
    "purpose": "Purpose of the system",
    "scope": "Scope of the system",
    "functionalRequirements": [
      { "module": "Module 1", "feature": "Feature 1", "priority": "High" }
    ],
    "nonFunctionalRequirements": [
      { "category": "Performance", "requirement": "Req 1" }
    ],
    "architecture": "High level architecture description",
    "workflow": "High level workflow description"
  }
}
`;


router.post('/generate-from-project', async (req: AuthRequest, res) => {
  try {
    const { projectId } = req.body;
    if (!projectId) return res.status(400).json({ error: "Missing projectId" });

    const workflow = await prisma.workflow.findUnique({
      where: { id: projectId },
      include: {
        researchPapers: true,
        smartAlerts: true,
        recommendations: true,
      }
    });

    let context = "";
    if (workflow) {
      context = `Project Name: ${workflow.title}\nIdea/Description: ${workflow.idea}\n\n`;
      context += "Research Papers:\n" + workflow.researchPapers.map(p => p.title).join(", ") + "\n\n";
      context += "Smart Alerts:\n" + workflow.smartAlerts.map(a => a.title).join(", ") + "\n\n";
    } else {
      context = `Project Name: ${projectId}\nIdea/Description: Generate a highly professional technical overview for a project named ${projectId}.`;
    }

    const aiPrompt = `${GEMINI_JSON_PROMPT}\n\nContext:\n${context}`;
    
    const responseObj = await ProviderManager.generate([{ role: "user", content: aiPrompt }], 'documentation', projectId);
    
    if (!responseObj.success || !responseObj.data) {
       return res.status(500).json({ error: "All AI providers failed to generate valid documentation." });
    }

    return res.json({ success: true, data: responseObj.data, aiMeta: { provider: responseObj.provider, model: responseObj.model, time: responseObj.generationTime } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/generate-from-file', upload.single('file'), async (req: AuthRequest, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    
    const filePath = req.file.path;
    const originalName = req.file.originalname.toLowerCase();
    let extractedText = "";

    try {
      if (originalName.endsWith('.pdf') && pdfParse) {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdfParse(dataBuffer);
        extractedText = data.text;
      } else if (originalName.endsWith('.docx') && mammoth) {
        const result = await mammoth.extractRawText({ path: filePath });
        extractedText = result.value;
      } else {
        extractedText = fs.readFileSync(filePath, 'utf8');
      }
    } catch (e: any) {
      fs.unlinkSync(filePath);
      return res.status(500).json({ error: "Failed to extract text from file: " + e.message });
    }

    fs.unlinkSync(filePath);
    extractedText = extractedText.substring(0, 30000);

    const aiPrompt = `${GEMINI_JSON_PROMPT}\n\nDocument Text Context:\n${extractedText}`;
    
    const responseObj = await ProviderManager.generate([{ role: "user", content: aiPrompt }], 'documentation', 'file-upload');

    if (!responseObj.success || !responseObj.data) {
       return res.status(500).json({ error: "All AI providers failed to generate valid documentation." });
    }

    return res.json({ success: true, data: responseObj.data, aiMeta: { provider: responseObj.provider, model: responseObj.model, time: responseObj.generationTime } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
