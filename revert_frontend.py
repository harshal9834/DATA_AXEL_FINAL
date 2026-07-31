import os

FILE_PATH = r"c:\Users\Kunal\OneDrive\Desktop\Data_axle_logiloop\DATA_AXEL_FINAL\src\routes\app.docs.tsx"

CONTENT = """import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Presentation, FileText, Download, Upload, Loader2, ChevronDown } from "lucide-react";
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
  const [activeSlideIdx, setActiveSlideIdx] = useState(0);
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
    toast.info("Generating clean PPT and Document...", { duration: 4000 });
    
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
        setActiveSlideIdx(0);
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
    setIsGenerating(true);
    
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
        setActiveSlideIdx(0);
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

  const slides = docData ? [
    { id: "cover", title: docData.projectName || "Cover" },
    { id: "problem", title: "The Problem" },
    { id: "solution", title: "The Solution" },
    { id: "features", title: "Features & Stack" },
    { id: "architecture", title: "System Architecture" },
    { id: "workflow", title: "System Workflow" },
    { id: "conclusion", title: "Conclusion & Impact" }
  ] : [];

  const downloadPPT = async () => {
    if (!docData) return;
    toast.info("Compiling clean PPTX file...");
    try {
      const PptxGenJS = (await import("pptxgenjs")).default;
      const pres = new PptxGenJS();
      pres.layout = "LAYOUT_16x9";
      
      const themeColors = { primary: "4F46E5", dark: "0F172A", light: "F8FAFC", white: "FFFFFF" };
      
      const addHeader = (slide: any, title: string) => {
         slide.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: "100%", h: 0.8, fill: { color: themeColors.primary } });
         slide.addText(title, { x: 0.5, y: 0.1, w: "90%", h: 0.6, fontSize: 24, color: themeColors.white, bold: true });
      };

      // 1. Cover
      let s = pres.addSlide();
      s.background = { fill: themeColors.dark };
      s.addText(docData.projectName || "Project Presentation", { x: 1, y: 2, w: 8, fontSize: 44, color: themeColors.white, bold: true });
      s.addText(docData.summary || "", { x: 1, y: 3.2, w: 8, fontSize: 20, color: "94A3B8" });
      s.addText("Generated by AI Document Studio", { x: 1, y: 4.8, w: 8, fontSize: 14, color: themeColors.primary, bold: true });

      // 2. Problem
      s = pres.addSlide();
      addHeader(s, "The Problem");
      s.addText(docData.problem?.statement || "", { x: 0.5, y: 1.2, w: 9, fontSize: 16, color: "333333" });
      s.addText("Pain Points:", { x: 0.5, y: 2.2, w: 9, fontSize: 16, bold: true });
      docData.problem?.painPoints?.forEach((pt: string, i: number) => {
        s.addText("• " + pt, { x: 0.8, y: 2.7 + (i * 0.4), w: 8, fontSize: 14 });
      });

      // 3. Solution
      s = pres.addSlide();
      addHeader(s, "The Solution");
      s.addText(docData.solution?.overview || "", { x: 0.5, y: 1.2, w: 9, fontSize: 16, color: "333333" });
      s.addText("Key Innovations:", { x: 0.5, y: 2.2, w: 9, fontSize: 16, bold: true });
      docData.solution?.innovationPoints?.forEach((pt: string, i: number) => {
        s.addText("• " + pt, { x: 0.8, y: 2.7 + (i * 0.4), w: 8, fontSize: 14 });
      });

      // 4. Features & Stack
      s = pres.addSlide();
      addHeader(s, "Features & Technology Stack");
      s.addText("Key Features", { x: 0.5, y: 1.2, w: 4, fontSize: 16, bold: true, color: themeColors.primary });
      docData.solution?.keyFeatures?.forEach((f: string, i: number) => {
        s.addText("• " + f, { x: 0.5, y: 1.7 + (i * 0.4), w: 4, fontSize: 14 });
      });
      s.addText("Technology Stack", { x: 5, y: 1.2, w: 4, fontSize: 16, bold: true, color: themeColors.primary });
      const stack = ["Frontend: " + (docData.techStack?.frontend?.join(", ") || ""), "Backend: " + (docData.techStack?.backend?.join(", ") || ""), "Database: " + (docData.techStack?.database?.join(", ") || "")];
      stack.forEach((st, i) => {
         s.addText("• " + st, { x: 5, y: 1.7 + (i * 0.5), w: 4, fontSize: 14 });
      });

      // 5. Architecture
      s = pres.addSlide();
      addHeader(s, "System Architecture");
      const archEl = document.getElementById("arch-svg-container");
      if (archEl) {
        try { const dataUrl = await toPng(archEl); s.addImage({ data: dataUrl, x: 1, y: 1.2, w: 8, h: 4 }); } catch(e){}
      } else {
        s.addText(docData.architecture?.description || "", { x: 0.5, y: 2, w: 9, fontSize: 16, align: "center" });
      }

      // 6. Workflow
      s = pres.addSlide();
      addHeader(s, "System Workflow");
      const wfEl = document.getElementById("wf-svg-container");
      if (wfEl) {
        try { const dataUrl = await toPng(wfEl); s.addImage({ data: dataUrl, x: 1, y: 1.2, w: 8, h: 4 }); } catch(e){}
      } else {
        s.addText(docData.workflow?.description || "", { x: 0.5, y: 2, w: 9, fontSize: 16, align: "center" });
      }

      // 7. Conclusion
      s = pres.addSlide();
      addHeader(s, "Conclusion & Impact");
      s.addText(docData.results?.impact || "The project provides significant value and innovation.", { x: 0.5, y: 2, w: 9, fontSize: 20, align: "center", color: themeColors.primary, bold: true });

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
      const { Document, Packer, Paragraph, TextRun, HeadingLevel } = await import("docx");
      const srs = docData.srs;
      
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({ text: "Software Requirement Specification", heading: HeadingLevel.HEADING_1 }),
            new Paragraph({ text: `Project: ${docData.projectName || "Unknown"}`, heading: HeadingLevel.HEADING_2 }),
            new Paragraph({ text: "" }),
            
            new Paragraph({ text: "1. Introduction", heading: HeadingLevel.HEADING_2 }),
            new Paragraph({ text: srs.purpose || "" }),
            new Paragraph({ text: srs.scope || "" }),
            new Paragraph({ text: "" }),

            new Paragraph({ text: "2. Architecture & Workflow", heading: HeadingLevel.HEADING_2 }),
            new Paragraph({ text: "Architecture: " + (srs.architecture || docData.architecture?.description || "") }),
            new Paragraph({ text: "Workflow: " + (srs.workflow || docData.workflow?.description || "") }),
            new Paragraph({ text: "" }),

            new Paragraph({ text: "3. Requirements", heading: HeadingLevel.HEADING_2 }),
            ...(srs.functionalRequirements||[]).map((f:any) => new Paragraph({ text: `• [${f.priority}] ${f.feature} (${f.module})`, bullet: { level: 0 } })),
            new Paragraph({ text: "" }),

            new Paragraph({ text: "4. Non-Functional", heading: HeadingLevel.HEADING_2 }),
            ...(srs.nonFunctionalRequirements||[]).map((n:any) => new Paragraph({ text: `• [${n.category}] ${n.requirement}`, bullet: { level: 0 } })),
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
      const opt = { margin: 0.5, filename: `SRS_${(docData.projectName||"Project").replace(/\s+/g, "_")}.pdf`, image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2 }, jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' } };
      await h2p().from(el).set(opt).save();
      toast.success("PDF Downloaded!");
    } catch (e) {
      toast.error("Failed to generate PDF");
    }
  };

  return (
    <div className="flex h-full flex-col space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Presentation className="h-6 w-6 text-primary" />
            AI Document Studio
          </h1>
          <p className="text-sm text-slate-500 mt-1">Clean, simple Canva-style presentations and minimal SRS documents.</p>
        </div>

        <div className="flex items-center gap-3">
          <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.docx,.txt" onChange={handleFileUpload} />
          <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors">
            <Upload className="h-4 w-4" /> Upload File
          </button>
          
          <div className="relative">
            <button onClick={() => setShowPicker(!showPicker)} className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-slate-800 min-w-[200px] justify-between">
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
          
          <button onClick={handleGenerateFromProject} disabled={isGenerating} className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-indigo-700 transition-colors disabled:opacity-50">
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
             <button onClick={downloadPPT} className="flex items-center gap-2 rounded-lg bg-orange-50 text-orange-600 px-3 py-1.5 text-xs font-bold hover:bg-orange-100 shadow-sm border border-orange-200">
               <Download className="h-3.5 w-3.5" /> Download PPTX
             </button>
             <button onClick={downloadDOCX} className="flex items-center gap-2 rounded-lg bg-blue-50 text-blue-600 px-3 py-1.5 text-xs font-bold hover:bg-blue-100 shadow-sm border border-blue-200">
               <Download className="h-3.5 w-3.5" /> Download DOCX
             </button>
             <button onClick={downloadPDF} className="flex items-center gap-2 rounded-lg bg-emerald-50 text-emerald-600 px-3 py-1.5 text-xs font-bold hover:bg-emerald-100 shadow-sm border border-emerald-200">
               <Download className="h-3.5 w-3.5" /> Download PDF
             </button>
          </div>
        </div>
      )}

      <div className="flex-1 bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden relative flex">
        {!docData && !isGenerating && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
            <div className="h-20 w-20 rounded-full bg-slate-200 flex items-center justify-center mb-4">
               <FileText className="h-10 w-10 text-slate-400" />
            </div>
            <p className="font-medium text-slate-600">No Document Generated</p>
            <p className="text-sm mt-1">Select a project or upload a file to begin.</p>
          </div>
        )}
        
        {isGenerating && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm z-10">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="font-semibold text-slate-800">Synthesizing Context...</p>
          </div>
        )}

        {docData && activeTab === "PPT" && (
          <>
            {/* Sidebar with Thumbnails */}
            <div className="w-64 bg-slate-200 border-r border-slate-300 overflow-y-auto p-4 space-y-4">
               {slides.map((slide, idx) => (
                 <div key={idx} onClick={() => setActiveSlideIdx(idx)} 
                      className={`flex flex-col cursor-pointer transition-all ${activeSlideIdx === idx ? 'ring-2 ring-orange-500 rounded-lg shadow-md bg-white' : 'opacity-80 hover:opacity-100 hover:bg-white/50 rounded-lg p-1'}`}>
                   <div className="text-xs font-bold text-slate-500 mb-1 pl-1">{idx + 1} {slide.title}</div>
                   <div className={`w-full aspect-video rounded border overflow-hidden flex items-center justify-center ${idx === 0 ? 'bg-slate-900' : 'bg-white'}`}>
                     {idx === 0 && <span className="text-[10px] text-white font-bold px-2 truncate">{docData.projectName}</span>}
                     {idx > 0 && (
                       <div className="w-full h-full flex flex-col">
                         <div className="h-2 bg-indigo-600 w-full" />
                         <span className="text-[10px] font-bold text-slate-700 m-2 truncate">{slide.title}</span>
                       </div>
                     )}
                   </div>
                 </div>
               ))}
            </div>

            {/* Main Presentation Preview */}
            <div className="flex-1 bg-slate-100 p-8 flex items-center justify-center relative overflow-hidden">
               <div className="w-full max-w-4xl aspect-video rounded-xl shadow-2xl overflow-hidden bg-white relative flex flex-col">
                  {/* Cover Slide */}
                  {activeSlideIdx === 0 && (
                    <div className="w-full h-full bg-slate-900 flex flex-col justify-center items-center text-center p-12 relative border-l-[12px] border-indigo-600">
                      <h1 className="text-6xl font-black text-white mb-6 tracking-tight">{docData.projectName}</h1>
                      <p className="text-xl text-slate-300 max-w-2xl font-medium leading-relaxed">{docData.summary}</p>
                      <div className="absolute bottom-8 text-indigo-400 font-bold text-sm">Generated by AI Document Studio</div>
                    </div>
                  )}

                  {/* Other Slides Template */}
                  {activeSlideIdx > 0 && (
                    <div className="w-full h-full flex flex-col">
                      <div className="h-14 bg-indigo-600 w-full flex items-center px-8 shadow-sm z-10">
                        <h2 className="text-2xl font-bold text-white">{slides[activeSlideIdx]?.title}</h2>
                      </div>
                      <div className="flex-1 p-8 text-slate-800 bg-white">
                        
                        {/* 2. Problem */}
                        {activeSlideIdx === 1 && (
                          <div className="space-y-6">
                            <p className="text-xl text-slate-600 mb-8">{docData.problem?.statement}</p>
                            <h3 className="text-lg font-bold text-slate-800">Key Pain Points:</h3>
                            <ul className="list-disc pl-6 space-y-3">
                              {docData.problem?.painPoints?.map((p:string, i:number) => <li key={i} className="text-lg text-slate-600">{p}</li>)}
                            </ul>
                          </div>
                        )}

                        {/* 3. Solution */}
                        {activeSlideIdx === 2 && (
                          <div className="space-y-6">
                            <p className="text-xl text-slate-600 mb-8">{docData.solution?.overview}</p>
                            <h3 className="text-lg font-bold text-slate-800">Innovations:</h3>
                            <ul className="list-disc pl-6 space-y-3">
                              {docData.solution?.innovationPoints?.map((p:string, i:number) => <li key={i} className="text-lg text-slate-600">{p}</li>)}
                            </ul>
                          </div>
                        )}

                        {/* 4. Features & Stack */}
                        {activeSlideIdx === 3 && (
                          <div className="flex gap-8 h-full">
                            <div className="flex-1 bg-slate-50 p-6 rounded-xl border border-slate-200">
                              <h3 className="text-xl font-bold text-indigo-600 mb-4 border-b pb-2">Core Features</h3>
                              <ul className="list-disc pl-5 space-y-3">
                                {docData.solution?.keyFeatures?.map((f:string, i:number) => <li key={i} className="text-slate-700 font-medium">{f}</li>)}
                              </ul>
                            </div>
                            <div className="flex-1 bg-slate-50 p-6 rounded-xl border border-slate-200">
                              <h3 className="text-xl font-bold text-indigo-600 mb-4 border-b pb-2">Tech Stack</h3>
                              <div className="space-y-4">
                                <div><strong className="text-slate-800 block mb-1">Frontend</strong><span className="text-slate-600">{docData.techStack?.frontend?.join(", ")}</span></div>
                                <div><strong className="text-slate-800 block mb-1">Backend</strong><span className="text-slate-600">{docData.techStack?.backend?.join(", ")}</span></div>
                                <div><strong className="text-slate-800 block mb-1">Database</strong><span className="text-slate-600">{docData.techStack?.database?.join(", ")}</span></div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 5. Architecture */}
                        <div className={`h-full w-full ${activeSlideIdx === 4 ? 'block' : 'hidden'}`}>
                           <div className="text-slate-600 mb-4 font-medium">{docData.architecture?.description}</div>
                           <div id="arch-svg-container" className="h-[75%] w-full bg-slate-50 border rounded-lg p-2">
                             {docData.architecture?.mermaid && <MermaidDiagram chart={docData.architecture.mermaid} id="arch-diagram" />}
                           </div>
                        </div>

                        {/* 6. Workflow */}
                        <div className={`h-full w-full ${activeSlideIdx === 5 ? 'block' : 'hidden'}`}>
                           <div className="text-slate-600 mb-4 font-medium">{docData.workflow?.description}</div>
                           <div id="wf-svg-container" className="h-[75%] w-full bg-slate-50 border rounded-lg p-2">
                             {docData.workflow?.mermaid && <MermaidDiagram chart={docData.workflow.mermaid} id="wf-diagram" />}
                           </div>
                        </div>

                        {/* 7. Conclusion */}
                        {activeSlideIdx === 6 && (
                          <div className="flex flex-col items-center justify-center h-full text-center space-y-8">
                            <div className="p-8 bg-indigo-50 rounded-2xl border border-indigo-100 max-w-2xl">
                               <h3 className="text-2xl font-bold text-indigo-700 mb-4">Expected Impact</h3>
                               <p className="text-xl text-slate-700 leading-relaxed font-medium">{docData.results?.impact}</p>
                            </div>
                          </div>
                        )}

                      </div>
                    </div>
                  )}
               </div>
            </div>
          </>
        )}

        {docData && activeTab === "SRS" && (
          <div className="absolute inset-0 overflow-y-auto p-8 flex justify-center bg-slate-200">
            <div id="srs-document-container" className="w-full max-w-3xl bg-white shadow-xl p-12 text-slate-900 pb-24">
               {/* Cover Page */}
               <div className="border-b-2 border-slate-900 mb-8 pb-6">
                 <h1 className="text-3xl font-black text-slate-900 mb-2">Software Requirement Specification</h1>
                 <h2 className="text-xl text-slate-600 font-medium">Project: {docData.projectName}</h2>
                 <p className="text-sm text-slate-500 mt-4">Version: {docData.srs?.version} | Date: {new Date().toLocaleDateString()}</p>
               </div>

               {/* Intro */}
               <div className="space-y-4 mb-8">
                 <h3 className="text-xl font-bold text-slate-800">1. Purpose & Scope</h3>
                 <p className="text-slate-700">{docData.srs?.purpose}</p>
                 <p className="text-slate-700">{docData.srs?.scope}</p>
               </div>

               <div className="space-y-4 mb-8">
                 <h3 className="text-xl font-bold text-slate-800">2. Architecture & Workflow</h3>
                 <p className="text-slate-700"><strong>Architecture:</strong> {docData.architecture?.description}</p>
                 <p className="text-slate-700"><strong>Workflow:</strong> {docData.workflow?.description}</p>
               </div>

               {/* Requirements */}
               <div className="space-y-4 mb-8">
                 <h3 className="text-xl font-bold text-slate-800">3. Functional Requirements</h3>
                 <ul className="list-disc pl-5 space-y-2">
                   {docData.srs?.functionalRequirements?.map((r:any, i:number)=>(
                     <li key={i} className="text-slate-700"><strong>[{r.priority}]</strong> {r.feature} ({r.module})</li>
                   ))}
                 </ul>
               </div>
               
               <div className="space-y-4 mb-8">
                 <h3 className="text-xl font-bold text-slate-800">4. Non-Functional Requirements</h3>
                 <ul className="list-disc pl-5 space-y-2">
                   {docData.srs?.nonFunctionalRequirements?.map((r:any, i:number)=>(
                     <li key={i} className="text-slate-700"><strong>[{r.category}]</strong> {r.requirement}</li>
                   ))}
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
print("Reverted app.docs.tsx to the original working UI design with added Architecture & Workflow.")
