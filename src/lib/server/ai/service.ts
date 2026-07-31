export const callGroqApi = async (messages: any[]) => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("Missing or invalid GROQ_API_KEY in environment variables.");
  }

  const apiUrl = process.env.GROQ_API_URL || "https://api.groq.com/openai/v1/chat/completions";
  
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: messages
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Groq API Error:", errorText);
    throw new Error(`Failed to communicate with Groq API: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const result = await response.json();
  return result.choices[0].message.content as string;
};
