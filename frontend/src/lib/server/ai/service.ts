export const callGroqApi = async (messages: any[]) => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("Missing or invalid GROQ_API_KEY in environment variables.");
  }

  const apiUrl = process.env.GROQ_API_URL || "https://api.groq.com/openai/v1/chat/completions";
  const models = ["llama-3.3-70b-versatile", "llama3-70b-8192", "mixtral-8x7b-32768"];
  
  let lastError = null;

  for (const model of models) {
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: messages
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`Groq API Error with model ${model}:`, errorText);
        lastError = new Error(`Failed with ${model}: ${response.status} ${errorText}`);
        continue; // Try next model
      }

      const result = await response.json();
      return result.choices[0].message.content as string;
    } catch (err) {
      console.warn(`Fetch error with model ${model}:`, err);
      lastError = err;
    }
  }

  throw new Error(`All Groq models failed. Last error: ${lastError?.message || lastError}`);
};
