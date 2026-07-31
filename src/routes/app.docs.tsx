import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Monitor, Download, Upload, Loader2, ChevronDown, Sparkles, FileText } from "lucide-react";
import { toast } from "sonner";
import { projects as demoProjects } from "../lib/demo-data";
import mermaid from "mermaid";

const BACKEND_URL = "http://localhost:3001";

export const Route = createFileRoute("/app/docs")({
  head: () => ({
    meta: [
      { title: "AI Document Studio — DATA_AXEL" },
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
  return <div id={id} className="mermaid-container flex justify-center items-center w-full overflow-hidden" />;
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
      
      const themeColor = "4F46E5";
      const bgDark = "0F172A";
      
      const addHeader = (slide: any, title: string) => {
         slide.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: "100%", h: 1.0, fill: { color: themeColor } });
         slide.addText(title, { x: 0.5, y: 0.1, w: "90%", h: 0.8, fontSize: 28, color: "FFFFFF", bold: true });
      };

      // 1. Cover
      let s = pres.addSlide();
      s.background = { fill: bgDark };
      s.addText(docData.projectName || "Food Waste AI", { x: 1, y: 2, w: 8, fontSize: 48, color: "FFFFFF", bold: true, align: "center" });
      s.addText(docData.summary || "The food-waste-ai project aims to reduce food waste...", { x: 1, y: 3.5, w: 8, fontSize: 20, color: "94A3B8", align: "center" });
      s.addText("Generated by AI Document Studio", { x: 1, y: 5.5, w: 8, fontSize: 16, color: themeColor, bold: true, align: "center" });

      // 2. Problem
      s = pres.addSlide();
      addHeader(s, "The Problem");
      s.addText(docData.problem?.statement || "", { x: 0.5, y: 1.5, w: 9, fontSize: 18, color: "333333" });
      docData.problem?.painPoints?.forEach((pt: string, i: number) => {
        s.addText("• " + pt, { x: 0.8, y: 2.8 + (i * 0.6), w: 8.5, fontSize: 16, color: "555555" });
      });

      // 3. Solution
      s = pres.addSlide();
      addHeader(s, "The Solution");
      s.addText(docData.solution?.overview || "", { x: 0.5, y: 1.5, w: 9, fontSize: 18, color: "333333" });
      docData.solution?.keyFeatures?.forEach((f: string, i: number) => {
        const x = i % 2 === 0 ? 0.5 : 5.2;
        const y = 3.0 + Math.floor(i / 2) * 1.2;
        s.addShape(pres.ShapeType.roundRect, { x, y, w: 4.3, h: 0.9, fill: { color: "FFFFFF" }, line: { color: themeColor, width: 1.5 } });
        s.addText(f, { x: x + 0.2, y: y + 0.1, w: 3.9, h: 0.7, fontSize: 14, color: "333333", align: "center" });
      });

      // 4. Technology Stack
      s = pres.addSlide();
      addHeader(s, "Technology Stack");
      const cats = [
        { name: "Frontend", val: docData.techStack?.frontend?.join("\n• ") },
        { name: "Backend", val: docData.techStack?.backend?.join("\n• ") },
        { name: "Database", val: docData.techStack?.database?.join("\n• ") }
      ];
      cats.forEach((c, i) => {
        const x = 0.5 + (i * 3.1);
        s.addText(c.name, { x, y: 1.5, w: 2.8, fontSize: 20, bold: true, color: themeColor });
        s.addText("• " + (c.val || ""), { x, y: 2.2, w: 2.8, fontSize: 16, color: "555555" });
      });

      // 5. System Workflow
      s = pres.addSlide();
      addHeader(s, "System Workflow");
      const steps = ["Upload/Select", "AI Analysis", "Research & Innovation", "Export Documents"];
      steps.forEach((step, i) => {
        s.addShape(pres.ShapeType.rightArrow, { x: 0.5 + (i * 2.3), y: 2.5, w: 2.1, h: 1.2, fill: { color: "FFFFFF" }, line: { color: themeColor, width: 1.5 } });
        s.addText(step, { x: 0.5 + (i * 2.3), y: 2.5, w: 1.8, h: 1.2, fontSize: 14, color: themeColor, bold: true, align: "center" });
      });

      // 6. Architecture
      s = pres.addSlide();
      addHeader(s, "Architecture");
      s.addText(docData.architecture?.description || "", { x: 0.5, y: 1.5, w: 9, fontSize: 18, color: "333333" });
      s.addText("See web view for detailed Mermaid diagram.", { x: 0.5, y: 3.5, w: 9, fontSize: 16, color: "94A3B8", align: "center", italic: true });

      // 7. Conclusion
      s = pres.addSlide();
      addHeader(s, "Conclusion");
      s.addText(docData.results?.impact || "The project delivers significant innovation.", { x: 0.5, y: 2.5, w: 9, fontSize: 24, align: "center", color: themeColor, bold: true });

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
      const { Document, Packer, Paragraph, HeadingLevel } = await import("docx");
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
    <div className="flex h-full flex-col space-y-6 bg-[#f8fafc]">
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-6 pt-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Monitor className="h-6 w-6 text-blue-600" />
            AI Document Studio
          </h1>
          <p className="text-sm text-slate-500 mt-1">Generate professional presentations and SRS documents instantly.</p>
        </div>

        <div className="flex items-center gap-3">
          <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.docx,.txt" onChange={handleFileUpload} />
          <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors">
            <Upload className="h-4 w-4" /> Upload File
          </button>
          
          <div className="relative">
            <button onClick={() => setShowPicker(!showPicker)} className="flex items-center gap-2 rounded-full bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-600 transition-colors min-w-[220px] justify-between">
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
          
          <button onClick={handleGenerateFromProject} disabled={isGenerating} className="flex items-center gap-2 rounded-full bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 transition-colors disabled:opacity-50">
            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Generate
          </button>
        </div>
      </div>

      {/* Tabs & Exports */}
      <div className="flex flex-col md:flex-row items-center justify-between border-b border-slate-200 pb-0 px-6">
        <div className="flex items-center gap-6 h-full">
          <button onClick={() => setActiveTab("PPT")} className={`px-2 py-3 text-sm font-bold border-b-[3px] transition-colors ${activeTab === "PPT" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800"}`}>
            Presentation View
          </button>
          <button onClick={() => setActiveTab("SRS")} className={`px-2 py-3 text-sm font-bold border-b-[3px] transition-colors ${activeTab === "SRS" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800"}`}>
            Document View
          </button>
        </div>
        
        {docData && (
          <div className="flex gap-3 pb-2">
             <button onClick={downloadPPT} className="flex items-center gap-2 rounded-full bg-orange-50/80 text-orange-600 px-4 py-1.5 text-xs font-bold hover:bg-orange-100 shadow-sm border border-orange-100 transition-colors">
               <Download className="h-3.5 w-3.5" /> Download PPTX
             </button>
             <button onClick={downloadDOCX} className="flex items-center gap-2 rounded-full bg-blue-50/80 text-blue-600 px-4 py-1.5 text-xs font-bold hover:bg-blue-100 shadow-sm border border-blue-100 transition-colors">
               <Download className="h-3.5 w-3.5" /> Download DOCX
             </button>
             <button onClick={downloadPDF} className="flex items-center gap-2 rounded-full bg-emerald-50/80 text-emerald-600 px-4 py-1.5 text-xs font-bold hover:bg-emerald-100 shadow-sm border border-emerald-100 transition-colors">
               <Download className="h-3.5 w-3.5" /> Download PDF
             </button>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto relative px-6 pb-6 pt-4">
        {!docData && !isGenerating && (
          <div className="h-full w-full flex flex-col items-center justify-center text-slate-400 min-h-[400px]">
            <div className="h-16 w-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-4">
               <FileText className="h-8 w-8 text-slate-300" />
            </div>
            <p className="font-medium text-slate-600">Ready to Generate</p>
            <p className="text-sm mt-1">Select a project or upload a file to begin building documentation.</p>
          </div>
        )}
        
        {isGenerating && (
          <div className="h-full w-full flex flex-col items-center justify-center min-h-[400px]">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
            <p className="font-semibold text-slate-800">Synthesizing Context...</p>
            <p className="text-sm text-slate-500 mt-1">Applying AI analysis to build documents.</p>
          </div>
        )}

        {docData && activeTab === "PPT" && (
          <div className="max-w-4xl mx-auto space-y-12 pb-20">
            {/* Cover Card */}
            <div className="w-full bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100">
               <div className="p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
                 <h1 className="text-4xl font-black text-slate-900 mb-4">{docData.projectName}</h1>
                 <p className="text-lg text-slate-600 max-w-2xl">{docData.summary}</p>
                 <div className="mt-8 text-blue-600 font-bold text-sm">Generated by AI Document Studio</div>
               </div>
            </div>

            {/* Problem Card */}
            <div className="w-full bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100">
               <div className="bg-blue-50 px-8 py-5">
                 <h2 className="text-xl font-bold text-blue-900 tracking-wide uppercase">THE PROBLEM</h2>
               </div>
               <div className="p-8">
                 <p className="text-lg text-slate-700 leading-relaxed mb-6">{docData.problem?.statement}</p>
                 <div className="space-y-4">
                   {docData.problem?.painPoints?.map((p:string, i:number) => (
                     <div key={i} className="flex items-center gap-4 bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
                        <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">{i+1}</div>
                        <span className="text-slate-700 font-medium">{p}</span>
                     </div>
                   ))}
                 </div>
               </div>
            </div>

            {/* Solution Card - MATCHING SCREENSHOT EXACTLY */}
            <div className="w-full bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100">
               <div className="bg-[#f0fdf4] px-8 py-5">
                 <h2 className="text-xl font-bold text-[#14532d] tracking-wide uppercase">THE SOLUTION</h2>
               </div>
               <div className="p-8">
                 <p className="text-lg text-slate-700 leading-relaxed mb-8">{docData.solution?.overview}</p>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {docData.solution?.keyFeatures?.map((f:string, i:number) => (
                     <div key={i} className="flex items-center gap-4 bg-white p-5 rounded-xl border border-[#dcfce7] shadow-sm">
                        <div className="h-8 w-8 rounded-full bg-[#dcfce7] text-[#166534] font-bold flex items-center justify-center shrink-0">{i+1}</div>
                        <span className="text-slate-800 font-bold text-sm">{f}</span>
                     </div>
                   ))}
                 </div>
               </div>
            </div>

            {/* Stack Card */}
            <div className="w-full bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100">
               <div className="bg-purple-50 px-8 py-5">
                 <h2 className="text-xl font-bold text-purple-900 tracking-wide uppercase">TECHNOLOGY STACK</h2>
               </div>
               <div className="p-8 space-y-4">
                  <div className="bg-white p-5 rounded-xl border border-purple-100 shadow-sm">
                    <strong className="text-purple-700 block mb-2 text-lg">Frontend</strong>
                    <span className="text-slate-700 font-medium">{docData.techStack?.frontend?.join(", ")}</span>
                  </div>
                  <div className="bg-white p-5 rounded-xl border border-purple-100 shadow-sm">
                    <strong className="text-purple-700 block mb-2 text-lg">Backend</strong>
                    <span className="text-slate-700 font-medium">{docData.techStack?.backend?.join(", ")}</span>
                  </div>
                  <div className="bg-white p-5 rounded-xl border border-purple-100 shadow-sm">
                    <strong className="text-purple-700 block mb-2 text-lg">Database & Infrastructure</strong>
                    <span className="text-slate-700 font-medium">{docData.techStack?.database?.join(", ")}</span>
                  </div>
               </div>
            </div>

            {/* Workflow Card */}
            <div className="w-full bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100">
               <div className="bg-amber-50 px-8 py-5">
                 <h2 className="text-xl font-bold text-amber-900 tracking-wide uppercase">SYSTEM WORKFLOW</h2>
               </div>
               <div className="p-8 flex flex-col items-center">
                 <p className="text-slate-700 w-full mb-6 text-lg">{docData.workflow?.description}</p>
                 <div className="w-full bg-slate-50 p-6 rounded-xl border border-slate-100 overflow-x-auto flex justify-center">
                   {docData.workflow?.mermaid && <MermaidDiagram chart={docData.workflow.mermaid} id="wf-diagram" />}
                 </div>
               </div>
            </div>

            {/* Architecture Card */}
            <div className="w-full bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100">
               <div className="bg-pink-50 px-8 py-5">
                 <h2 className="text-xl font-bold text-pink-900 tracking-wide uppercase">ARCHITECTURE</h2>
               </div>
               <div className="p-8 flex flex-col items-center">
                 <p className="text-slate-700 w-full mb-6 text-lg">{docData.architecture?.description}</p>
                 <div className="w-full bg-slate-50 p-6 rounded-xl border border-slate-100 overflow-x-auto flex justify-center">
                   {docData.architecture?.mermaid && <MermaidDiagram chart={docData.architecture.mermaid} id="arch-diagram" />}
                 </div>
               </div>
            </div>
            
          </div>
        )}

        {docData && activeTab === "SRS" && (
          <div className="max-w-4xl mx-auto flex justify-center pb-20">
            <div id="srs-document-container" className="w-full bg-white shadow-sm p-12 text-slate-900 rounded-2xl border border-slate-100">
               <div className="border-b-2 border-slate-900 mb-8 pb-6">
                 <h1 className="text-3xl font-black text-slate-900 mb-2">Software Requirement Specification</h1>
                 <h2 className="text-xl text-slate-600 font-medium">Project: {docData.projectName}</h2>
                 <p className="text-sm text-slate-500 mt-4">Version: {docData.srs?.version} | Date: {new Date().toLocaleDateString()}</p>
               </div>

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
