import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  value: string;
  onChange: (newValue: string) => void;
  tipo: "objetivo" | "experiencia";
  uid: string | null;
  credits: number;
  isUnlimited: boolean;
  onShowCredits: () => void;
  onShowAuth: () => void;
}

export const ImproveButton = ({
  value,
  onChange,
  tipo,
  uid,
  credits,
  isUnlimited,
  onShowCredits,
  onShowAuth,
}: Props) => {
  const [loading, setLoading] = useState(false);

  const handleImprove = async () => {
    if (!value.trim()) {
      toast.error("Escreva algo antes de melhorar com IA");
      return;
    }

    if (!uid) {
      onShowAuth();
      return;
    }

    if (!isUnlimited && credits < 1) {
      onShowCredits();
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/improve-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: value, tipo, uid }),
      });

      if (!res.ok) throw new Error("Erro ao melhorar texto");

      const data = await res.json();
      onChange(data.improved);
      toast.success("✨ Texto melhorado com IA!");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao melhorar texto. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleImprove}
      disabled={loading || !value.trim()}
      className="mt-2 w-full sm:w-auto"
    >
      {loading ? (
        <>
          <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
          Melhorando...
        </>
      ) : (
        <>
          <Sparkles className="w-3.5 h-3.5 mr-2" />
          Melhorar com IA {!isUnlimited && `(1 crédito)`}
        </>
      )}
    </Button>
  );
};
