import { useState, useEffect, useRef } from "react";
import { Loader2, CheckCircle2, AlertCircle, XCircle, TrendingUp } from "lucide-react";
import { ResumeData } from "@/types/resume";
import { trackATSAnalyzed } from "@/lib/analytics";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

interface ATSItem {
  status: "ok" | "warning" | "error";
  mensagem: string;
}

interface ATSResult {
  nota: number;
  resumo: string;
  itens: ATSItem[];
}

interface ATSAnalyzerProps {
  data: ResumeData;
  spend: (action: string) => Promise<boolean>;
  onShowCredits: () => void;
  uid: string | null;
}

function buildPrompt(data: ResumeData): string {
  const { personalInfo, experience, education, skills, languages, courses } = data;

  const temObjetivo = personalInfo.objective.trim().length > 30;
  const temExperiencia = experience.length > 0;
  const temDescricoes = experience.some((e) => e.description.trim().length > 20);
  const temVerbosDeAcao = experience.some((e) =>
    /\b(desenvolvi|implementei|gerenciei|coordenei|criei|reduzi|aumentei|liderei|negociei|melhorei|automatizei|conduzi|entreguei|otimizei)\b/i.test(e.description)
  );
  const temQuantificacao = experience.some((e) => /\d+%|\d+ pessoas|\d+ projetos|\d+ clientes/i.test(e.description));
  const temFormacao = education.length > 0;
  const qtdHabilidades = skills.length;
  const temIdiomas = languages.length > 0;
  const temCursos = courses.length > 0;
  const temLinkedIn = personalInfo.linkedin.trim().length > 0;
  const temTelefone = personalInfo.phone.trim().length > 0;
  const temCidade = personalInfo.city.trim().length > 0;

  return `Você é um especialista em recrutamento e sistemas ATS (Applicant Tracking System) como Gupy, Kenoby e Workday.
Analise o currículo abaixo com critérios reais de ATS e retorne APENAS um JSON válido, sem explicações, sem markdown.

CRITÉRIOS DE ANÁLISE:
- Objetivo profissional claro e com mais de 30 caracteres
- Experiências profissionais presentes
- Descrições de experiência com verbos de ação (desenvolvi, implementei, gerenciei, etc.)
- Resultados quantificados nas experiências (números, percentuais)
- Formação acadêmica presente
- Pelo menos 5 habilidades listadas
- Idiomas informados
- Contato completo (telefone, cidade)
- LinkedIn informado
- Cursos complementares

DADOS DO CURRÍCULO:
- Tem objetivo profissional (>30 chars): ${temObjetivo}
- Tem experiência profissional: ${temExperiencia}
- Experiências com descrição: ${temDescricoes}
- Usa verbos de ação nas descrições: ${temVerbosDeAcao}
- Tem resultados quantificados: ${temQuantificacao}
- Tem formação acadêmica: ${temFormacao}
- Quantidade de habilidades: ${qtdHabilidades}
- Tem idiomas: ${temIdiomas}
- Tem cursos complementares: ${temCursos}
- Tem LinkedIn: ${temLinkedIn}
- Tem telefone: ${temTelefone}
- Tem cidade: ${temCidade}
- Cargo mais recente: ${experience[0]?.position || "não informado"}
- Área de atuação: ${personalInfo.objective.slice(0, 80) || "não informado"}

Retorne exatamente neste formato JSON:
{
  "nota": <número de 0 a 100>,
  "resumo": "<frase curta e direta sobre o estado geral do currículo, máximo 15 palavras>",
  "itens": [
    { "status": "ok" | "warning" | "error", "mensagem": "<texto curto e específico>" }
  ]
}

Gere entre 6 e 8 itens. Use "ok" para pontos positivos, "warning" para melhorias sugeridas, "error" para pontos críticos ausentes.
As mensagens devem ser diretas e acionáveis, ex: "Adicione verbos de ação nas descrições de experiência".`;
}

function getCorNota(nota: number) {
  if (nota >= 80) return { texto: "text-emerald-500", barra: "bg-emerald-500", label: "Excelente" };
  if (nota >= 60) return { texto: "text-primary", barra: "bg-primary", label: "Bom" };
  if (nota >= 40) return { texto: "text-amber-500", barra: "bg-amber-500", label: "Regular" };
  return { texto: "text-red-500", barra: "bg-red-500", label: "Precisa melhorar" };
}

function IconeStatus({ status }: { status: ATSItem["status"] }) {
  if (status === "ok") return <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />;
  if (status === "warning") return <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />;
  return <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />;
}

export function ATSAnalyzer({ data, spend, onShowCredits, uid }: ATSAnalyzerProps) {
  const [result, setResult] = useState<ATSResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [animatedNota, setAnimatedNota] = useState(0);
  const [usedFreeAnalysis, setUsedFreeAnalysis] = useState(false);
  const hasAnalyzed = useRef(false);

  // Verifica se já usou a análise grátis
  useEffect(() => {
    if (!uid) return;
    const key = `ats_free_used_${uid}`;
    const used = localStorage.getItem(key) === "true";
    setUsedFreeAnalysis(used);
  }, [uid]);

  // Analisa automaticamente quando o componente monta
  useEffect(() => {
    if (hasAnalyzed.current) return;
    hasAnalyzed.current = true;
    analyze();
  }, []);

  // Anima o número da nota ao receber resultado
  useEffect(() => {
    if (!result) return;
    let current = 0;
    const target = result.nota;
    const step = Math.ceil(target / 40);
    const interval = setInterval(() => {
      current = Math.min(current + step, target);
      setAnimatedNota(current);
      if (current >= target) clearInterval(interval);
    }, 20);
    return () => clearInterval(interval);
  }, [result]);

  async function analyze() {
    // Se não é a primeira análise, cobra crédito
    if (usedFreeAnalysis) {
      const ok = await spend("ATS_ANALYSIS");
      if (!ok) {
        onShowCredits();
        return;
      }
    }

    const apiKey = import.meta.env.VITE_GROQ_API_KEY as string | undefined;
    if (!apiKey) { setError("Chave da API não configurada."); return; }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [{ role: "user", content: buildPrompt(data) }],
          temperature: 0.3,
          max_tokens: 600,
        }),
      });

      if (!response.ok) throw new Error("Erro na API");

      const json = await response.json();
      const texto: string = json?.choices?.[0]?.message?.content || "";

      // Extrai o JSON mesmo se vier com texto ao redor
      const match = texto.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("Resposta inválida da IA");

      const parsed: ATSResult = JSON.parse(match[0]);
      setResult(parsed);
      trackATSAnalyzed(parsed.nota);
      
      // Marca que usou a análise grátis
      if (!usedFreeAnalysis && uid) {
        localStorage.setItem(`ats_free_used_${uid}`, "true");
        setUsedFreeAnalysis(true);
      }
    } catch (err: unknown) {
      setError("Não foi possível analisar o currículo. Tente recarregar a página.");
    } finally {
      setLoading(false);
    }
  }

  const cor = result ? getCorNota(result.nota) : null;

  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-4">

      {/* Cabeçalho */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-semibold text-foreground text-sm">Análise ATS</h3>
          {!usedFreeAnalysis && (
            <span className="text-[10px] font-bold bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 px-1.5 py-0.5 rounded-full">
              1ª GRÁTIS
            </span>
          )}
          {usedFreeAnalysis && (
            <span className="text-[10px] font-bold bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300 px-1.5 py-0.5 rounded-full">
              1 crédito
            </span>
          )}
        </div>
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          Baseada nos critérios reais dos sistemas Gupy, Kenoby e Workday.
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center gap-3 py-4">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Analisando seu currículo...</span>
        </div>
      )}

      {/* Erro */}
      {error && (
        <p className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-md">{error}</p>
      )}

      {result && cor && (
        <div className="space-y-4">

          {/* Nota + barra */}
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 text-center">
              <span className={`text-3xl font-bold tabular-nums ${cor.texto}`}>
                {animatedNota}
              </span>
              <span className="text-sm text-muted-foreground">/100</span>
              <p className={`text-[10px] font-semibold mt-0.5 ${cor.texto}`}>{cor.label}</p>
            </div>
            <div className="flex-1 space-y-1">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${cor.barra}`}
                  style={{ width: `${animatedNota}%` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">{result.resumo}</p>
            </div>
          </div>

          <div className="border-t border-border" />

          {/* Lista de itens */}
          <ul className="space-y-1.5">
            {result.itens.map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <IconeStatus status={item.status} />
                <span className="text-[11px] text-foreground leading-relaxed">{item.mensagem}</span>
              </li>
            ))}
          </ul>

        </div>
      )}
    </div>
  );
}