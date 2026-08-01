import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { Copy, Download, Check } from 'lucide-react';
import { toast } from 'sonner';

mermaid.initialize({
  startOnLoad: false,
  theme: 'base',
  themeVariables: {
    fontFamily: 'Inter, sans-serif',
    primaryColor: '#e9d5ff', // purple-200
    primaryTextColor: '#4c1d95', // purple-900
    primaryBorderColor: '#a855f7', // purple-500
    lineColor: '#8b5cf6', // violet-500
    secondaryColor: '#f3e8ff', // purple-100
    tertiaryColor: '#ffffff',
  }
});

interface MermaidRendererProps {
  code: string;
}

export function MermaidRenderer({ code }: MermaidRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  const id = `mermaid-${Math.random().toString(36).substring(2, 9)}`;

  useEffect(() => {
    let isMounted = true;
    
    const renderDiagram = async () => {
      try {
        setError(null);
        // Clean up markdown block if it was passed by mistake
        let cleanCode = code.trim();
        if (cleanCode.startsWith('```mermaid')) {
          cleanCode = cleanCode.substring(10).trim();
        }
        if (cleanCode.startsWith('```')) {
          cleanCode = cleanCode.substring(3).trim();
        }
        if (cleanCode.endsWith('```')) {
          cleanCode = cleanCode.slice(0, -3).trim();
        }
        
        const { svg } = await mermaid.render(id, cleanCode);
        
        if (isMounted) {
          setSvgContent(svg);
        }
      } catch (err: any) {
        console.error('Mermaid render error:', err);
        if (isMounted) {
          setError(err.message || 'Failed to render diagram');
        }
      }
    };

    if (code) {
      renderDiagram();
    }

    return () => {
      isMounted = false;
    };
  }, [code, id]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('Mermaid code copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadSvg = () => {
    if (!svgContent) return;
    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'diagram.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Diagram SVG downloaded');
  };

  return (
    <div className="relative flex flex-col items-center justify-center rounded-xl border border-border bg-slate-50/50 p-6 w-full overflow-hidden">
      <div className="absolute right-4 top-4 flex gap-2 z-10">
        <button
          onClick={handleCopyCode}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-border/70 text-muted-foreground shadow-sm hover:text-foreground hover:bg-accent transition-colors"
          title="Copy Mermaid Code"
        >
          {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
        </button>
        <button
          onClick={downloadSvg}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-border/70 text-muted-foreground shadow-sm hover:text-foreground hover:bg-accent transition-colors"
          title="Download SVG"
        >
          <Download className="h-4 w-4" />
        </button>
      </div>

      {error ? (
        <div className="text-red-500 text-sm p-4 bg-red-50 rounded-lg text-center font-mono w-full overflow-x-auto whitespace-pre">
          {error}
        </div>
      ) : (
        <div 
          ref={containerRef}
          className="w-full flex justify-center overflow-x-auto overflow-y-hidden"
          dangerouslySetInnerHTML={{ __html: svgContent }} 
        />
      )}
    </div>
  );
}
