import type { VercelRequest, VercelResponse } from "@vercel/node";

const GROQ_API_KEY = process.env.VITE_GROQ_API_KEY || "";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Campo 'prompt' é obrigatório" });
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 600,
      }),
    });

    if (!response.ok) {
      throw new Error("Erro na API Groq");
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error("Erro ao analisar ATS:", error);
    return res.status(500).json({ error: "Erro ao processar análise" });
  }
}
