import type { VercelRequest, VercelResponse } from "@vercel/node";
import { spend } from "../src/lib/credits";

const GROQ_API_KEY = process.env.VITE_GROQ_API_KEY || "";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { text, tipo, uid } = req.body;

  if (!text || !tipo || !uid) {
    return res.status(400).json({ error: "Campos obrigatórios: text, tipo, uid" });
  }

  try {
    // Gasta 1 crédito antes de melhorar
    const success = await spend(uid, "IMPROVE_AI");
    if (!success) {
      return res.status(402).json({ error: "Créditos insuficientes" });
    }

    let prompt = "";
    if (tipo === "objetivo") {
      prompt = `Você é um especialista em currículos profissionais. Melhore o seguinte objetivo profissional para um currículo, tornando-o mais impactante, direto e profissional. Mantenha em português do Brasil e em no máximo 3 linhas:

"${text}"

Retorne APENAS o texto melhorado, sem aspas ou formatação adicional.`;
    } else if (tipo === "experiencia") {
      prompt = `Você é um especialista em currículos profissionais. Melhore a seguinte descrição de experiência profissional, usando verbos de ação no passado, destacando resultados e conquistas. Mantenha em português do Brasil e organize em tópicos curtos (máximo 4 linhas):

"${text}"

Retorne APENAS o texto melhorado, sem aspas ou formatação adicional. Cada linha deve ser um tópico separado.`;
    } else {
      return res.status(400).json({ error: "Tipo inválido. Use 'objetivo' ou 'experiencia'" });
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error("Erro ao chamar API GROQ");
    }

    const data = await response.json();
    const improved = data.choices[0]?.message?.content?.trim() || text;

    return res.status(200).json({ improved });
  } catch (error) {
    console.error("Erro ao melhorar texto:", error);
    return res.status(500).json({ error: "Erro ao processar solicitação" });
  }
}
