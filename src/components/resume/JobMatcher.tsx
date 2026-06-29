import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Target, CheckCircle2, AlertCircle, Lightbulb } from "lucide-react";
import { ResumeData } from "@/types/resume";
import { toast } from "sonner";

interface JobMatcherProps {
  data: ResumeData;
  uid: string | null;
  isAdmin: boolean;
  onShowAuth: () => void;
  onShowCredits: () => void;
}

interface MatchResult {
  score: number;
  resumo: string;
  pontos_fortes: string[];
  sugestoes: string[];
}

export function JobMatcher({ data, uid, isAdmin, onShowAuth, onShowCredits }: JobMatcherProps) {
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MatchResult | null>(null);

  const handleMatch = async () => {
    if (!uid) {
      onShowAuth();
      return;
    }

    if (!jobDescription.trim()) {
      toast.error("Cole a descrição da vaga antes de analisar");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/match-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeData: data,
          jobDescription: jobDescription.trim(),
          uid,
        }),
      });

      if (response.status === 402) {
        onShowCredits();
        return;
      }

      if (!response.ok) throw new Error("Erro ao processar match");

      const matchResult: MatchResult = await response.json();
      setResult(matchResult);
      toast.success("Análise concluída!");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao analisar compatibilidade");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return { bg: "bg-emerald-500", text: "text-emerald-500", label: "Excelente" };
    if (score >= 50) return { bg: "bg-primary", text: "text-primary", label: "Boa" };
    if (score >= 30) return { bg: "bg-amber-500", text: "text-amber-500", label: "Média" };
    return { bg: "bg-red-500", text: "text-red-500", label: "Baixa" };
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-semibold text-foreground text-sm">Match com Vaga</h3>
        </div>
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          Cole a descrição da vaga e descubra sua compatibilidade + sugestões de ajuste.
        </p>
      </div>

      <Textarea
        placeholder="Cole aqui a descrição completa da vaga (requisitos, responsabilidades, etc.)"
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
        className="min-h-[80px] text-xs resize-none"
        disabled={loading}
      />

      <Button
        onClick={handleMatch}
        disabled={loading || !jobDescription.trim()}
        size="sm"
        className="w-full"
      >
        {loading ? (
          <>
            <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
            Analisando...
          </>
        ) : (
          <>
            <Target className="w-3.5 h-3.5 mr-2" />
            Analisar Compatibilidade
            {!isAdmin && <span className="ml-2 text-[9px] opacity-70">2 créditos</span>}
          </>
        )}
      </Button>

      {result && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 text-center">
              <span className={`text-3xl font-bold tabular-nums ${getScoreColor(result.score).text}`}>
                {result.score}
              </span>
              <span className="text-sm text-muted-foreground">/100</span>
              <p className={`text-[10px] font-semibold mt-0.5 ${getScoreColor(result.score).text}`}>
                {getScoreColor(result.score).label}
              </p>
            </div>
            <div className="flex-1 space-y-1">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${getScoreColor(result.score).bg}`}
                  style={{ width: `${result.score}%` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">{result.resumo}</p>
            </div>
          </div>

          <div className="border-t border-border" />

          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              Pontos Fortes
            </h4>
            <ul className="space-y-1">
              {result.pontos_fortes.map((ponto, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-emerald-500 text-[10px] mt-0.5">✓</span>
                  <span className="text-[11px] text-foreground leading-relaxed">{ponto}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              Sugestões de Melhoria
            </h4>
            <ul className="space-y-1">
              {result.sugestoes.map((sugestao, i) => (
                <li key={i} className="flex items-start gap-2">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <span className="text-[11px] text-foreground leading-relaxed">{sugestao}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
