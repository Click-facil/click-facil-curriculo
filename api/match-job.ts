import type { VercelRequest, VercelResponse } from "@vercel/node";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const GROQ_API_KEY = process.env.VITE_GROQ_API_KEY || "";

const ADMIN_UIDS: string[] = ["VC84FK6HWsfVBCVCt43OK6xw9x43"];

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
const CREDIT_COST = 2;

async function spendCredits(uid: string): Promise<boolean> {
  if (ADMIN_UIDS.includes(uid)) return true;

  const ref = db.collection("users").doc(uid);

  try {
    const result = await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      const data = snap.data() ?? {};

      if (data.legacy_premium || data.premium) return true;

      const current: number = data.credits ?? 0;
      if (current < CREDIT_COST) return false;

      tx.update(ref, {
        credits: current - CREDIT_COST,
        lastUsedAt: new Date(),
        usage_JOB_MATCH: (data.usage_JOB_MATCH ?? 0) + 1,
      });

      return true;
    });

    return result;
  } catch (e) {
    console.error("[match-job] Erro ao gastar créditos:", e);
    return false;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { resumeData, jobDescription, uid } = req.body;

  if (!resumeData || !jobDescription || !uid) {
    return res.status(400).json({ error: "Campos obrigatórios: resumeData, jobDescription, uid" });
  }

  try {
    const success = await spendCredits(uid);
    if (!success) {
      return res.status(402).json({ error: "Créditos insuficientes" });
    }

    const prompt = `Você é um especialista em recrutamento e análise de compatibilidade entre currículos e vagas.

Analise a aderência do currículo à vaga e retorne APENAS um JSON válido, sem markdown, sem explicações.

CURRÍCULO:
- Nome: ${resumeData.personalInfo.fullName}
- Objetivo: ${resumeData.personalInfo.objective}
- Experiências: ${resumeData.experience.map((e: any) => `${e.position} na ${e.company} (${e.description.slice(0, 150)})`).join("; ")}
- Formação: ${resumeData.education.map((e: any) => `${e.degree} em ${e.course} - ${e.institution}`).join("; ")}
- Habilidades: ${resumeData.skills.map((s: any) => s.name).join(", ")}
- Idiomas: ${resumeData.languages.map((l: any) => `${l.name} (${l.level})`).join(", ")}

DESCRIÇÃO DA VAGA:
${jobDescription}

Retorne exatamente neste formato JSON:
{
  "score": <número de 0 a 100>,
  "resumo": "<frase curta sobre a aderência, máximo 20 palavras>",
  "pontos_fortes": ["<ponto 1>", "<ponto 2>", "<ponto 3>"],
  "sugestoes": ["<sugestão 1>", "<sugestão 2>", "<sugestão 3>"]
}

- score: compatibilidade geral do currículo com a vaga
- resumo: avaliação direta e clara
- pontos_fortes: 3 aspectos positivos do currículo em relação à vaga
- sugestoes: 3-5 ajustes objetivos para melhorar a aderência`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.5,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      throw new Error("Erro ao chamar API Groq");
    }

    const data = await response.json();
    const texto = data.choices[0]?.message?.content || "";

    const match = texto.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Resposta inválida da IA");

    const result = JSON.parse(match[0]);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Erro ao fazer match:", error);
    return res.status(500).json({ error: "Erro ao processar match" });
  }
}
