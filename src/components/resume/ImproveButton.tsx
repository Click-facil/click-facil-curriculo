import { useState, useEffect, useRef } from "react";
import { Sparkles, Loader2, Check, X, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTextImprover } from "@/hooks/useTextImprover";

type TipoMelhoria = "objetivo" | "experiencia";

interface ImproveButtonProps {
  value: string;
  onChange: (novoTexto: string) => void;
  tipo?: TipoMelhoria;
  spend: (feature: string) => Promise<boolean>;
  onShowCredits: () => void;
}

const COOLDOWN_SEGUNDOS = 5;

export function ImproveButton({ value, onChange, tipo = "objetivo", spend, onShowCredits }: ImproveButtonProps) {
  const { improveText, loading, error } = useTextImprover();
  const [preview, setPreview] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const jaGerou = preview !== null || cooldown > 0;

  function iniciarCooldown() {
    setCooldown(COOLDOWN_SEGUNDOS);
    intervalRef.current = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) {
          clearInterval(intervalRef.current!);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  }

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  async function handleClick() {
    const ok = await spend("IMPROVE_AI");
    if (!ok) {
      onShowCredits();
      return;
    }
    const resultado = await improveText(value, tipo);
    if (resultado) {
      setPreview(resultado);
      iniciarCooldown();
    }
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

  const emCooldown = cooldown > 0;
  const desabilitado = loading || emCooldown || !value?.trim() || value.trim().length < 10;

  return (
    <div className="flex flex-col gap-2 mt-1">
      {/* Botão principal */}
      <div className="flex items-center justify-end gap-2">
        {emCooldown && (
          <span className="text-xs text-muted-foreground tabular-nums">
            Aguarde {cooldown}s...
          </span>
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleClick}
          disabled={desabilitado}
          className="gap-1.5 text-primary border-primary/40 hover:border-primary hover:bg-primary/5 text-xs disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Sparkles className="w-3.5 h-3.5" />
          )}
          {loading ? "Melhorando..." : jaGerou ? "Nova sugestão" : "Melhorar com IA"}
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
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-primary uppercase tracking-wide flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Sugestão da IA
            </p>
            <button
              type="button"
              onClick={handleClick}
              disabled={desabilitado}
              className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className="w-3 h-3" />
              {emCooldown ? `Nova em ${cooldown}s` : "Gerar nova"}
            </button>
          </div>
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