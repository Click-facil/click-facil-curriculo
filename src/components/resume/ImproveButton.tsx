import { useState } from "react";
import { Sparkles, Loader2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTextImprover } from "@/hooks/useTextImprover";

type TipoMelhoria = "objetivo" | "experiencia";

interface ImproveButtonProps {
  value: string;
  onChange: (novoTexto: string) => void;
  tipo?: TipoMelhoria;
}

export function ImproveButton({ value, onChange, tipo = "objetivo" }: ImproveButtonProps) {
  const { improveText, loading, error } = useTextImprover();
  const [preview, setPreview] = useState<string | null>(null);

  async function handleClick() {
    const resultado = await improveText(value, tipo);
    if (resultado) setPreview(resultado);
  }

  function handleAccept() {
    if (preview) {
      onChange(preview);
      setPreview(null);
    }
  }

  function handleReject() {
    setPreview(null);
  }

  return (
    <div className="flex flex-col gap-2 mt-1">
      {/* Botão principal */}
      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleClick}
          disabled={loading || !value?.trim() || value.trim().length < 10}
          className="gap-1.5 text-primary border-primary/40 hover:border-primary hover:bg-primary/5 text-xs"
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Sparkles className="w-3.5 h-3.5" />
          )}
          {loading ? "Melhorando..." : "Melhorar com IA"}
        </Button>
      </div>

      {/* Erro */}
      {error && (
        <p className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-md">
          ⚠️ {error}
        </p>
      )}

      {/* Preview da sugestão */}
      {preview && (
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 space-y-2">
          <p className="text-xs font-semibold text-primary uppercase tracking-wide flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Sugestão da IA
          </p>
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
            {preview}
          </p>
          <div className="flex gap-2 justify-end pt-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleReject}
              className="text-xs gap-1 text-muted-foreground"
            >
              <X className="w-3 h-3" /> Manter original
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleAccept}
              className="text-xs gap-1"
            >
              <Check className="w-3 h-3" /> Usar sugestão
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
