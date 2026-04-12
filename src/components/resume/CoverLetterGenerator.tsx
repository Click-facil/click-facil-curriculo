import { useState, useRef } from "react";
import { Sparkles, Loader2, Copy, Check, Lock, RefreshCw, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResumeData } from "@/types/resume";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const COOLDOWN_SEGUNDOS = 8;

interface CoverLetterGeneratorProps {
  data: ResumeData;
  isPremium: boolean;
  isAdmin: boolean;
  onUnlock: () => void;
}

function buildPrompt(data: ResumeData): string {
  const { personalInfo, experience, education, skills } = data;

  const experienciaTexto = experience.length > 0
    ? experience.map((e) =>
        `- ${e.position} na empresa ${e.company} (${e.city})${e.description ? `: ${e.description}` : ""}`
      ).join("\n")
    : "Sem experiência profissional listada.";

  const formacaoTexto = education.length > 0
    ? education.map((e) => `- ${e.course} em ${e.institution}`).join("\n")
    : "Sem formação listada.";

  const habilidadesTexto = skills.length > 0
    ? skills.map((s) => s.name).join(", ")
    : "Não informadas.";

  return `Você é um especialista em RH e redação profissional em português brasileiro.
Escreva uma carta de apresentação profissional e persuasiva para o candidato abaixo.
A carta deve ser direta, em tom profissional mas humano, com no máximo 4 parágrafos curtos.
Estrutura: abertura com interesse na vaga → resumo da experiência → habilidades relevantes → encerramento com disponibilidade.
Não mencione o nome de nenhuma empresa específica para a qual está se candidatando (deixe genérico).
Retorne APENAS o texto da carta, sem título, sem "Assunto:", sem explicações e sem formatação markdown.

DADOS DO CANDIDATO:
Nome: ${personalInfo.fullName}
Cidade: ${personalInfo.city} - ${personalInfo.state}
Objetivo profissional: ${personalInfo.objective || "Não informado"}

Experiências:
${experienciaTexto}

Formação:
${formacaoTexto}

Habilidades: ${habilidadesTexto}`;
}

export function CoverLetterGenerator({ data, isPremium, isAdmin, onUnlock }: CoverLetterGeneratorProps) {
  const [carta, setCarta] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const temAcesso = isPremium || isAdmin;
  const emCooldown = cooldown > 0;

  function iniciarCooldown() {
    setCooldown(COOLDOWN_SEGUNDOS);
    intervalRef.current = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) { clearInterval(intervalRef.current!); return 0; }
        return c - 1;
      });
    }, 1000);
  }

  async function handleGerar() {
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
          temperature: 0.75,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err?.error?.message || "Erro na API");
      }

      const json = await response.json();
      const resultado: string = json?.choices?.[0]?.message?.content;
      if (!resultado) throw new Error("Resposta vazia da IA");

      setCarta(resultado.trim());
      iniciarCooldown();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao gerar carta.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopiar() {
    if (!carta) return;
    await navigator.clipboard.writeText(carta);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  // --- ESTADO: sem acesso premium ---
  if (!temAcesso) {
    return (
      <div className="rounded-xl border border-border bg-card p-5 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Lock className="w-4 h-4 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
            <Mail className="w-3.5 h-3.5 text-muted-foreground" /> Carta de Apresentação
            <span className="text-[10px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">PREMIUM</span>
          </h3>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          A IA gera uma carta profissional baseada no seu currículo, pronta para colar no corpo do e-mail ao enviar seu CV para recrutadores.
        </p>
        <p className="text-xs text-muted-foreground">
          Disponível no <strong className="text-foreground">plano premium</strong> junto com todos os templates exclusivos.
        </p>
        <Button
          size="sm"
          className="w-full bg-amber-500 hover:bg-amber-600 text-white"
          onClick={onUnlock}
        >
          Desbloquear por R$&nbsp;9,90
        </Button>
      </div>
    );
  }

  // --- ESTADO: tem acesso premium ---
  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-4">
      {/* Cabeçalho */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-bold text-foreground text-base flex items-center gap-2">
            <Mail className="w-4 h-4 text-muted-foreground" /> Carta de Apresentação com IA
            <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">PREMIUM</span>
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            A IA gera uma carta profissional baseada no seu currículo, pronta para você{" "}
            <strong>copiar e colar no corpo do e-mail</strong> ao enviar seu CV para recrutadores.
          </p>
        </div>
      </div>

      {/* Botão gerar */}
      <div className="flex items-center gap-3">
        <Button
          type="button"
          onClick={handleGerar}
          disabled={loading || emCooldown}
          className="gap-2"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : carta ? (
            <RefreshCw className="w-4 h-4" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          {loading ? "Gerando carta..." : carta ? "Gerar nova versão" : "Gerar carta com IA"}
        </Button>
        {emCooldown && (
          <span className="text-xs text-muted-foreground tabular-nums">
            Aguarde {cooldown}s...
          </span>
        )}
      </div>

      {/* Erro */}
      {error && (
        <p className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-md">
          ⚠️ {error}
        </p>
      )}

      {/* Resultado */}
      {carta && (
        <div className="space-y-3">
          {/* Instrução de uso */}
          <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800">
            <span className="text-blue-600 dark:text-blue-400 text-lg">💡</span>
            <p className="text-xs text-blue-800 dark:text-blue-300">
              <strong>Como usar:</strong> clique em "Copiar texto" e cole diretamente no corpo do e-mail ao enviar seu currículo. Personalize o nome do recrutador se souber.
            </p>
          </div>

          {/* Texto da carta */}
          <div className="relative">
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap font-sans">
                {carta}
              </p>
            </div>
          </div>

          {/* Botão copiar */}
          <div className="flex justify-end">
            <Button
              type="button"
              variant={copied ? "default" : "outline"}
              size="sm"
              onClick={handleCopiar}
              className="gap-2 transition-all"
            >
              {copied ? (
                <><Check className="w-4 h-4" /> Copiado!</>
              ) : (
                <><Copy className="w-4 h-4" /> Copiar texto</>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}