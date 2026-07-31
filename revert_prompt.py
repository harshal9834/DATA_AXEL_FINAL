import os

PROMPT_FILE_PATH = r"c:\Users\Kunal\OneDrive\Desktop\Data_axle_logiloop\DATA_AXEL_FINAL\backend\src\routes\documentRoutes.ts"

# We will read the documentRoutes.ts and replace the GEMINI_JSON_PROMPT with the exact, small prompt the user requested.
# I'll just write the entire new prompt string.
NEW_PROMPT = """const GEMINI_JSON_PROMPT = `
You are an expert AI Documentation Studio Assistant.
Your job is to take the provided context (either a project description or raw document text) and generate a HIGHLY STRUCTURED JSON output.
This JSON will be used to automatically render an 8-slide Pitch Deck (Presentation) and an 8-page Software Requirement Specification (SRS) document.

DO NOT return ANY markdown formatting, no \\\`\\\`\\\`json blocks. RETURN ONLY VALID RAW JSON.

You MUST generate diagrams using Mermaid.js syntax for workflow and architecture diagrams.

The required JSON structure must be EXACTLY:

{
  "projectName": "Name of the project",
  "summary": "1-2 sentence tagline",
  "problem": {
    "statement": "The core problem statement",
    "painPoints": ["Point 1", "Point 2", "Point 3"],
    "targetUsers": ["User 1", "User 2"]
  },
  "solution": {
    "overview": "Overview of the solution",
    "keyFeatures": ["Feature 1", "Feature 2", "Feature 3", "Feature 4"],
    "innovationPoints": ["Innovation 1", "Innovation 2"]
  },
  "techStack": {
    "frontend": ["Tech 1", "Tech 2"],
    "backend": ["Tech 1", "Tech 2"],
    "database": ["DB 1"],
    "aiModels": ["Model 1", "Model 2"],
    "cloud": ["Cloud 1"]
  },
  "workflow": {
    "description": "Brief process description",
    "mermaid": "graph LR\\\\n  A[Upload/Select] --> B[AI Analysis]\\\\n  B --> C[Research]\\\\n  C --> D[Innovation]\\\\n  D --> E[Documentation]\\\\n  E --> F[Export]"
  },
  "architecture": {
    "description": "Brief architecture description",
    "mermaid": "graph TD\\\\n  A[User] --> B[Frontend]\\\\n  B --> C[Backend API]\\\\n  C --> D[AI Engine]\\\\n  C --> E[(Database)]\\\\n  C --> F[Reports]"
  },
  "results": {
    "impact": "Expected impact description"
  },
  "srs": {
    "version": "1.0",
    "purpose": "Purpose of the system",
    "scope": "Scope of the system",
    "functionalRequirements": [
      { "module": "Module 1", "feature": "Feature 1", "priority": "High" }
    ],
    "nonFunctionalRequirements": [
      { "category": "Performance", "requirement": "Req 1" }
    ],
    "architecture": "High level architecture description",
    "workflow": "High level workflow description"
  }
}
`;
"""

with open(PROMPT_FILE_PATH, 'r', encoding='utf-8') as f:
    content = f.read()

import re
# Regex to find const GEMINI_JSON_PROMPT = `...`;
content = re.sub(r'const GEMINI_JSON_PROMPT = `[\s\S]*?`;', NEW_PROMPT, content)

with open(PROMPT_FILE_PATH, 'w', encoding='utf-8') as f:
    f.write(content)

print("Prompt updated.")
