import { Router } from 'express';
import { prisma } from '../server';
import { verifyFirebaseToken, AuthRequest } from '../middleware/verifyFirebaseToken';
import { generateResponse } from '../config/AIProvider';
import axios from 'axios';

const router = Router();
router.use(verifyFirebaseToken);

function wfId(req: AuthRequest): string { return String(req.params.id); }

// GET /api/smart-alerts/projects
router.get('/projects', async (req: AuthRequest, res) => {
  try {
    const workflows = await prisma.workflow.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      select: { id: true, title: true, idea: true, status: true, overallProgress: true, createdAt: true },
    });
    res.json({ success: true, projects: workflows });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/smart-alerts/projects/:id/dashboard-data
router.get('/projects/:id/dashboard-data', async (req: AuthRequest, res) => {
  try {
    const id = wfId(req);
    
    let workflow = await prisma.workflow.findUnique({
      where: { id },
      include: {
        smartAlerts: { orderBy: { createdAt: 'desc' } },
        recommendations: { orderBy: { createdAt: 'desc' } },
        researchPapers: { orderBy: { relevance: 'desc' } },
        githubRepos: { orderBy: { stars: 'desc' } },
        techSuggestions: { orderBy: { createdAt: 'desc' } },
        projectHealth: true
      }
    });
    
    if (!workflow) {
      return res.json({ success: true, alerts: [], recommendations: [], papers: [], repos: [], techSuggestions: [], health: null });
    }


    res.json({
      success: true,
      workflow: { id: workflow.id, title: workflow.title, idea: workflow.idea, status: workflow.status, overallProgress: workflow.overallProgress, createdAt: workflow.createdAt },
      alerts: workflow.smartAlerts,
      recommendations: workflow.recommendations,
      papers: workflow.researchPapers,
      repos: workflow.githubRepos,
      techSuggestions: workflow.techSuggestions,
      health: workflow.projectHealth
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/smart-alerts/projects/:id/generate-dashboard
router.post('/projects/:id/generate-dashboard', async (req: AuthRequest, res) => {
  try {
    
    const id = wfId(req);
    let workflow = await prisma.workflow.findUnique({ where: { id } });
    if (!workflow) {
      workflow = await prisma.workflow.create({
        data: {
          id: id,
          title: req.body.title || id,
          idea: req.body.idea || "No idea provided",
          userId: req.user.id,
          status: 'CREATED'
        }
      });
    }




      try {
        const titleQuery = encodeURIComponent(workflow.title || workflow.idea.substring(0, 50));
        
        // 1. Fetch GitHub Repos
        let githubRepos: any[] = [];
        try {
          const ghRes = await axios.get(`https://api.github.com/search/repositories?q=${titleQuery}&sort=stars&order=desc&per_page=5`, { timeout: 8000, headers: {'User-Agent': 'SmartAlerts'} });
          githubRepos = (ghRes.data.items || []).map((r: any) => ({
            name: r.full_name,
            url: r.html_url,
            stars: r.stargazers_count || 0,
            language: r.language || 'Unknown',
            lastCommit: String(r.updated_at || ''),
            issues: r.open_issues_count || 0,
            similarity: Math.floor(Math.random() * 20) + 70
          }));
        } catch (e) { console.error("GitHub fetch failed"); }

        // 2. Fetch Research Papers
        let papers: any[] = [];
        try {
          const ssRes = await axios.get(`https://api.semanticscholar.org/graph/v1/paper/search?query=${titleQuery}&limit=5&fields=title,authors,year,abstract,externalIds,openAccessPdf,url`, { timeout: 8000, headers: { 'User-Agent': 'SmartAlerts/1.0' } });
          papers = (ssRes.data?.data || []).map((p: any) => ({
            title: p.title || 'Untitled',
            authors: (p.authors || []).map((a: any) => a.name).join(', ') || 'Unknown',
            year: p.year ? String(p.year) : '2023',
            abstract: p.abstract?.substring(0, 300) || 'No abstract',
            url: p.url || `https://www.semanticscholar.org/paper/${p.paperId}`,
            pdfUrl: p.openAccessPdf?.url || '',
            source: 'Semantic Scholar',
            relevance: Math.floor(Math.random() * 15) + 80,
          }));
        } catch (e) { console.error("Semantic Scholar fetch failed"); }

        // 3. Gemini Generation
        const aiPrompt = `Analyze this project:
Title: ${workflow.title}
Idea: ${workflow.idea}

Generate a JSON object containing:
1. "alerts": Array of 5-8 objects { type (string), severity (critical/high/medium/low/info), title, description, recommendation, action (string, e.g. 'Fix Now', 'Learn More') }
2. "recommendations": Array of 4-6 actionable recommendations { priority, title, description, impact, actionType }
3. "techSuggestions": Array of 3-5 technology suggestions { name, reason, benefits, difficulty, implementation, docsUrl }
4. "health": Object with scores 0-100 { researchScore, innovationScore, architectureScore, documentationScore, implementationScore, securityScore, testingScore, deploymentScore, performanceScore, overallReadiness }

Return ONLY the raw JSON string, no markdown fences.`;

        let aiData: any = {};
        try {
          const aiRes = await generateResponse([
            { role: 'system', content: 'You return only valid JSON.' },
            { role: 'user', content: aiPrompt }
          ], { temperature: 0.7, timeoutMs: 30000 });
          
          let text = aiRes.text || "{}";
          text = text.replace(/```json/g, "").replace(/```/g, "").trim();
          aiData = JSON.parse(text);
        } catch (e) { console.error("Gemini gen failed"); }

        // 4. Save to DB
        await prisma.$transaction(async (tx) => {
          await tx.smartAlert.deleteMany({ where: { workflowId: id } });
          await tx.recommendation.deleteMany({ where: { workflowId: id } });
          await tx.researchPaper.deleteMany({ where: { workflowId: id } });
          await tx.githubRepository.deleteMany({ where: { workflowId: id } });
          await tx.technologySuggestion.deleteMany({ where: { workflowId: id } });
          await tx.projectHealth.deleteMany({ where: { workflowId: id } });

          if (aiData.alerts) {
            await tx.smartAlert.createMany({ data: aiData.alerts.map((a: any) => ({ ...a, severity: String(a.severity || "info").toLowerCase(), workflowId: id })) });
          }
          if (aiData.recommendations) {
            await tx.recommendation.createMany({ data: aiData.recommendations.map((a: any) => ({ ...a, workflowId: id })) });
          }
          if (papers.length) {
            await tx.researchPaper.createMany({ data: papers.map((p: any) => ({ ...p, workflowId: id })) });
          }
          if (githubRepos.length) {
            await tx.githubRepository.createMany({ data: githubRepos.map((g: any) => ({ ...g, workflowId: id })) });
          }
          if (aiData.techSuggestions) {
            await tx.technologySuggestion.createMany({ data: aiData.techSuggestions.map((t: any) => ({ ...t, workflowId: id })) });
          }
          if (aiData.health) {
            await tx.projectHealth.create({ data: { ...aiData.health, workflowId: id } });
          }
        });
        
      res.json({ success: true, message: "Dashboard generation completed" });
      } catch (err: any) {
        console.error("Error in generation:", err);
        res.status(500).json({ success: false, message: err.message });
      }

  } catch (err: any) {
    if (!res.headersSent) res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/smart-alerts/alerts/:id/resolve
router.post('/alerts/:id/resolve', async (req: AuthRequest, res) => {
  try {
    const alert = await prisma.smartAlert.update({
      where: { id: req.params.id },
      data: { resolved: true }
    });
    res.json({ success: true, alert });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/smart-alerts/recommendations/:id/apply
router.post('/recommendations/:id/apply', async (req: AuthRequest, res) => {
  try {
    const rec = await prisma.recommendation.update({
      where: { id: req.params.id },
      data: { isApplied: true }
    });
    res.json({ success: true, recommendation: rec });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
