function extractJSON(text) {
  try {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end >= start) {
      return JSON.parse(text.substring(start, end + 1));
    }
    return JSON.parse(text);
  } catch(e) {
    return { markdown: text };
  }
}

const agents = ['researchAgent', 'innovationAgent', 'architectureAgent', 'documentationAgent'];
const fs = require('fs');
const path = require('path');

agents.forEach(agent => {
  const filePath = path.join(__dirname, 'src', 'services', 'agents', agent + '.ts');
  let content = fs.readFileSync(filePath, 'utf8');
  
  // 1. Remove jsonMode: true
  content = content.replace(/jsonMode:\s*true,/g, '');
  content = content.replace(/jsonMode:\s*true\s*}/g, '}');
  
  // 2. Add fallback parsing logic
  content = content.replace(
    /this\.resultData = JSON\.parse\(content\) as .*?;/g,
    \let parsed;
      try {
        const start = content.indexOf('{');
        const end = content.lastIndexOf('}');
        if (start !== -1 && end !== -1 && end >= start) {
          parsed = JSON.parse(content.substring(start, end + 1));
        } else {
          parsed = JSON.parse(content);
        }
      } catch(e) {
        parsed = { markdown: content };
      }
      this.resultData = parsed as any;\
  );

  // 3. Remove throw error in catch block and just accept the fallback
  content = content.replace(
    /catch\s*\([^)]*\)\s*\{[\s\S]*?throw new Error\([^)]*\);?\s*\}/g,
    \catch (error) {
      // In case of unexpected JS error, still fallback
      this.resultData = { markdown: content } as any;
      this.updateState('completed', 100, 'Completed with markdown fallback');
      return this.resultData;
    }\
  );

  fs.writeFileSync(filePath, content);
});
