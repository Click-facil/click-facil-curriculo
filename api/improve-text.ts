import type { VercelRequest, VercelResponse } from "@vercel/node";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const GROQ_API_KEY = process.env.VITE_GROQ_API_KEY || "";

// Inicializa Firebase Admin
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

const db = getFirestore();

const CREDIT_COSTS = {
  IMPROVE_AI: 1,
} as const;

async function spendCredits(uid: string): Promise<boolean> {
  const ref = db.collection("users").doc(uid);
  
  try {
    const result = await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      const data = snap.data() ?? {};

      // Usuários premium/legacy têm créditos ilimitados
      if (data.legacy_premium || data.premium) return true;

      const current: number = data.credits ?? 0;
      const cost = CREDIT_COSTS.IMPROVE_AI;
      
      if (current < cost) return false;

      tx.update(ref, {
        credits: current - cost,
        lastUsedAt: new Date(),
        usage_IMPROVE_AI: (data.usage_IMPROVE_AI ?? 0) + 1,
      });
      
      return true;
    });
    
    return result;
  } catch (e) {
    console.error("spend error:", e);
    return false;
  }
}

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
    const success = await spendCredits(uid);
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
