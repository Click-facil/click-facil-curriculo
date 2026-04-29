import type { VercelRequest, VercelResponse } from "@vercel/node";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const GROQ_API_KEY = process.env.VITE_GROQ_API_KEY || "";

const ADMIN_UIDS: string[] = [
  "VC84FK6HWsfVBCVCt43OK6xw9x43",
];

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
  // Admin tem acesso ilimitado
  if (ADMIN_UIDS.includes(uid)) {
    console.log("[spendCredits] Admin detectado, acesso liberado:", uid);
    return true;
  }
  
  console.log("[spendCredits] Verificando créditos para uid:", uid);
  const ref = db.collection("users").doc(uid);
  
  try {
    const result = await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      const data = snap.data() ?? {};

      console.log("[spendCredits] Dados do usuário:", { credits: data.credits, premium: data.premium, legacy_premium: data.legacy_premium });

      // Usuários premium/legacy têm créditos ilimitados
      if (data.legacy_premium || data.premium) {
        console.log("[spendCredits] Usuário premium/legacy, acesso liberado");
        return true;
      }

      const current: number = data.credits ?? 0;
      const cost = CREDIT_COSTS.IMPROVE_AI;
      
      if (current < cost) {
        console.log("[spendCredits] Créditos insuficientes:", current, "< ", cost);
        return false;
      }

      tx.update(ref, {
        credits: current - cost,
        lastUsedAt: new Date(),
        usage_IMPROVE_AI: (data.usage_IMPROVE_AI ?? 0) + 1,
      });
      
      console.log("[spendCredits] Crédito gasto com sucesso. Novo saldo:", current - cost);
      return true;
    });
    
    return result;
  } catch (e) {
    console.error("[spendCredits] Erro:", e);
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

  console.log("[improve-text] uid:", uid, "isAdmin:", ADMIN_UIDS.includes(uid));

  try {
    // Gasta 1 crédito antes de melhorar (exceto admin)
    const success = await spendCredits(uid);
    if (!success) {
      console.log("[improve-text] Créditos insuficientes para uid:", uid);
      return res.status(402).json({ error: "Créditos insuficientes" });
    }

    let prompt = "";
    if (tipo === "objetivo") {
      prompt = `Você é um especialista em currículos profissionais e recrutamento.

Melhore o seguinte objetivo profissional para um currículo, tornando-o mais impactante, específico e profissional.

REGRAS:
- Use linguagem formal e direta
- Destaque competências e valor que o candidato traz
- Seja específico sobre a área de atuação
- Mantenha entre 3-4 linhas
- Use verbos de ação (buscar, contribuir, aplicar, desenvolver)
- Evite clichês genéricos

TEXTO ORIGINAL:
"${text}"

Retorne APENAS o texto melhorado, sem aspas, sem títulos, sem explicações adicionais.`;
    } else if (tipo === "experiencia") {
      prompt = `Você é um especialista em currículos profissionais e recrutamento.

Melhore a seguinte descrição de experiência profissional para um currículo.

REGRAS:
- Use verbos de ação no passado (desenvolvi, implementei, gerenciei, coordenei, otimizei, liderei)
- Destaque resultados concretos e conquistas mensuráveis quando possível
- Organize em 3-5 tópicos (bullet points)
- Cada tópico deve ter 1-2 linhas
- Seja específico sobre tecnologias, metodologias ou processos
- Evite descrições vagas ou genéricas
- Use linguagem profissional e impactante

TEXTO ORIGINAL:
"${text}"

Retorne APENAS os tópicos melhorados, um por linha, sem numeração, sem aspas, sem explicações adicionais.`;
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
