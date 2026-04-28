import { useState, useEffect, useCallback } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { spend as spendFn, unlockTemplate as unlockFn, CREDIT_COSTS, CreditAction } from "@/lib/credits";

interface UseCreditsReturn {
  credits: number;
  unlockedTemplates: string[];
  loading: boolean;
  isUnlimited: boolean;
  canAfford: (action: CreditAction) => boolean;
  spend: (action: CreditAction) => Promise<boolean>;
  unlockTemplate: (templateId: string) => Promise<boolean>;
  isTemplateUnlocked: (templateId: string) => boolean;
}

export function useCredits(uid: string | null): UseCreditsReturn {
  const [credits, setCredits] = useState(0);
  const [unlockedTemplates, setUnlockedTemplates] = useState<string[]>([]);
  const [isUnlimited, setIsUnlimited] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setCredits(0);
      setUnlockedTemplates([]);
      setIsUnlimited(false);
      setLoading(false);
      return;
    }

    // Listener em tempo real — saldo atualiza automaticamente após compra/gasto
    const unsub = onSnapshot(doc(db, "users", uid), (snap) => {
      const data = snap.data() ?? {};
      const unlimited = !!(data.legacy_premium || data.premium);
      setIsUnlimited(unlimited);
      setCredits(unlimited ? 9999 : (data.credits ?? 0));
      setUnlockedTemplates(data.unlockedTemplates ?? []);
      setLoading(false);
    }, () => {
      setLoading(false);
    });

    return unsub;
  }, [uid]);

  const canAfford = useCallback((action: CreditAction) => {
    if (isUnlimited) return true;
    return credits >= CREDIT_COSTS[action];
  }, [credits, isUnlimited]);

  const spend = useCallback(async (action: CreditAction): Promise<boolean> => {
    if (!uid) return false;
    if (isUnlimited) return true;
    return spendFn(uid, action);
  }, [uid, isUnlimited]);

  const unlockTemplate = useCallback(async (templateId: string): Promise<boolean> => {
    if (!uid) return false;
    if (isUnlimited) return true;
    return unlockFn(uid, templateId);
  }, [uid, isUnlimited]);

  const isTemplateUnlocked = useCallback((templateId: string): boolean => {
    if (isUnlimited) return true;
    return unlockedTemplates.includes(templateId);
  }, [isUnlimited, unlockedTemplates]);

  return { credits, unlockedTemplates, loading, isUnlimited, canAfford, spend, unlockTemplate, isTemplateUnlocked };
} 