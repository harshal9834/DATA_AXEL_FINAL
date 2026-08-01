import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

export function KnowledgeGraph({ data, onNodeClick, selectedNode }: { data: any, onNodeClick: (n: any) => void, selectedNode: any }) {
  const [windowSize, setWindowSize] = useState({ w: 800, h: 500 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const handleResize = () => setWindowSize({ w: window.innerWidth > 1024 ? 800 : window.innerWidth - 100, h: 500 });
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const cx = windowSize.w / 2;
  const cy = windowSize.h / 2;

  const nodes = data?.nodes || [];
  const links = data?.links || [];

  const rootNode = nodes.find((n: any) => n.category === "Root") || nodes[0];
  const otherNodes = nodes.filter((n: any) => n.id !== rootNode?.id);

  const positionedNodes = [
    ...(rootNode ? [{ ...rootNode, x: cx, y: cy }] : []),
    ...otherNodes.map((n: any, i: number) => {
      const r = n.category === "Core Concept" ? 120 : (180 + (i % 3) * 50);
      const angle = (i / otherNodes.length) * Math.PI * 2;
      return {
        ...n,
        x: cx + Math.cos(angle) * r,
        y: cy + Math.sin(angle) * r,
      };
    })
  ];

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((z) => Math.min(Math.max(0.3, z - e.deltaY * 0.001), 3));
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragging) {
      setPan((p) => ({ x: p.x + e.movementX, y: p.y + e.movementY }));
    }
  };

  return (
    <div 
      className="card-premium relative overflow-hidden h-full min-h-[600px] cursor-grab active:cursor-grabbing w-full"
      onPointerDown={() => setIsDragging(true)}
      onPointerUp={() => setIsDragging(false)}
      onPointerLeave={() => setIsDragging(false)}
      onPointerMove={handlePointerMove}
      onWheel={handleWheel}
      style={{ touchAction: 'none' }}
    >
      <div className="pointer-events-none absolute inset-0 bg-glow" />
      <div className="absolute top-4 right-4 flex gap-2 z-10">
        <button onClick={() => setZoom(z => Math.min(3, z + 0.2))} className="rounded bg-black/40 p-2 text-white/70 hover:text-white backdrop-blur text-xs">+</button>
        <button onClick={() => setZoom(z => Math.max(0.3, z - 0.2))} className="rounded bg-black/40 p-2 text-white/70 hover:text-white backdrop-blur text-xs">-</button>
        <button onClick={() => { setZoom(1); setPan({x:0, y:0}); }} className="rounded bg-black/40 p-2 text-white/70 hover:text-white backdrop-blur text-xs px-3">Reset</button>
      </div>
      
      <svg width="100%" height="100%" className="relative">
        <defs>
          <radialGradient id="core" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#7c3aed" />
          </radialGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <motion.g 
          animate={{ x: pan.x, y: pan.y, scale: zoom }}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {links.map((link: any, i: number) => {
            const source = positionedNodes.find(n => n.id === link.source) || rootNode;
            const target = positionedNodes.find(n => n.id === link.target);
            if (!source || !target) return null;
            return (
              <g key={i}>
                <motion.line
                  x1={source.x} y1={source.y} x2={target.x} y2={target.y}
                  stroke={target.color || "#666"} strokeWidth={1} opacity={0.4}
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, delay: i * 0.05 }}
                />
                <motion.text
                  x={(source.x + target.x) / 2} y={(source.y + target.y) / 2 - 5}
                  textAnchor="middle" className="fill-muted-foreground text-[10px]"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
                >
                  {link.label}
                </motion.text>
              </g>
            );
          })}

          {positionedNodes.map((node: any, i: number) => (
            <motion.g 
              key={node.id} 
              onClick={(e) => { e.stopPropagation(); onNodeClick(node); }}
              className="cursor-pointer"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: selectedNode?.id === node.id ? 1.3 : 1, 
                opacity: selectedNode && selectedNode.id !== node.id ? 0.3 : 1 
              }}
              transition={{ type: "spring", delay: i * 0.03 }}
              whileHover={{ scale: 1.15 }}
            >
              <circle
                cx={node.x} cy={node.y}
                r={node.category === "Root" ? 45 : 30}
                fill={node.category === "Root" ? "url(#core)" : "rgba(15,15,25,0.9)"}
                stroke={node.color || "#555"}
                strokeWidth={selectedNode?.id === node.id ? 3 : 1.5}
                filter={selectedNode?.id === node.id ? "url(#glow)" : ""}
              />
              <text x={node.x} y={node.y + 4} textAnchor="middle" className="fill-foreground text-[10px] font-bold pointer-events-none">
                {node.name.substring(0, 15)}{node.name.length > 15 ? '...' : ''}
              </text>
              {node.confidence && (
                <text 
                  x={node.x} y={node.y + 18} textAnchor="middle" 
                  className="text-[8px] font-medium pointer-events-none"
                  fill={node.confidence > 90 ? "#10b981" : node.confidence > 75 ? "#f59e0b" : "#ef4444"}
                >
                  {node.confidence}%
                </text>
              )}
            </motion.g>
          ))}
        </motion.g>
      </svg>
    </div>
  );
}
