import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, Check, RefreshCw, Zap } from "lucide-react";
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
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [usedFreeImprovement, setUsedFreeImprovement] = useState(false);

  // Verifica se já usou a melhoria grátis deste campo
  useEffect(() => {
    if (!uid) return;
    const key = `free_improve_${tipo}_${uid}`;
    const used = localStorage.getItem(key) === "true";
    setUsedFreeImprovement(used);
  }, [uid, tipo]);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleImprove = async () => {
    if (!value.trim()) {
      toast.error("Escreva algo antes de melhorar com IA");
      return;
    }

    if (!uid) {
      onShowAuth();
      return;
    }

    // Verifica se é a primeira melhoria (grátis)
    const isFree = !usedFreeImprovement;

    if (!isFree && !isUnlimited && credits < 1) {
      onShowCredits();
      return;
    }

    setLoading(true);
    
    try {
      // Em desenvolvimento, chama GROQ direto
      const isDev = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
      
      if (isDev) {
        const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
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
"${value}"

Retorne APENAS o texto melhorado, sem aspas, sem títulos, sem explicações adicionais.`;
        } else {
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
"${value}"

Retorne APENAS os tópicos melhorados, um por linha, sem numeração, sem aspas, sem explicações adicionais.`;
        }
        
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${GROQ_API_KEY}`,
          },
          body: JSON.stringify({
            model: "llama-3.1-8b-instant",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            max_tokens: 500,
          }),
        });
        
        if (!response.ok) throw new Error("Erro ao melhorar texto");
        const data = await response.json();
        const improved = data.choices[0]?.message?.content?.trim() || value;
        setSuggestion(improved);
      } else {
        // Em produção, usa a API
        const res = await fetch("/api/improve-text", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: value, tipo, uid }),
        });

        if (!res.ok) throw new Error("Erro ao melhorar texto");

        const data = await res.json();
        setSuggestion(data.improved);
      }
      
      setCooldown(10);
      
      // Marca que usou a melhoria grátis
      if (isFree && uid) {
        const key = `free_improve_${tipo}_${uid}`;
        localStorage.setItem(key, "true");
        setUsedFreeImprovement(true);
      }
    } catch (err) {
      console.error(err);
      toast.error("Erro ao melhorar texto. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleUseSuggestion = () => {
    if (suggestion) {
      onChange(suggestion);
      setSuggestion(null);
      toast.success("✨ Texto atualizado!");
    }
  };

  return (
    <div className="mt-2 space-y-2">
      {!suggestion && (
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleImprove}
            disabled={loading || !value.trim()}
            className="flex-1 sm:flex-initial"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                Melhorando...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 mr-2" />
                Melhorar com IA
              </>
            )}
          </Button>
          {!isUnlimited && (
            <span className="text-[10px] text-muted-foreground opacity-60 flex items-center gap-1">
              {!usedFreeImprovement ? (
                <span className="text-green-600 dark:text-green-500 font-medium">1 grátis</span>
              ) : (
                <>
                  <Zap className="w-3 h-3" />
                  {credits} créditos
                </>
              )}
            </span>
          )}
        </div>
      )}

      {suggestion && (
        <div className="bg-card border border-border rounded-lg p-3 space-y-3">
          <div>
            <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              Sugestão da IA:
            </p>
            {loading ? (
              <div className="flex items-center gap-2 py-4">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Gerando nova sugestão...</span>
              </div>
            ) : (
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {suggestion}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              onClick={handleUseSuggestion}
              disabled={loading}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Check className="w-3.5 h-3.5 mr-1.5" />
              Usar sugestão
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleImprove}
              disabled={loading || cooldown > 0}
              className="flex-1"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              Gerar nova {cooldown > 0 && `(${cooldown}s)`}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
