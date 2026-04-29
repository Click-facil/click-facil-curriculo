import { doc, getDoc, runTransaction } from "firebase/firestore";
import { db } from "./firebase";
import { isAdmin } from "./admin";

export const CREDIT_COSTS = {
  LINKEDIN_IMPORT: 3,
  DOWNLOAD_PDF:    2,
  COVER_LETTER:    2,
  IMPROVE_AI:      1,
  UNLOCK_TEMPLATE: 1,
  ATS_ANALYSIS:    1,
} as const;

export type CreditAction = keyof typeof CREDIT_COSTS;

export const CREDIT_LABELS: Record<CreditAction, string> = {
  LINKEDIN_IMPORT: "Importar LinkedIn",
  DOWNLOAD_PDF:    "Baixar PDF",
  COVER_LETTER:    "Gerar carta de apresentação",
  IMPROVE_AI:      "Melhorar com IA",
  UNLOCK_TEMPLATE: "Desbloquear template",
  ATS_ANALYSIS:    "Análise ATS",
};

/**
 * Consome créditos do usuário de forma atômica no Firestore.
 * Retorna true se sucesso, false se saldo insuficiente.
 */
export async function spend(uid: string, action: CreditAction): Promise<boolean> {
  // Admin tem acesso ilimitado
  if (isAdmin(uid)) return true;
  
  const cost = CREDIT_COSTS[action];
  const ref = doc(db, "users", uid);

  try {
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(ref);
      const data = snap.data() ?? {};

      // Usuários premium/legacy têm créditos ilimitados
      if (data.legacy_premium || data.premium) return;

      const current: number = data.credits ?? 0;
      if (current < cost) throw new Error("insufficient_credits");

      tx.update(ref, {
        credits: current - cost,
        lastUsedAt: new Date(),
        [`usage_${action}`]: (data[`usage_${action}`] ?? 0) + 1,
      });
    });
    return true;
  } catch (e: any) {
    if (e?.message === "insufficient_credits") return false;
    console.error("spend error:", e);
    return false;
  }
}

/**
 * Retorna o saldo atual de créditos do usuário.
 * Premium/admin = 9999 (ilimitado).
 */
export async function getCredits(uid: string): Promise<number> {
  // Admin tem créditos ilimitados
  if (isAdmin(uid)) return 9999;
  
  try {
    const snap = await getDoc(doc(db, "users", uid));
    const data = snap.data();
    if (data?.legacy_premium || data?.premium) return 9999;
    return data?.credits ?? 0;
  } catch {
    return 0;
  }
}

/**
 * Desbloqueia um template premium consumindo 1 crédito.
 * Salva o template na lista de templates desbloqueados do usuário.
 */
export async function unlockTemplate(uid: string, templateId: string): Promise<boolean> {
  // Admin tem tudo desbloqueado
  if (isAdmin(uid)) return true;
  
  const ref = doc(db, "users", uid);
  try {
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(ref);
      const data = snap.data() ?? {};

      if (data.legacy_premium || data.premium) return;

      const current: number = data.credits ?? 0;
      const cost = CREDIT_COSTS.UNLOCK_TEMPLATE;
      if (current < cost) throw new Error("insufficient_credits");

      const unlocked: string[] = data.unlockedTemplates ?? [];
      if (unlocked.includes(templateId)) return; // já desbloqueado, não cobra

      tx.update(ref, {
        credits: current - cost,
        unlockedTemplates: [...unlocked, templateId],
        lastUsedAt: new Date(),
      });
    });
    return true;
  } catch (e: any) {
    if (e?.message === "insufficient_credits") return false;
    console.error("unlockTemplate error:", e);
    return false;
  }
}

/**
 * Verifica se um template está desbloqueado para o usuário.
 */
export async function isTemplateUnlocked(uid: string, templateId: string): Promise<boolean> {
  // Admin tem tudo desbloqueado
  if (isAdmin(uid)) return true;
  
  try {
    const snap = await getDoc(doc(db, "users", uid));
    const data = snap.data();
    if (data?.legacy_premium || data?.premium) return true;
    return (data?.unlockedTemplates ?? []).includes(templateId);
  } catch {
    return false;
  }
}