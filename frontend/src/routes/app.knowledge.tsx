import { createFileRoute } from "@tanstack/react-router";
import React, { useState, useEffect } from "react";
import { PageHeader } from "../components/app-shell";
import { KnowledgeGraph } from "../components/knowledge/KnowledgeGraph";
import { InsightsPanel } from "../components/knowledge/InsightsPanel";
import { IQDashboard } from "../components/knowledge/IQDashboard";
import { KnowledgeTimeline } from "../components/knowledge/KnowledgeTimeline";
import { SearchBar } from "../components/knowledge/SearchBar";
import { API_BASE } from "../lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/app/knowledge")({
  head: () => ({
    meta: [
      { title: "Knowledge Intelligence Engine — DATA_AXEL" },
      { name: "description", content: "AI-powered knowledge intelligence engine." },
    ],
  }),
  component: KnowledgeIntelligence,
});

function KnowledgeIntelligence() {
  const [loadingGraph, setLoadingGraph] = useState(true);
  const [loadingIQ, setLoadingIQ] = useState(true);
  const [graphData, setGraphData] = useState<any>(null);
  const [iqData, setIqData] = useState<any>(null);
  
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [nodeInsight, setNodeInsight] = useState<any>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);

  // In a real app, this would come from a selected project context
  const mockWorkflowId = "cm0n3abcd000008l4f4h8i9j0"; // Example ID, backend handles 404s or we just pass a string

  useEffect(() => {
    fetchGraph();
    fetchIQ();
  }, []);

  const fetchGraph = async () => {
    try {
      const res = await fetch(`${API_BASE}/knowledge/${mockWorkflowId}/graph`);
      const data = await res.json();
      if (data.success) {
        setGraphData(data.graph);
      } else {
        // Fallback for demonstration if no DB record
        setGraphData(generateMockGraph());
      }
    } catch (e) {
      setGraphData(generateMockGraph());
    } finally {
      setLoadingGraph(false);
    }
  };

  const fetchIQ = async () => {
    try {
      const res = await fetch(`${API_BASE}/knowledge/${mockWorkflowId}/iq`);
      const data = await res.json();
      if (data.success) setIqData(data.iq);
      else setIqData(generateMockIQ());
    } catch (e) {
      setIqData(generateMockIQ());
    } finally {
      setLoadingIQ(false);
    }
  };

  const handleNodeClick = async (node: any) => {
    setSelectedNode(node);
    setLoadingInsight(true);
    setNodeInsight(null);
    try {
      const res = await fetch(`${API_BASE}/knowledge/${mockWorkflowId}/insight`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodeName: node.name })
      });
      const data = await res.json();
      if (data.success) setNodeInsight(data.insight);
      else setNodeInsight(generateMockInsight(node));
    } catch (e) {
      setNodeInsight(generateMockInsight(node));
    } finally {
      setLoadingInsight(false);
    }
  };

  const handleSearch = async (query: string) => {
    const res = await fetch(`${API_BASE}/knowledge/${mockWorkflowId}/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
    const data = await res.json();
    if (!data.success) throw new Error("Search failed");
    return data.answer;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <PageHeader 
        title="Knowledge Intelligence Engine" 
        subtitle="The AI Brain of DATA_AXEL. Understands relationships, detects gaps, and predicts impacts." 
      />

      <div className="flex-1 overflow-y-auto pb-10">
        <IQDashboard iqData={iqData} loading={loadingIQ} />
        
        <SearchBar onSearch={handleSearch} loading={false} />

        <div className="relative w-full h-[600px] rounded-xl overflow-hidden border border-border/50 shadow-2xl">
          {loadingGraph ? (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              <KnowledgeGraph 
                data={graphData} 
                onNodeClick={handleNodeClick} 
                selectedNode={selectedNode} 
              />
              {selectedNode && (
                <InsightsPanel 
                  node={selectedNode} 
                  insight={nodeInsight} 
                  loading={loadingInsight}
                  onClose={() => setSelectedNode(null)} 
                />
              )}
            </>
          )}
        </div>

        <KnowledgeTimeline />
      </div>
    </div>
  );
}

// Fallback Mock Data generation in case DB is empty for the demo
function generateMockGraph() {
  return {
    nodes: [
      { id: "1", name: "Food Waste AI", category: "Root", confidence: 100, color: "#2563eb" },
      { id: "2", name: "Transformer Forecasting", category: "Research", confidence: 95, color: "#7c3aed" },
      { id: "3", name: "LangGraph", category: "Technology", confidence: 88, color: "#06b6d4" },
      { id: "4", name: "OpenFoodFacts", category: "Datasets", confidence: 92, color: "#10b981" },
      { id: "5", name: "route-optimizer", category: "GitHub", confidence: 85, color: "#f59e0b" },
      { id: "6", name: "Google Maps", category: "APIs", confidence: 99, color: "#ef4444" },
      { id: "7", name: "Redis Streams", category: "Technology", confidence: 91, color: "#06b6d4" },
      { id: "8", name: "KDD 2024 Paper", category: "Papers", confidence: 89, color: "#8b5cf6" },
      { id: "9", name: "Surplus Matcher", category: "Core Concept", confidence: 94, color: "#ec4899" },
    ],
    links: [
      { source: "1", target: "9", label: "Core Feature" },
      { source: "9", target: "2", label: "Uses" },
      { source: "9", target: "5", label: "Similar To" },
      { source: "2", target: "8", label: "Based On" },
      { source: "9", target: "3", label: "Orchestrated By" },
      { source: "5", target: "6", label: "Depends On" },
      { source: "9", target: "4", label: "Trained On" },
      { source: "3", target: "7", label: "Recommended With" },
    ]
  };
}

function generateMockIQ() {
  return {
    overallIQ: 87,
    coverage: 92,
    researchQuality: 88,
    innovation: 95,
    technicalReadiness: 70,
    architectureReadiness: 65,
    documentationProgress: 40
  };
}

function generateMockInsight(node: any) {
  return {
    summary: [
      `Highly relevant ${node.category} for the project goals.`,
      `Shows strong potential for scalability.`
    ],
    recommendation: `Integrate ${node.name} early in the development lifecycle to mitigate architectural risks.`,
    confidence: node.confidence || 85,
    metrics: [
      { label: "Relevance", value: "High" },
      { label: "Complexity", value: "Medium" }
    ]
  };
}
