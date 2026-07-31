import React from 'react';

export function MarkdownRenderer({ content }: { content: string }) {
  if (!content) return null;

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  
  let inCodeBlock = false;
  let codeContent = '';
  let codeLanguage = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('```')) {
      if (inCodeBlock) {
        // End code block
        elements.push(
          <div key={`code-${i}`} className="my-6 overflow-hidden rounded-xl bg-slate-900 shadow-soft">
            <div className="flex px-4 py-2 bg-slate-800/80 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {codeLanguage || 'Code'}
            </div>
            <pre className="p-4 text-sm text-slate-50 overflow-x-auto font-mono leading-relaxed">
              {codeContent}
            </pre>
          </div>
        );
        inCodeBlock = false;
        codeContent = '';
        codeLanguage = '';
      } else {
        // Start code block
        inCodeBlock = true;
        codeLanguage = line.replace('```', '').trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeContent += line + '\n';
      continue;
    }

    if (line.startsWith('# ')) {
      elements.push(<h1 key={i} className="mt-10 mb-5 text-2xl font-extrabold text-slate-900">{line.replace('# ', '')}</h1>);
      continue;
    }
    if (line.startsWith('## ')) {
      elements.push(<h2 key={i} className="mt-8 mb-4 text-xl font-bold text-slate-900">{line.replace('## ', '')}</h2>);
      continue;
    }
    if (line.startsWith('### ')) {
      elements.push(<h3 key={i} className="mt-6 mb-3 text-lg font-bold text-slate-900">{line.replace('### ', '')}</h3>);
      continue;
    }
    if (line.trim() === '') {
      elements.push(<div key={i} className="h-2" />);
      continue;
    }
    
    // Bullet lists
    if (line.match(/^[\-\*]\s/)) {
      elements.push(
        <li key={i} className="ml-6 mb-1.5 text-slate-700 marker:text-primary">
          {formatText(line.replace(/^[\-\*]\s/, ''))}
        </li>
      );
      continue;
    }
    
    // Tables (Basic parsing - just render monospace for now)
    if (line.includes('|') && line.startsWith('|')) {
      elements.push(
        <div key={i} className="font-mono text-[13px] whitespace-pre text-slate-700 bg-slate-50/50 p-1 -mx-2 rounded">
          {line}
        </div>
      );
      continue;
    }

    elements.push(<p key={i} className="mb-2 text-slate-800 leading-relaxed">{formatText(line)}</p>);
  }

  return (
    <div className="mx-auto max-w-4xl text-sm md:text-base">
      {elements}
    </div>
  );
}

function formatText(text: string) {
  // Basic bold parsing **text**
  const parts = text.split('**');
  if (parts.length === 1) return text;
  
  return parts.map((part, index) => 
    index % 2 === 1 ? <strong key={index} className="font-bold text-slate-900">{part}</strong> : <span key={index}>{part}</span>
  );
}
