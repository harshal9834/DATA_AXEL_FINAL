const fs = require('fs');

const componentCode = `

function ProjectAnalysisView({ analysis }: { analysis: any }) {
  if (!analysis || typeof analysis !== 'object') return null;
  
  return (
    <div className="space-y-6 mt-8">
      <h2 className="text-3xl font-extrabold text-white mb-8 flex items-center gap-3">
        <Sparkles className="h-8 w-8 text-fuchsia-500" /> Complete AI Project Analysis
      </h2>
      
      {/* 1. Executive Summary */}
      {analysis.executiveSummary && (
        <AnalysisCard title="Executive Summary" icon={FileText} defaultOpen>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-black/40 p-4 rounded-xl border border-white/5">
              <div className="text-xs text-slate-400 font-bold mb-1">Project Name</div>
              <div className="text-lg text-white font-bold">{analysis.executiveSummary.projectName}</div>
            </div>
            <div className="bg-black/40 p-4 rounded-xl border border-white/5">
              <div className="text-xs text-slate-400 font-bold mb-1">Target Audience</div>
              <div className="text-lg text-white font-bold">{analysis.executiveSummary.targetAudience}</div>
            </div>
          </div>
          <div className="mt-4 bg-black/40 p-4 rounded-xl border border-white/5">
            <div className="text-xs text-slate-400 font-bold mb-2">Problem Statement</div>
            <p className="text-sm text-slate-300">{analysis.executiveSummary.problemStatement}</p>
          </div>
          <div className="mt-4 bg-black/40 p-4 rounded-xl border border-white/5">
            <div className="text-xs text-slate-400 font-bold mb-2">Solution Overview</div>
            <p className="text-sm text-slate-300">{analysis.executiveSummary.solutionOverview}</p>
          </div>
        </AnalysisCard>
      )}

      {/* 3. Innovation Score */}
      {analysis.innovationAnalysis && (
        <AnalysisCard title="Innovation Analysis" icon={Lightbulb}>
          <div className="flex flex-col md:flex-row gap-6 items-center mb-6">
            <div className="w-48 h-48 relative flex items-center justify-center shrink-0">
               <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                 <circle cx="96" cy="96" r="80" stroke="rgba(255,255,255,0.1)" strokeWidth="12" fill="none" />
                 <circle cx="96" cy="96" r="80" stroke="#d946ef" strokeWidth="12" fill="none" strokeDasharray="502" strokeDashoffset={502 - (502 * analysis.innovationAnalysis.innovationScore) / 100} className="transition-all duration-1000" />
               </svg>
               <div className="text-center">
                 <div className="text-4xl font-black text-white">{analysis.innovationAnalysis.innovationScore}</div>
                 <div className="text-xs font-bold text-fuchsia-400 uppercase tracking-widest mt-1">Score</div>
               </div>
            </div>
            <div className="flex-1 w-full space-y-4">
              <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                <div className="text-xs text-slate-400 font-bold mb-2">Originality</div>
                <p className="text-sm text-slate-300">{analysis.innovationAnalysis.originality}</p>
              </div>
              <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                <div className="text-xs text-slate-400 font-bold mb-2">Market Gap</div>
                <p className="text-sm text-slate-300">{analysis.innovationAnalysis.marketGap}</p>
              </div>
            </div>
          </div>
        </AnalysisCard>
      )}

      {/* 5. Tech Stack */}
      {analysis.technologyStack && (
        <AnalysisCard title="Technology Stack" icon={Layers}>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             {Object.entries(analysis.technologyStack).map(([key, val]) => (
               <div key={key} className="bg-black/40 p-4 rounded-xl border border-white/5 text-center">
                 <div className="text-[10px] uppercase text-emerald-400 font-bold mb-2">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                 <div className="text-sm text-white font-bold">{val as string}</div>
               </div>
             ))}
           </div>
        </AnalysisCard>
      )}

      {/* All Other Raw JSON Sections for now to save space */}
      <AnalysisCard title="Detailed Reports (JSON Dump)" icon={Database}>
         <pre className="text-[10px] text-slate-400 font-mono whitespace-pre-wrap">
           {JSON.stringify(analysis, null, 2)}
         </pre>
      </AnalysisCard>

      {/* 18. Final Recommendation */}
      {analysis.finalRecommendation && (
        <AnalysisCard title="Final AI Recommendation" icon={Trophy} defaultOpen>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard label="Hackathon Score" value={String(analysis.finalRecommendation.hackathonScore)} color="emerald" />
            <StatCard label="Overall Rating" value={analysis.finalRecommendation.overallRating} color="fuchsia" />
            <StatCard label="Scalability" value={analysis.finalRecommendation.scalability} color="blue" />
            <StatCard label="Prod Ready" value={analysis.finalRecommendation.productionReadiness} color="emerald" />
          </div>
          <div className="bg-black/40 p-4 rounded-xl border border-white/5">
            <div className="text-xs text-slate-400 font-bold mb-2">Commercial Viability</div>
            <p className="text-sm text-slate-300">{analysis.finalRecommendation.commercialViability}</p>
          </div>
        </AnalysisCard>
      )}
    </div>
  );
}

function AnalysisCard({ title, icon: Icon, children, defaultOpen = false }: any) {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <div className="rounded-2xl border border-slate-800 bg-[#0a0a0a] overflow-hidden shadow-xl">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-5 text-left hover:bg-white/5 transition">
        <div className="flex items-center gap-3">
           <div className="p-2 bg-white/5 rounded-lg border border-white/10">
             <Icon className="h-5 w-5 text-slate-300" />
           </div>
           <span className="text-lg font-bold text-white">{title}</span>
        </div>
        <ChevronDown className={\`h-5 w-5 text-slate-500 transition-transform \${open ? 'rotate-180' : ''}\`} />
      </button>
      {open && (
        <div className="p-5 border-t border-slate-800 bg-black/20">
           {children}
        </div>
      )}
    </div>
  );
}
`;

let content = fs.readFileSync('frontend/src/routes/app.workflow.$workflowId.tsx', 'utf8');
content = content.replace('import { useState, useEffect } from "react";', 'import React, { useState, useEffect } from "react";');
content = content.replace('Trophy, Rocket,', 'Trophy, Rocket, Layers, ChevronDown, Download, Database, CheckCircle2, Layout, Beaker, Archive,');

content = content.replace('  { id: "Testing & Validation", label: "Testing", icon: Beaker, color: "from-amber-500 to-orange-500" },', '  { id: "Project Analysis", label: "Analysis", icon: BarChart3, color: "from-amber-500 to-orange-500" },');

const analysisReplacement = `
                  <ProjectAnalysisView analysis={analysis} />

                  <div className="p-8 rounded-3xl bg-black/40 border border-white/10 mt-6">
                    <h2 className="text-lg font-bold text-white mb-4 text-center">Project Assets Generated Successfully</h2>
                    <div className="flex flex-wrap justify-center gap-3">
                       <DownloadButton label="Backend.zip" type="backend" />
                       <DownloadButton label="Frontend.zip" type="frontend" />
                       <DownloadButton label="Documentation.zip" type="docs" />
                       <DownloadButton label="Database.sql" type="database" />
                       <DownloadButton label="Analysis.pdf" type="analysis-pdf" />
                       <DownloadButton label="Complete Project.zip" type="project" primary />
                    </div>
                  </div>
`;

content = content.replace(/<div className="p-8 rounded-3xl bg-gradient-to-br from-indigo-900\/40 to-fuchsia-900\/40 border border-indigo-500\/30 backdrop-blur-xl">[\s\S]*?<DownloadButton label="Complete Project\.zip" type="project" primary \/>\s*<\/div>\s*<\/div>/, analysisReplacement);

content += '\n' + componentCode;

fs.writeFileSync('frontend/src/routes/app.workflow.$workflowId.tsx', content);
