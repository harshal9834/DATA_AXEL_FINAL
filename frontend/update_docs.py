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
    mermaid.initialize({ startOnLoad: false, theme: 'default', securityLevel: 'loose' });
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
    toast.info("Compiling PPTX file...");
    try {
      const PptxGenJS = (await import("pptxgenjs")).default;
      const pres = new PptxGenJS();
      pres.layout = "LAYOUT_16x9";
      
      const themeColors = { primary: "4F46E5", secondary: "7C3AED", dark: "0F172A", light: "F8FAFC", white: "FFFFFF" };
      
      const addHeader = (slide: any, title: string) => {
         slide.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: "100%", h: 0.8, fill: { color: themeColors.primary } });
         slide.addText(title, { x: 0.5, y: 0.1, w: "90%", h: 0.6, fontSize: 24, color: themeColors.white, bold: true });
      };

      // 1. Cover
      let s = pres.addSlide();
      s.background = { fill: themeColors.dark };
      s.addText(docData.projectName || "Project Presentation", { x: 1, y: 2, w: 8, fontSize: 44, color: themeColors.white, bold: true });
      s.addText(docData.summary || "", { x: 1, y: 3.2, w: 8, fontSize: 20, color: "94A3B8" });
      s.addText(docData.organization || "Generated by AI Document Studio", { x: 1, y: 4.8, w: 8, fontSize: 14, color: themeColors.primary, bold: true });

      // 2. Executive Summary
      s = pres.addSlide();
      addHeader(s, "Executive Summary");
      s.addText(docData.executiveSummary?.overview || "", { x: 0.5, y: 1.2, w: 9, fontSize: 16, color: "475569" });
      docData.executiveSummary?.metrics?.forEach((m: any, i: number) => {
        s.addShape(pres.ShapeType.roundRect, { x: 0.5 + (i*3), y: 3.5, w: 2.5, h: 1.2, fill: { color: themeColors.light } });
        s.addText(m.value, { x: 0.5 + (i*3), y: 3.6, w: 2.5, h: 0.5, fontSize: 24, color: themeColors.primary, bold: true, align: "center" });
        s.addText(m.label, { x: 0.5 + (i*3), y: 4.1, w: 2.5, h: 0.5, fontSize: 14, color: "64748B", align: "center" });
      });

      // 3. Problem Analysis
      s = pres.addSlide();
      addHeader(s, "Problem Analysis");
      s.addText("Pain Points", { x: 0.5, y: 1.2, w: 4, fontSize: 18, color: themeColors.dark, bold: true });
      docData.problemAnalysis?.painPoints?.forEach((pt: string, i: number) => {
        s.addText("• " + pt, { x: 0.5, y: 1.7 + (i * 0.5), w: 4, fontSize: 14, color: "333333" });
      });
      s.addText("User Personas", { x: 5, y: 1.2, w: 4, fontSize: 18, color: themeColors.dark, bold: true });
      docData.problemAnalysis?.userPersonas?.forEach((u: any, i: number) => {
        s.addText(u.type + ": " + u.description, { x: 5, y: 1.7 + (i * 0.7), w: 4, fontSize: 14, color: "333333", bullet: true });
      });

      // 4. Proposed Solution
      s = pres.addSlide();
      addHeader(s, "Proposed Solution");
      s.addText(docData.proposedSolution?.architectureOverview || "", { x: 0.5, y: 1.2, w: 9, fontSize: 16, color: "475569" });
      s.addText("Innovation Highlights:", { x: 0.5, y: 2.5, w: 9, fontSize: 16, color: themeColors.dark, bold: true });
      docData.proposedSolution?.innovationHighlights?.forEach((h: string, i: number) => {
        s.addText("• " + h, { x: 0.8, y: 3.0 + (i * 0.4), w: 8, fontSize: 14, color: "333333" });
      });

      // 5. Feature Matrix
      s = pres.addSlide();
      addHeader(s, "Feature Matrix");
      const featureRows = [["Feature", "Benefit", "Impact", "Priority"]];
      docData.featureMatrix?.forEach((f: any) => {
        featureRows.push([f.feature, f.benefit, f.impact, f.priority]);
      });
      s.addTable(featureRows, { x: 0.5, y: 1.2, w: 9, fill: "F8FAFC", color: "333333", fontSize: 12, border: { type: "solid", color: "E2E8F0" } });

      // 6. System Workflow (Placeholder for SVG)
      s = pres.addSlide();
      addHeader(s, "System Workflow");
      const wfEl = document.getElementById("wf-svg-container");
      if (wfEl) {
        try { const dataUrl = await toPng(wfEl); s.addImage({ data: dataUrl, x: 1, y: 1.5, w: 8, h: 3.5 }); } catch(e){}
      } else {
        s.addText("Workflow diagram generated in Web View.", { x: 1, y: 2, w: 8, align: "center", color: "94A3B8" });
      }

      // 7. Architecture
      s = pres.addSlide();
      addHeader(s, "High-Level Architecture");
      const archEl = document.getElementById("arch-svg-container");
      if (archEl) {
        try { const dataUrl = await toPng(archEl); s.addImage({ data: dataUrl, x: 1, y: 1.5, w: 8, h: 3.5 }); } catch(e){}
      } else {
        s.addText("Architecture diagram generated in Web View.", { x: 1, y: 2, w: 8, align: "center", color: "94A3B8" });
      }

      // 8. Database Design
      s = pres.addSlide();
      addHeader(s, "Database Design (ER Diagram)");
      const erEl = document.getElementById("er-svg-container");
      if (erEl) {
        try { const dataUrl = await toPng(erEl); s.addImage({ data: dataUrl, x: 1, y: 1.5, w: 8, h: 3.5 }); } catch(e){}
      } else {
        s.addText("ER diagram generated in Web View.", { x: 1, y: 2, w: 8, align: "center", color: "94A3B8" });
      }

      // 9. Tech Stack
      s = pres.addSlide();
      addHeader(s, "Technology Stack");
      const techCats = ["Frontend", "Backend", "Database", "AI / DevOps"];
      const techVals = [docData.techStack?.frontend, docData.techStack?.backend, docData.techStack?.database, [...(docData.techStack?.aiModels||[]), ...(docData.techStack?.devops||[])]];
      techCats.forEach((cat, i) => {
        s.addText(cat, { x: 0.5 + (i*2.3), y: 1.5, w: 2, fontSize: 16, color: themeColors.primary, bold: true });
        const arr = techVals[i] || [];
        s.addText(arr.join("\\n"), { x: 0.5 + (i*2.3), y: 2.0, w: 2, fontSize: 14, color: "333333" });
      });

      // 10. Business Model
      s = pres.addSlide();
      addHeader(s, "Business Model Canvas");
      s.addText("See generated document for full 9-block matrix.", { x: 1, y: 2.5, w: 8, align: "center", fontSize: 20, color: "64748B" });

      // 11. Research
      s = pres.addSlide();
      addHeader(s, "Research & Competitive Analysis");
      s.addText("Competitors", { x: 0.5, y: 1.2, w: 9, fontSize: 18, color: themeColors.dark, bold: true });
      const compRows = [["Competitor", "Weakness", "Our Advantage"]];
      docData.researchAndAnalysis?.competitors?.forEach((c: any) => {
        compRows.push([c.name, c.weakness, c.ourAdvantage]);
      });
      s.addTable(compRows, { x: 0.5, y: 1.7, w: 9, fill: "F8FAFC", color: "333333", fontSize: 12, border: { type: "solid", color: "E2E8F0" } });

      // 12. Roadmap
      s = pres.addSlide();
      addHeader(s, "Implementation Roadmap");
      docData.implementationRoadmap?.forEach((r: any, i: number) => {
        s.addShape(pres.ShapeType.roundRect, { x: 0.5 + (i*1.8), y: 2, w: 1.6, h: 2, fill: { color: themeColors.light } });
        s.addText(r.phase, { x: 0.5 + (i*1.8), y: 2.2, w: 1.6, fontSize: 14, color: themeColors.primary, bold: true, align: "center" });
        s.addText(r.duration, { x: 0.5 + (i*1.8), y: 2.7, w: 1.6, fontSize: 12, color: "64748B", align: "center" });
      });

      // 13. Risks
      s = pres.addSlide();
      addHeader(s, "Risk & Feasibility");
      s.addText("Technical Risks: " + (docData.riskAndFeasibility?.technicalRisks?.join(", ") || ""), { x: 0.5, y: 1.5, w: 9, fontSize: 14 });
      s.addText("Business Risks: " + (docData.riskAndFeasibility?.businessRisks?.join(", ") || ""), { x: 0.5, y: 2.2, w: 9, fontSize: 14 });
      s.addText("Mitigation Plan: " + (docData.riskAndFeasibility?.mitigationPlan?.join(", ") || ""), { x: 0.5, y: 2.9, w: 9, fontSize: 14, color: themeColors.primary, bold: true });

      // 14. Impact
      s = pres.addSlide();
      addHeader(s, "Impact & Future Scope");
      s.addText(docData.impactAndFutureScope?.businessImpact || "", { x: 0.5, y: 1.5, w: 9, fontSize: 16 });
      s.addText("Future Features:", { x: 0.5, y: 2.5, w: 9, fontSize: 16, bold: true });
      docData.impactAndFutureScope?.futureFeatures?.forEach((f: string, i: number) => {
        s.addText("• " + f, { x: 0.8, y: 3.0 + (i*0.4), w: 8, fontSize: 14 });
      });

      // 15. Thank You
      s = pres.addSlide();
      s.background = { fill: themeColors.primary };
      s.addText("Thank You", { x: 1, y: 2, w: 8, fontSize: 44, color: themeColors.white, bold: true, align: "center" });
      s.addText(docData.presenter || "End of Presentation", { x: 1, y: 3.5, w: 8, fontSize: 18, color: "E2E8F0", align: "center" });

      pres.writeFile({ fileName: `Presentation_${(docData.projectName||"Project").replace(/\s+/g, "_")}.pptx` });
      toast.success("PPT Downloaded!");
    } catch (e) {
      toast.error("Failed to generate PPT");
      console.error(e);
    }
  };

  const downloadDOCX = async () => {
    if (!docData?.srs) return;
    toast.info("Compiling SRS DOCX file...");
    try {
      const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell } = await import("docx");
      const srs = docData.srs;
      
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            // Page 1: Cover
            new Paragraph({ text: "Software Requirement Specification", heading: HeadingLevel.HEADING_1 }),
            new Paragraph({ text: `Project: ${docData.projectName || "Unknown"}`, heading: HeadingLevel.HEADING_2 }),
            new Paragraph({ text: `Version: ${srs.version || "1.0"}\\nDate: ${new Date().toLocaleDateString()}` }),
            new Paragraph({ text: "" }),
            
            // Page 2: Intro
            new Paragraph({ text: "1. Introduction", heading: HeadingLevel.HEADING_2 }),
            new Paragraph({ text: "1.1 Purpose", heading: HeadingLevel.HEADING_3 }),
            new Paragraph({ text: srs.purpose || "" }),
            new Paragraph({ text: "1.2 Scope", heading: HeadingLevel.HEADING_3 }),
            new Paragraph({ text: srs.scope || "" }),
            new Paragraph({ text: "1.3 Definitions", heading: HeadingLevel.HEADING_3 }),
            ...(srs.definitions||[]).map((d:string) => new Paragraph({ text: "• " + d })),
            
            // Page 3: Description
            new Paragraph({ text: "2. Overall Description", heading: HeadingLevel.HEADING_2 }),
            new Paragraph({ text: srs.systemOverview || "" }),
            new Paragraph({ text: "2.1 Assumptions & Dependencies", heading: HeadingLevel.HEADING_3 }),
            ...(srs.assumptions||[]).map((o:string) => new Paragraph({ text: "• " + o })),

            // Page 4: Functional
            new Paragraph({ text: "3. Functional Requirements", heading: HeadingLevel.HEADING_2 }),
            ...(srs.functionalRequirements||[]).map((f:any) => new Paragraph({ text: `[${f.id}] ${f.priority} - ${f.description}` })),

            // Page 5: Non-Functional
            new Paragraph({ text: "4. Non-Functional Requirements", heading: HeadingLevel.HEADING_2 }),
            new Paragraph({ text: "Performance: " + (srs.nonFunctionalRequirements?.performance?.join(", ")||"") }),
            new Paragraph({ text: "Security: " + (srs.nonFunctionalRequirements?.security?.join(", ")||"") }),

            // Page 6: Use Cases
            new Paragraph({ text: "5. Use Cases", heading: HeadingLevel.HEADING_2 }),
            ...(srs.useCases||[]).map((u:any) => new Paragraph({ text: `[${u.id}] ${u.name} (${u.actor}): ${u.flow}` })),

            // Page 7: APIs
            new Paragraph({ text: "6. API Endpoints", heading: HeadingLevel.HEADING_2 }),
            ...(srs.apiEndpoints||[]).map((a:any) => new Paragraph({ text: `${a.method} ${a.endpoint} - ${a.description}` })),

            // Page 8: Testing & Deployment
            new Paragraph({ text: "7. Testing Strategy", heading: HeadingLevel.HEADING_2 }),
            new Paragraph({ text: srs.testingStrategy?.systemTesting || "" }),
            new Paragraph({ text: "8. Deployment & Conclusion", heading: HeadingLevel.HEADING_2 }),
            new Paragraph({ text: srs.deployment?.architecture || "" }),
          ]
        }]
      });

      Packer.toBlob(doc).then((blob) => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `SRS_${(docData.projectName||"Project").replace(/\s+/g, "_")}.docx`;
        a.click();
        toast.success("DOCX Downloaded!");
      });
    } catch (e) {
      toast.error("Failed to generate DOCX");
      console.error(e);
    }
  };

  const downloadPDF = async () => {
    if (!docData?.srs) return;
    toast.info("Generating PDF Report...");
    try {
      const el = document.getElementById("srs-document-container");
      if (!el) return;
      const h2p = (await import("html2pdf.js")).default || (await import("html2pdf.js"));
      
      const opt = {
        margin: 0,
        filename: `SRS_${(docData.projectName||"Project").replace(/\s+/g, "_")}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };
      
      await h2p().from(el).set(opt).save();
      toast.success("PDF Downloaded!");
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
          <p className="text-sm text-slate-500 mt-1">Generate professional presentations and SRS documents instantly.</p>
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
              Presentation View
            </button>
            <button onClick={() => setActiveTab("SRS")} className={`px-2 py-1 text-sm font-bold border-b-2 transition-colors ${activeTab === "SRS" ? "border-primary text-primary" : "border-transparent text-slate-500 hover:text-slate-800"}`}>
              Document View
            </button>
          </div>
          <div className="flex gap-2">
             <button onClick={downloadPPT} className="flex items-center gap-2 rounded-lg bg-orange-50 text-orange-600 px-3 py-1.5 text-xs font-bold hover:bg-orange-100">
               <Download className="h-3.5 w-3.5" /> Download PPTX
             </button>
             <button onClick={downloadDOCX} className="flex items-center gap-2 rounded-lg bg-blue-50 text-blue-600 px-3 py-1.5 text-xs font-bold hover:bg-blue-100">
               <Download className="h-3.5 w-3.5" /> Download DOCX
             </button>
             <button onClick={downloadPDF} className="flex items-center gap-2 rounded-lg bg-emerald-50 text-emerald-600 px-3 py-1.5 text-xs font-bold hover:bg-emerald-100">
               <Download className="h-3.5 w-3.5" /> Download PDF
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
            <p className="text-sm text-slate-500">Creating Canva-like slides and SRS layout via AI</p>
          </div>
        )}

        {docData && activeTab === "PPT" && (
          <div className="absolute inset-0 overflow-y-auto p-8 space-y-12 pb-20 flex flex-col items-center">
            {/* Slide 1 */}
            <div className="w-full max-w-4xl aspect-video bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl shadow-2xl overflow-hidden relative flex flex-col justify-center items-center text-center p-12 shrink-0">
               <h1 className="text-5xl font-black text-white mb-6 leading-tight">{docData.projectName}</h1>
               <p className="text-xl text-slate-300 font-medium max-w-2xl">{docData.summary}</p>
            </div>

            {/* Slide Workflow with Mermaid */}
            <div id="wf-svg-container" className="w-full max-w-4xl aspect-video bg-white rounded-xl shadow-xl overflow-hidden shrink-0 flex flex-col p-10">
               <h2 className="text-2xl font-black text-slate-800 uppercase tracking-wide mb-4">System Workflow</h2>
               <div className="flex-1 bg-slate-50 rounded-xl p-4 flex items-center justify-center border">
                  {docData.systemWorkflow && <MermaidDiagram chart={docData.systemWorkflow} id="wf-mermaid" />}
               </div>
            </div>

            {/* Slide Architecture with Mermaid */}
            <div id="arch-svg-container" className="w-full max-w-4xl aspect-video bg-white rounded-xl shadow-xl overflow-hidden shrink-0 flex flex-col p-10">
               <h2 className="text-2xl font-black text-slate-800 uppercase tracking-wide mb-4">Architecture</h2>
               <div className="flex-1 bg-slate-50 rounded-xl p-4 flex items-center justify-center border">
                  {docData.highLevelArchitecture && <MermaidDiagram chart={docData.highLevelArchitecture} id="arch-mermaid" />}
               </div>
            </div>

            {/* Slide ER Diagram with Mermaid */}
            <div id="er-svg-container" className="w-full max-w-4xl aspect-video bg-white rounded-xl shadow-xl overflow-hidden shrink-0 flex flex-col p-10">
               <h2 className="text-2xl font-black text-slate-800 uppercase tracking-wide mb-4">Database ER</h2>
               <div className="flex-1 bg-slate-50 rounded-xl p-4 flex items-center justify-center border">
                  {docData.databaseDesign && <MermaidDiagram chart={docData.databaseDesign} id="er-mermaid" />}
               </div>
            </div>

            {/* Additional Slides omitted for preview brevity, but they will be generated in PPTX */}
          </div>
        )}

        {docData && activeTab === "SRS" && (
          <div className="absolute inset-0 overflow-y-auto p-8 flex justify-center bg-slate-200">
            <div id="srs-document-container" className="w-full max-w-3xl bg-white shadow-2xl min-h-[1100px] p-16 text-slate-900 pb-24">
               {/* Cover Page */}
               <div className="min-h-[900px] flex flex-col justify-center items-center text-center border-b-2 border-slate-900 mb-16 pb-16">
                 <h3 className="text-xl font-semibold text-slate-500 uppercase tracking-widest mb-10">Software Requirement Specification</h3>
                 <h1 className="text-5xl font-black text-slate-900 mb-8 leading-tight">{docData.projectName}</h1>
                 <p className="text-xl text-slate-600 mb-20">{docData.srs?.purpose}</p>
                 <div className="text-left mt-auto space-y-4 text-slate-600 font-medium w-64 border-l-4 border-primary pl-6">
                   <p><strong>Version:</strong> {docData.srs?.version}</p>
                   <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
                 </div>
               </div>

               {/* Intro */}
               <div className="space-y-6 text-sm leading-relaxed mb-12">
                 <h2 className="text-2xl font-bold text-primary border-b border-slate-200 pb-2">1. Introduction</h2>
                 <p className="text-slate-600">{docData.srs?.purpose}</p>
               </div>

               {/* Requirements */}
               <div className="space-y-6 text-sm leading-relaxed mb-12">
                 <h2 className="text-2xl font-bold text-primary border-b border-slate-200 pb-2">2. Functional Requirements</h2>
                 <div className="border border-slate-300 rounded-lg overflow-hidden mt-6">
                   <table className="w-full text-left">
                     <thead className="bg-slate-100">
                       <tr>
                         <th className="p-3 font-bold text-slate-700">ID</th>
                         <th className="p-3 font-bold text-slate-700">Description</th>
                         <th className="p-3 font-bold text-slate-700 w-24">Priority</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-200">
                       {docData.srs?.functionalRequirements?.map((r:any, i:number)=>(
                         <tr key={i} className="hover:bg-slate-50">
                           <td className="p-3 font-medium">{r.id}</td>
                           <td className="p-3 text-slate-600">{r.description}</td>
                           <td className="p-3 text-xs font-bold uppercase">{r.priority}</td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 </div>
               </div>
               
               {/* Non Functional */}
               <div className="space-y-6 text-sm leading-relaxed mb-12">
                 <h2 className="text-2xl font-bold text-primary border-b border-slate-200 pb-2">3. Non-Functional Requirements</h2>
                 <ul className="space-y-4 mt-6">
                   <li className="flex gap-4"><span className="w-32 font-bold text-slate-700">Performance</span><span className="text-slate-600 flex-1">{docData.srs?.nonFunctionalRequirements?.performance?.join(", ")}</span></li>
                   <li className="flex gap-4"><span className="w-32 font-bold text-slate-700">Security</span><span className="text-slate-600 flex-1">{docData.srs?.nonFunctionalRequirements?.security?.join(", ")}</span></li>
                 </ul>
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
print("Updated app.docs.tsx successfully")
