export function generateTemplateFallback(prompt: string, type: string): any {
  // If all providers fail, we generate a deterministic template based on the request type
  if (type === 'documentation') {
    return {
      slides: [
        {
          title: "Project Overview",
          content: [
            "We are currently experiencing high AI traffic.",
            "This is a placeholder generated to ensure the system never fails.",
            "Please try generating again in a few moments."
          ]
        }
      ],
      srs: {
        title: "Software Requirement Specification",
        introduction: "Generated as a fallback due to AI provider limits.",
        features: ["Fallback Generation", "System Reliability"],
        architecture: "Multi-tiered AI Provider Fallback System"
      }
    };
  }

  // Generic fallback
  return {
    fallback: true,
    message: "Generated using template generator because all AI providers failed.",
    timestamp: new Date().toISOString()
  };
}
