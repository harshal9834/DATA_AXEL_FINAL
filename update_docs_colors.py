import os

FILE_PATH = r"c:\Users\Kunal\OneDrive\Desktop\Data_axle_logiloop\DATA_AXEL_FINAL\src\routes\app.docs.tsx"

CONTENT = """import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Presentation, FileText, Download, Upload, Loader2, ChevronDown, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { projects as demoProjects } from "../lib/demo-data";
import mermaid from "mermaid";
import { toPng } from "html-to-image";

const BACKEND_URL = "http://localhost:3001";

export const Route = createFileRoute("/app/docs")({
  head: () => ({
    meta: [
      { title: "Documentation & Presentation Studio — DATA_AXEL" },
      { name: "description", content: "AI Documentation Workspace" }
    ]
  }),
  component: DocsStudio,
});

function MermaidDiagram({ chart, id }: { chart: string, id: string }) {
  useEffect(() => {
    mermaid.initialize({ 
      startOnLoad: false, 
      theme: 'base', 
      themeVariables: {
        primaryColor: '#4F46E5',
        primaryTextColor: '#FFFFFF',
        primaryBorderColor: '#3730A3',
        lineColor: '#10B981',
        secondaryColor: '#EC4899',
        tertiaryColor: '#F59E0B'
      },
      securityLevel: 'loose' 
    });
    if (chart) {
      mermaid.render(`mermaid-${id}`, chart).then((result) => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = result.svg;
      }).catch(e => console.error("Mermaid render error", e));
    }
  }, [chart, id]);
  return <div id={id} className="mermaid-container flex justify-center items-center w-full h-full overflow-hidden" />;
}

function DocsStudio() {
  const navigate = useNavigate();
  const [projectId, setProjectId] = useState<string | null>(null);
  
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const pid = params.get("projectId");
      if (pid) {
        setProjectId(pid);
        const p = allProjects.find(x => x.id === pid);
        if (p) setSelProject(p);
      }
    }
  }, []);

  const [activeTab, setActiveTab] = useState<"PPT" | "SRS">("PPT");
  const [projects, setProjects] = useState<any[]>(demoProjects);
  const [selProject, setSelProject] = useState<any>(demoProjects[0]);
  const [showPicker, setShowPicker] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [docData, setDocData] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProj = async () => {
      try {
        const { auth } = await import("../firebase/firebase");
        const token = await auth.currentUser?.getIdToken();
        if (token) {
          const res = await fetch(`${BACKEND_URL}/api/smart-alerts/projects`, { headers: { Authorization: `Bearer ${token}` } });
          const d = await res.json();
          if (d.success && d.projects) {
            const merged = [...demoProjects, ...d.projects];
            setProjects(merged);
            if (projectId) {
              const p = merged.find((x:any) => x.id === projectId);
              if (p) setSelProject(p);
            }
          }
        }
      } catch (e) {}
    };
    fetchProj();
  }, [projectId]);

  const allProjects = projects;

  const handleGenerateFromProject = async () => {
    if (!selProject) return toast.error("Select a project first");
    setIsGenerating(true);
    toast.info("Analyzing project to build documents...", { duration: 4000 });
    
    try {
      const { auth } = await import("../firebase/firebase");
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error("Not authenticated");
      
      const res = await fetch(`${BACKEND_URL}/api/documents/generate-from-project`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: selProject.id })
      });
      const d = await res.json();
      if (d.success) {
        setDocData(d.data);
        toast.success("Documents generated successfully!");
      } else {
        toast.error(d.error || "Generation failed");
      }
    } catch (e: any) {
      toast.error("Error: " + e.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) return toast.error("File exceeds 20MB limit");
    
    setIsGenerating(true);
    toast.info(`Extracting text from ${file.name}...`, { duration: 4000 });
    
    try {
      const { auth } = await import("../firebase/firebase");
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error("Not authenticated");
      
      const formData = new FormData();
      formData.append("file", file);
      
      const res = await fetch(`${BACKEND_URL}/api/documents/generate-from-file`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      
      const d = await res.json();
      if (d.success) {
        setDocData(d.data);
        toast.success("Documents generated successfully!");
      } else {
        toast.error(d.error || "Generation failed");
      }
    } catch (e: any) {
      toast.error("Error: " + e.message);
    } finally {
      setIsGenerating(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const downloadPPT = async () => {
    if (!docData) return;
    toast.info("Compiling highly colorful PPTX file...");
    try {
      const PptxGenJS = (await import("pptxgenjs")).default;
      const pres = new PptxGenJS();
      pres.layout = "LAYOUT_16x9";
      
      // Vibrant Color Palette
      const themeColors = { 
        primary: "4F46E5", secondary: "EC4899", dark: "0F172A", 
        light: "F8FAFC", white: "FFFFFF", accent: "10B981", vibrant: "8B5CF6", warm: "F59E0B"
      };
      
      const addHeader = (slide: any, title: string, bg: string = themeColors.primary) => {
         slide.background = { fill: bg };
         slide.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: "100%", h: 1.2, fill: { color: "000000", transparency: 80 } });
         slide.addText(title, { x: 0.5, y: 0.2, w: "90%", h: 0.8, fontSize: 32, color: themeColors.white, bold: true });
      };

      // 1. Premium Cover
      let s = pres.addSlide();
      s.background = { fill: themeColors.dark };
      s.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: 4, h: "100%", fill: { color: themeColors.primary } });
      s.addText(docData.projectName || "Project Presentation", { x: 0.5, y: 2, w: 8, fontSize: 54, color: themeColors.white, bold: true });
      s.addText(docData.summary || "", { x: 0.5, y: 3.5, w: 8, fontSize: 24, color: "E2E8F0" });
      s.addText(docData.organization || "Generated by AI Document Studio", { x: 0.5, y: 5.5, w: 8, fontSize: 16, color: themeColors.accent, bold: true });

      // 2. Executive Summary
      s = pres.addSlide();
      addHeader(s, "Executive Summary", themeColors.vibrant);
      s.addText(docData.executiveSummary?.overview || "", { x: 0.5, y: 1.5, w: 9, fontSize: 20, color: themeColors.white });
      docData.executiveSummary?.metrics?.forEach((m: any, i: number) => {
        s.addShape(pres.ShapeType.roundRect, { x: 0.5 + (i*3.2), y: 3.5, w: 2.8, h: 1.5, fill: { color: themeColors.white } });
        s.addText(m.value, { x: 0.5 + (i*3.2), y: 3.8, w: 2.8, h: 0.5, fontSize: 28, color: themeColors.vibrant, bold: true, align: "center" });
        s.addText(m.label, { x: 0.5 + (i*3.2), y: 4.4, w: 2.8, h: 0.5, fontSize: 16, color: "475569", align: "center" });
      });

      // 3. Problem Analysis
      s = pres.addSlide();
      addHeader(s, "Problem Analysis", themeColors.secondary);
      s.addShape(pres.ShapeType.rect, { x: 0.5, y: 1.5, w: 4.2, h: 3.5, fill: { color: themeColors.white } });
      s.addText("Pain Points", { x: 0.8, y: 1.7, w: 3.6, fontSize: 20, color: themeColors.secondary, bold: true });
      docData.problemAnalysis?.painPoints?.forEach((pt: string, i: number) => {
        s.addText("• " + pt, { x: 0.8, y: 2.3 + (i * 0.5), w: 3.6, fontSize: 16, color: "333333" });
      });
      s.addShape(pres.ShapeType.rect, { x: 5.3, y: 1.5, w: 4.2, h: 3.5, fill: { color: themeColors.white } });
      s.addText("User Personas", { x: 5.6, y: 1.7, w: 3.6, fontSize: 20, color: themeColors.secondary, bold: true });
      docData.problemAnalysis?.userPersonas?.forEach((u: any, i: number) => {
        s.addText(u.type + ": " + u.description, { x: 5.6, y: 2.3 + (i * 0.7), w: 3.6, fontSize: 16, color: "333333", bullet: true });
      });

      // 4. Proposed Solution
      s = pres.addSlide();
      addHeader(s, "Proposed Solution", themeColors.accent);
      s.addText(docData.proposedSolution?.architectureOverview || "", { x: 0.5, y: 1.5, w: 9, fontSize: 20, color: themeColors.white });
      s.addText("Innovation Highlights:", { x: 0.5, y: 3.0, w: 9, fontSize: 22, color: themeColors.dark, bold: true });
      docData.proposedSolution?.innovationHighlights?.forEach((h: string, i: number) => {
        s.addShape(pres.ShapeType.roundRect, { x: 0.5 + (i*3.2), y: 3.6, w: 2.8, h: 1.2, fill: { color: themeColors.white } });
        s.addText(h, { x: 0.6, y: 3.7, w: 2.6, h: 1, fontSize: 16, color: "333333", align: "center" });
      });

      // 5. Market Landscape (NEW VISUAL SLIDE)
      s = pres.addSlide();
      addHeader(s, docData.visualSlides?.marketLandscape?.title || "Market Landscape", themeColors.warm);
      s.addText(docData.visualSlides?.marketLandscape?.trend || "", { x: 0.5, y: 1.5, w: 9, fontSize: 22, color: themeColors.white, bold: true });
      docData.visualSlides?.marketLandscape?.stats?.forEach((st: any, i: number) => {
        s.addShape(pres.ShapeType.oval, { x: 1 + (i*3), y: 2.5, w: 2, h: 2, fill: { color: themeColors.white } });
        s.addText(st.value, { x: 1 + (i*3), y: 3.2, w: 2, fontSize: 28, color: themeColors.warm, bold: true, align: "center" });
        s.addText(st.category, { x: 1 + (i*3), y: 4.8, w: 2, fontSize: 20, color: themeColors.white, bold: true, align: "center" });
      });

      // 6. Target Demographics (NEW VISUAL SLIDE)
      s = pres.addSlide();
      addHeader(s, docData.visualSlides?.targetDemographics?.title || "Target Demographics", themeColors.vibrant);
      s.addShape(pres.ShapeType.rect, { x: 1, y: 2, w: 8, h: 3, fill: { color: themeColors.white }, line: { color: themeColors.dark, width: 2 } });
      s.addText("Core Audience: " + (docData.visualSlides?.targetDemographics?.coreAudience||""), { x: 1.5, y: 2.5, w: 7, fontSize: 24, color: themeColors.vibrant, bold: true });
      s.addText("Age Range: " + (docData.visualSlides?.targetDemographics?.ageRange||""), { x: 1.5, y: 3.3, w: 7, fontSize: 20, color: "333333" });
      s.addText("Key Behavior: " + (docData.visualSlides?.targetDemographics?.keyBehavior||""), { x: 1.5, y: 3.9, w: 7, fontSize: 20, color: "333333" });

      // 7. System Workflow (Mermaid Diagram)
      s = pres.addSlide();
      addHeader(s, "System Workflow", themeColors.dark);
      const wfEl = document.getElementById("wf-svg-container");
      if (wfEl) {
        try { const dataUrl = await toPng(wfEl); s.addImage({ data: dataUrl, x: 1, y: 1.5, w: 8, h: 3.5 }); } catch(e){}
      } else {
        s.addText("Workflow diagram generated in Web View.", { x: 1, y: 3, w: 8, align: "center", color: themeColors.white });
      }

      // 8. Architecture Diagram (Mermaid Diagram)
      s = pres.addSlide();
      addHeader(s, "High-Level Architecture", themeColors.dark);
      const archEl = document.getElementById("arch-svg-container");
      if (archEl) {
        try { const dataUrl = await toPng(archEl); s.addImage({ data: dataUrl, x: 1, y: 1.5, w: 8, h: 3.5 }); } catch(e){}
      } else {
        s.addText("Architecture diagram generated in Web View.", { x: 1, y: 3, w: 8, align: "center", color: themeColors.white });
      }

      // 9. Financial Projections (NEW VISUAL SLIDE)
      s = pres.addSlide();
      addHeader(s, docData.visualSlides?.financialProjections?.title || "Financial Projections", themeColors.accent);
      const fin = docData.visualSlides?.financialProjections;
      if (fin) {
        const years = ["Year 1", "Year 2", "Year 3"];
        const vals = [fin.year1, fin.year2, fin.year3];
        years.forEach((y, i) => {
           s.addShape(pres.ShapeType.roundRect, { x: 1 + (i*2.8), y: 2.5, w: 2.2, h: 2.2, fill: { color: themeColors.white } });
           s.addText(y, { x: 1 + (i*2.8), y: 3.0, w: 2.2, fontSize: 18, color: "64748B", bold: true, align: "center" });
           s.addText(vals[i]||"", { x: 1 + (i*2.8), y: 3.6, w: 2.2, fontSize: 22, color: themeColors.accent, bold: true, align: "center" });
        });
      }

      // 10. Database ER Diagram (Mermaid Diagram)
      s = pres.addSlide();
      addHeader(s, "Database ER Diagram", themeColors.dark);
      const erEl = document.getElementById("er-svg-container");
      if (erEl) {
        try { const dataUrl = await toPng(erEl); s.addImage({ data: dataUrl, x: 1, y: 1.5, w: 8, h: 3.5 }); } catch(e){}
      } else {
        s.addText("ER diagram generated in Web View.", { x: 1, y: 3, w: 8, align: "center", color: themeColors.white });
      }

      // 11. Tech Stack
      s = pres.addSlide();
      addHeader(s, "Technology Stack", themeColors.primary);
      const techCats = ["Frontend", "Backend", "Database", "AI / DevOps"];
      const techVals = [docData.techStack?.frontend, docData.techStack?.backend, docData.techStack?.database, [...(docData.techStack?.aiModels||[]), ...(docData.techStack?.devops||[])]];
      techCats.forEach((cat, i) => {
        s.addShape(pres.ShapeType.rect, { x: 0.5 + (i*2.3), y: 1.5, w: 2, h: 3.5, fill: { color: themeColors.white } });
        s.addText(cat, { x: 0.5 + (i*2.3), y: 1.8, w: 2, fontSize: 18, color: themeColors.primary, bold: true, align: "center" });
        const arr = techVals[i] || [];
        s.addText(arr.join("\\n"), { x: 0.5 + (i*2.3), y: 2.5, w: 2, fontSize: 16, color: "333333", align: "center" });
      });

      // 12. Project Vision (NEW VISUAL SLIDE)
      s = pres.addSlide();
      addHeader(s, docData.visualSlides?.projectVision?.title || "Our Vision", themeColors.secondary);
      s.addText('"' + (docData.visualSlides?.projectVision?.visionStatement||"To revolutionize the industry.") + '"', 
        { x: 1, y: 2.5, w: 8, fontSize: 40, color: themeColors.white, bold: true, align: "center", italic: true });

      // 13. Research
      s = pres.addSlide();
      addHeader(s, "Competitive Analysis", themeColors.vibrant);
      const compRows = [["Competitor", "Weakness", "Our Advantage"]];
      docData.researchAndAnalysis?.competitors?.forEach((c: any) => {
        compRows.push([c.name, c.weakness, c.ourAdvantage]);
      });
      s.addTable(compRows, { x: 0.5, y: 1.5, w: 9, fill: "FFFFFF", color: "333333", fontSize: 16, border: { type: "solid", color: themeColors.vibrant } });

      // 14. Roadmap
      s = pres.addSlide();
      addHeader(s, "Implementation Roadmap", themeColors.warm);
      docData.implementationRoadmap?.forEach((r: any, i: number) => {
        s.addShape(pres.ShapeType.roundRect, { x: 0.5 + (i*2.8), y: 2, w: 2.5, h: 2.5, fill: { color: themeColors.white } });
        s.addText(r.phase, { x: 0.5 + (i*2.8), y: 2.5, w: 2.5, fontSize: 20, color: themeColors.warm, bold: true, align: "center" });
        s.addText(r.duration, { x: 0.5 + (i*2.8), y: 3.2, w: 2.5, fontSize: 16, color: "64748B", align: "center" });
      });

      // 15. Impact
      s = pres.addSlide();
      addHeader(s, "Impact & Future Scope", themeColors.accent);
      s.addText(docData.impactAndFutureScope?.businessImpact || "", { x: 0.5, y: 1.5, w: 9, fontSize: 20, color: themeColors.white });
      s.addText("Future Features:", { x: 0.5, y: 2.5, w: 9, fontSize: 20, color: themeColors.dark, bold: true });
      docData.impactAndFutureScope?.futureFeatures?.forEach((f: string, i: number) => {
        s.addShape(pres.ShapeType.rect, { x: 0.5, y: 3.0 + (i*0.8), w: 9, h: 0.6, fill: { color: themeColors.white } });
        s.addText("🚀 " + f, { x: 0.8, y: 3.1 + (i*0.8), w: 8, fontSize: 16, color: "333333" });
      });

      // 16. Thank You
      s = pres.addSlide();
      s.background = { fill: themeColors.dark };
      s.addText("Thank You", { x: 1, y: 2, w: 8, fontSize: 60, color: themeColors.primary, bold: true, align: "center" });
      s.addText(docData.presenter || "Let's change the world.", { x: 1, y: 3.5, w: 8, fontSize: 24, color: "E2E8F0", align: "center" });

      pres.writeFile({ fileName: `Colorful_Presentation_${(docData.projectName||"Project").replace(/\s+/g, "_")}.pptx` });
      toast.success("Colorful PPT Downloaded!");
    } catch (e) {
      toast.error("Failed to generate PPT");
      console.error(e);
    }
  };

  const downloadDOCX = async () => {
    if (!docData?.srs) return;
    toast.info("Compiling brief SRS DOCX file...");
    try {
      const { Document, Packer, Paragraph, TextRun, HeadingLevel } = await import("docx");
      const srs = docData.srs;
      
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({ text: "Software Requirement Specification (Brief)", heading: HeadingLevel.HEADING_1 }),
            new Paragraph({ text: `Project: ${docData.projectName || "Unknown"}` }),
            new Paragraph({ text: `Version: ${srs.version || "1.0"} | Date: ${new Date().toLocaleDateString()}` }),
            new Paragraph({ text: "" }),
            
            new Paragraph({ text: "1. Core Introduction & Purpose", heading: HeadingLevel.HEADING_2 }),
            new Paragraph({ text: srs.purpose || "" }),
            new Paragraph({ text: "Scope:", heading: HeadingLevel.HEADING_3 }),
            new Paragraph({ text: srs.scope || "" }),
            new Paragraph({ text: "" }),

            new Paragraph({ text: "2. Key Functional Requirements", heading: HeadingLevel.HEADING_2 }),
            ...(srs.functionalRequirements||[]).map((f:any) => new Paragraph({ text: `• [${f.priority}] ${f.description}`, bullet: { level: 0 } })),
            new Paragraph({ text: "" }),

            new Paragraph({ text: "3. Non-Functional Criteria", heading: HeadingLevel.HEADING_2 }),
            new Paragraph({ text: "Performance: " + (srs.nonFunctionalRequirements?.performance?.join(", ")||"") }),
            new Paragraph({ text: "Security: " + (srs.nonFunctionalRequirements?.security?.join(", ")||"") }),
            new Paragraph({ text: "" }),

            new Paragraph({ text: "4. Primary Use Cases & APIs", heading: HeadingLevel.HEADING_2 }),
            ...(srs.useCases||[]).map((u:any) => new Paragraph({ text: `• Use Case: ${u.name} - ${u.flow}`, bullet: { level: 0 } })),
            ...(srs.apiEndpoints||[]).map((a:any) => new Paragraph({ text: `• API: ${a.method} ${a.endpoint} - ${a.description}`, bullet: { level: 0 } })),
            new Paragraph({ text: "" }),

            new Paragraph({ text: "5. Conclusion", heading: HeadingLevel.HEADING_2 }),
            new Paragraph({ text: srs.deployment?.architecture || "" }),
            new Paragraph({ text: srs.conclusion?.expectedBenefits?.join(", ") || "" }),
          ]
        }]
      });

      Packer.toBlob(doc).then((blob) => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `Brief_SRS_${(docData.projectName||"Project").replace(/\s+/g, "_")}.docx`;
        a.click();
        toast.success("Brief DOCX Downloaded!");
      });
    } catch (e) {
      toast.error("Failed to generate DOCX");
      console.error(e);
    }
  };

  const downloadPDF = async () => {
    if (!docData?.srs) return;
    toast.info("Generating Brief PDF Report...");
    try {
      const el = document.getElementById("srs-document-container");
      if (!el) return;
      const h2p = (await import("html2pdf.js")).default || (await import("html2pdf.js"));
      
      const opt = {
        margin: [0.5, 0.5],
        filename: `Brief_SRS_${(docData.projectName||"Project").replace(/\s+/g, "_")}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };
      
      await h2p().from(el).set(opt).save();
      toast.success("Brief PDF Downloaded!");
    } catch (e) {
      toast.error("Failed to generate PDF");
      console.error(e);
    }
  };

  return (
    <div className="flex h-full flex-col space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Presentation className="h-6 w-6 text-primary" />
            AI Document Studio
          </h1>
          <p className="text-sm text-slate-500 mt-1">Generate highly colorful presentations and brief SRS documents instantly.</p>
        </div>

        <div className="flex items-center gap-3">
          <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.docx,.txt" onChange={handleFileUpload} />
          <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors">
            <Upload className="h-4 w-4" /> Upload File
          </button>
          
          <div className="relative">
            <button onClick={() => setShowPicker(!showPicker)} className="flex items-center gap-2 rounded-xl bg-gradient-brand px-4 py-2 text-sm font-semibold text-white shadow-glow hover:opacity-90 transition-opacity min-w-[200px] justify-between">
              <div className="truncate">{selProject?.title || "Select Project"}</div>
              <ChevronDown className="h-4 w-4 opacity-70" />
            </button>
            <AnimatePresence>
              {showPicker && (
                <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}}
                  className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-border/60 bg-white shadow-lg overflow-hidden z-50">
                  <div className="max-h-64 overflow-y-auto">
                    {projects.map(p => (
                      <button key={p.id} onClick={() => { setSelProject(p); setShowPicker(false); }}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 border-b border-slate-100 last:border-0 text-slate-700">
                        <div className="font-medium truncate">{p.title}</div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <button onClick={handleGenerateFromProject} disabled={isGenerating} className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-slate-800 transition-colors disabled:opacity-50">
            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Presentation className="h-4 w-4" />}
            Generate
          </button>
        </div>
      </div>

      {docData && (
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <div className="flex items-center gap-4">
            <button onClick={() => setActiveTab("PPT")} className={`px-2 py-1 text-sm font-bold border-b-2 transition-colors ${activeTab === "PPT" ? "border-primary text-primary" : "border-transparent text-slate-500 hover:text-slate-800"}`}>
              Colorful Presentation View
            </button>
            <button onClick={() => setActiveTab("SRS")} className={`px-2 py-1 text-sm font-bold border-b-2 transition-colors ${activeTab === "SRS" ? "border-primary text-primary" : "border-transparent text-slate-500 hover:text-slate-800"}`}>
              Brief Document View
            </button>
          </div>
          <div className="flex gap-2">
             <button onClick={downloadPPT} className="flex items-center gap-2 rounded-lg bg-orange-50 text-orange-600 px-3 py-1.5 text-xs font-bold hover:bg-orange-100 shadow-sm">
               <Download className="h-3.5 w-3.5" /> Download Colorful PPTX
             </button>
             <button onClick={downloadDOCX} className="flex items-center gap-2 rounded-lg bg-blue-50 text-blue-600 px-3 py-1.5 text-xs font-bold hover:bg-blue-100 shadow-sm">
               <Download className="h-3.5 w-3.5" /> Download Brief DOCX
             </button>
             <button onClick={downloadPDF} className="flex items-center gap-2 rounded-lg bg-emerald-50 text-emerald-600 px-3 py-1.5 text-xs font-bold hover:bg-emerald-100 shadow-sm">
               <Download className="h-3.5 w-3.5" /> Download Brief PDF
             </button>
          </div>
        </div>
      )}

      <div className="flex-1 bg-slate-100/50 rounded-2xl border border-slate-200 overflow-hidden relative min-h-[600px]">
        {!docData && !isGenerating && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
            <div className="h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center mb-4">
               <FileText className="h-10 w-10 text-slate-300" />
            </div>
            <p className="font-medium text-slate-600">No Document Generated</p>
            <p className="text-sm mt-1">Select a project or upload a file to begin.</p>
          </div>
        )}
        
        {isGenerating && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm z-10">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="font-semibold text-slate-800">Synthesizing Context...</p>
            <p className="text-sm text-slate-500">Creating vibrant slides and brief SRS via AI...</p>
          </div>
        )}

        {docData && activeTab === "PPT" && (
          <div className="absolute inset-0 overflow-y-auto p-8 space-y-12 pb-20 flex flex-col items-center">
            {/* Colorful Slide 1 */}
            <div className="w-full max-w-4xl aspect-video bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-xl shadow-2xl overflow-hidden relative flex flex-col justify-center items-center text-center p-12 shrink-0 border-4 border-indigo-300/30">
               <h1 className="text-6xl font-black text-white mb-6 leading-tight drop-shadow-xl">{docData.projectName}</h1>
               <p className="text-2xl text-pink-100 font-bold max-w-2xl drop-shadow-md">{docData.summary}</p>
            </div>

            {/* Slide Workflow with Mermaid */}
            <div className="w-full max-w-4xl aspect-video bg-gradient-to-br from-slate-900 to-indigo-950 rounded-xl shadow-2xl overflow-hidden shrink-0 flex flex-col p-10 border-4 border-indigo-500/30">
               <h2 className="text-3xl font-black text-white uppercase tracking-wide mb-4">System Workflow</h2>
               <div id="wf-svg-container" className="flex-1 bg-white/5 backdrop-blur-sm rounded-xl p-4 flex items-center justify-center border border-white/20 shadow-inner">
                  {docData.systemWorkflow && <MermaidDiagram chart={docData.systemWorkflow} id="wf-mermaid" />}
               </div>
            </div>

            {/* Slide Architecture with Mermaid */}
            <div className="w-full max-w-4xl aspect-video bg-gradient-to-br from-slate-900 to-indigo-950 rounded-xl shadow-2xl overflow-hidden shrink-0 flex flex-col p-10 border-4 border-indigo-500/30">
               <h2 className="text-3xl font-black text-white uppercase tracking-wide mb-4">Architecture</h2>
               <div id="arch-svg-container" className="flex-1 bg-white/5 backdrop-blur-sm rounded-xl p-4 flex items-center justify-center border border-white/20 shadow-inner">
                  {docData.highLevelArchitecture && <MermaidDiagram chart={docData.highLevelArchitecture} id="arch-mermaid" />}
               </div>
            </div>

            {/* Slide ER Diagram with Mermaid */}
            <div className="w-full max-w-4xl aspect-video bg-gradient-to-br from-slate-900 to-indigo-950 rounded-xl shadow-2xl overflow-hidden shrink-0 flex flex-col p-10 border-4 border-indigo-500/30">
               <h2 className="text-3xl font-black text-white uppercase tracking-wide mb-4">Database ER Diagram</h2>
               <div id="er-svg-container" className="flex-1 bg-white/5 backdrop-blur-sm rounded-xl p-4 flex items-center justify-center border border-white/20 shadow-inner">
                  {docData.databaseDesign && <MermaidDiagram chart={docData.databaseDesign} id="er-mermaid" />}
               </div>
            </div>
            <p className="text-slate-500 font-medium">All 16+ colorful slides are available upon export.</p>
          </div>
        )}

        {docData && activeTab === "SRS" && (
          <div className="absolute inset-0 overflow-y-auto p-8 flex justify-center bg-slate-200">
            <div id="srs-document-container" className="w-full max-w-3xl bg-white shadow-2xl p-12 text-slate-900 pb-24">
               {/* Cover Page */}
               <div className="border-b-4 border-indigo-600 mb-10 pb-8 text-center">
                 <h3 className="text-lg font-bold text-indigo-500 uppercase tracking-widest mb-2">SRS Document (Brief)</h3>
                 <h1 className="text-5xl font-black text-slate-900 mb-4">{docData.projectName}</h1>
                 <p className="text-xl text-slate-600 font-medium">{docData.summary}</p>
               </div>

               {/* Intro */}
               <div className="space-y-4 mb-8">
                 <h2 className="text-2xl font-black text-slate-800 bg-slate-100 p-3 rounded-lg">1. Core Purpose & Scope</h2>
                 <p className="text-slate-700 text-lg leading-relaxed px-2 font-medium">{docData.srs?.purpose}</p>
                 <p className="text-slate-700 text-lg leading-relaxed px-2 font-medium">{docData.srs?.scope}</p>
               </div>

               {/* Requirements */}
               <div className="space-y-4 mb-8">
                 <h2 className="text-2xl font-black text-slate-800 bg-slate-100 p-3 rounded-lg">2. Key Requirements</h2>
                 <ul className="space-y-3 px-4">
                   {docData.srs?.functionalRequirements?.map((r:any, i:number)=>(
                     <li key={i} className="flex gap-4 items-start">
                       <span className="bg-indigo-100 text-indigo-800 font-bold px-2 py-1 rounded text-sm shrink-0">{r.priority}</span>
                       <span className="text-slate-700 text-lg font-medium">{r.description}</span>
                     </li>
                   ))}
                 </ul>
               </div>
               
               {/* Non Functional */}
               <div className="space-y-4 mb-8">
                 <h2 className="text-2xl font-black text-slate-800 bg-slate-100 p-3 rounded-lg">3. Non-Functional & APIs</h2>
                 <ul className="space-y-3 px-4 text-lg">
                   <li className="flex gap-2 font-medium text-slate-700"><strong>Performance:</strong> {docData.srs?.nonFunctionalRequirements?.performance?.join(", ")}</li>
                   <li className="flex gap-2 font-medium text-slate-700"><strong>Security:</strong> {docData.srs?.nonFunctionalRequirements?.security?.join(", ")}</li>
                 </ul>
                 <h3 className="font-bold text-slate-800 mt-6 px-2 text-xl">Core API Endpoints</h3>
                 <ul className="space-y-2 px-4 list-disc list-inside">
                   {docData.srs?.apiEndpoints?.map((a:any, i:number)=>(
                     <li key={i} className="text-slate-700 text-lg"><strong>{a.method}</strong> {a.endpoint} - {a.description}</li>
                   ))}
                 </ul>
               </div>

               {/* Conclusion */}
               <div className="space-y-4 mb-8">
                 <h2 className="text-2xl font-black text-slate-800 bg-slate-100 p-3 rounded-lg">4. Conclusion & Deployment</h2>
                 <p className="text-slate-700 text-lg px-2">{docData.srs?.deployment?.architecture}</p>
                 <p className="text-slate-700 text-lg px-2 font-bold text-indigo-600 mt-4">Expected Benefits: {docData.srs?.conclusion?.expectedBenefits?.join(", ")}</p>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
"""

with open(FILE_PATH, "w", encoding="utf-8") as f:
    f.write(CONTENT)
print("Updated app.docs.tsx successfully with vibrant colors and brief SRS content.")
