import { useState } from "react";

type TipoMelhoria = "objetivo" | "experiencia";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

const PROMPTS: Record<TipoMelhoria, (texto: string) => string> = {
  objetivo: (texto) =>
    `Você é um especialista em RH e redação de currículos profissionais em português brasileiro.
Reescreva o objetivo profissional abaixo de forma clara, impactante e focada em resultados.
Use linguagem profissional, primeira pessoa, máximo 3 frases. Não adicione informações que não estejam no texto original.
Retorne APENAS o texto reescrito, sem explicações, sem aspas e sem formatação markdown.

Texto original: "${texto}"`,

  experiencia: (texto) =>
    `Você é um especialista em RH e redação de currículos profissionais em português brasileiro.
Reescreva a descrição de experiência profissional abaixo de forma clara e focada em resultados e conquistas.
Use verbos de ação no passado (ex: desenvolvi, implementei, reduzi, aumentei), seja específico e profissional.
Mantenha as informações originais, apenas melhore a redação. Máximo 4 linhas.
Retorne APENAS o texto reescrito, sem explicações, sem aspas e sem formatação markdown.

Texto original: "${texto}"`,
};

export function useTextImprover() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function improveText(
    texto: string,
    tipo: TipoMelhoria = "objetivo"
  ): Promise<string | null> {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY as string | undefined;

    if (!apiKey) {
      setError("Chave da API não configurada. Adicione VITE_GROQ_API_KEY no .env");
      return null;
    }

    if (!texto || texto.trim().length < 10) {
      setError("Digite pelo menos 10 caracteres antes de melhorar.");
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [{ role: "user", content: PROMPTS[tipo](texto) }],
          temperature: 0.7,
          max_tokens: 300,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err?.error?.message || "Erro na API Groq");
      }

      const data = await response.json();
      const resultado: string | undefined =
        data?.choices?.[0]?.message?.content;

      if (!resultado) throw new Error("Resposta vazia da IA");

      return resultado.trim();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao conectar com a IA.";
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }

  return { improveText, loading, error };
}
