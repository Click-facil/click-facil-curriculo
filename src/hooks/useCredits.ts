// src/hooks/useCredits.ts
import { useState, useEffect } from "react";
import { doc, onSnapshot, runTransaction } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const CREDIT_COSTS = {
  LINKEDIN_IMPORT:    3,
  DOWNLOAD_PDF:       2,
  DOWNLOAD_DOCX:      2,
  COVER_LETTER:       2,
  IMPROVE_AI:         1,
  UNLOCK_TEMPLATE:    1,
  ATS_ANALYSIS:       1,
} as const;

export type CreditAction = keyof typeof CREDIT_COSTS;

export function useCredits(uid: string | null) {
  const [credits, setCredits] = useState<number>(0);
  const [unlockedTemplates, setUnlockedTemplates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) { setLoading(false); return; }
    const unsub = onSnapshot(doc(db, "users", uid), (snap) => {
      const data = snap.data();
      // Usuários antigos com legacy_premium recebem créditos ilimitados (ex: 9999)
      if (data?.legacy_premium || data?.premium) {
        setCredits(9999);
      } else {
        setCredits(data?.credits ?? 0);
      }
      setUnlockedTemplates(data?.unlockedTemplates ?? []);
      setLoading(false);
    });
    return unsub;
  }, [uid]);

  const canAfford = (action: CreditAction) => credits >= CREDIT_COSTS[action];

  const spend = async (action: CreditAction, metadata?: object): Promise<boolean> => {
    if (!uid) return false;
    const cost = CREDIT_COSTS[action];
    if (credits < cost) return false;

    try {
      await runTransaction(db, async (tx) => {
        const ref = doc(db, "users", uid);
        const snap = await tx.get(ref);
        const current = snap.data()?.credits ?? 0;
        if (current < cost) throw new Error("Créditos insuficientes");
        
        tx.update(ref, { credits: current - cost });
        
        // Salva na subcollection transactions
        const txRef = doc(db, "users", uid, "transactions", Date.now().toString());
        tx.set(txRef, { action, cost, metadata, createdAt: new Date() });
      });
      return true;
    } catch {
      return false;
    }
  };

  const isTemplateUnlocked = (template: string) =>
    credits >= 9999 || unlockedTemplates.includes(template);

  return { credits, loading, canAfford, spend, isTemplateUnlocked };
}