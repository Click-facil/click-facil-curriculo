import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Upload, Sparkles, Lock } from "lucide-react";
import { ResumeData } from "@/types/resume";

interface LinkedInImporterProps {
  onImport: (data: Partial<ResumeData>) => void;
  isPremium: boolean;
  onUnlock: () => void;
}

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

const EXTRACTION_PROMPT = `Você é um assistente especializado em extrair dados estruturados de perfis do LinkedIn.

Analise o texto do perfil LinkedIn fornecido e extraia as seguintes informações no formato JSON EXATO abaixo.
IMPORTANTE: Retorne APENAS o JSON válido, sem explicações, sem markdown, sem \`\`\`json.

Formato esperado:
{
  "personalInfo": {
    "fullName": "Nome completo",
    "objective": "Resumo profissional ou headline"
  },
  "experience": [
    {
      "company": "Nome da empresa",
      "position": "Cargo",
      "startDate": "MM/AAAA",
      "endDate": "MM/AAAA ou vazio se atual",
      "current": true ou false,
      "description": "Descrição das atividades",
      "city": "Cidade"
    }
  ],
  "education": [
    {
      "institution": "Nome da instituição",
      "course": "Nome do curso",
      "degree": "Graduação/Pós/etc",
      "startDate": "MM/AAAA",
      "endDate": "MM/AAAA ou vazio se atual",
      "current": true ou false
    }
  ],
  "skills": [
    {
      "name": "Nome da habilidade",
      "level": "Intermediário"
    }
  ]
}

Regras:
- Se não encontrar alguma informação, use string vazia "" ou array vazio []
- Para datas, use formato MM/AAAA
- Para skills sem nível definido, use "Intermediário"
- Não invente informações que não estão no texto
- Retorne APENAS o JSON, nada mais

Texto do perfil LinkedIn:`;

export function LinkedInImporter({ onImport, isPremium, onUnlock }: LinkedInImporterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [linkedinText, setLinkedinText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const extractData = async () => {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;

    if (!apiKey) {
      setError("API não configurada. Contate o suporte.");
      return;
    }

    if (linkedinText.trim().length < 50) {
      setError("Cole um texto mais completo do seu perfil LinkedIn.");
      return;
    }

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
          model: "llama-3.1-70b-versatile",
          messages: [
            {
              role: "user",
              content: `${EXTRACTION_PROMPT}\n\n${linkedinText}`,
            },
          ],
          temperature: 0.3,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao processar dados. Tente novamente.");
      }

      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content;

      if (!content) throw new Error("Resposta vazia da IA");

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : content;
      const extracted = JSON.parse(jsonStr);

      const resumeData: Partial<ResumeData> = {
        personalInfo: {
          fullName: extracted.personalInfo?.fullName || "",
          email: "",
          phone: "",
          address: "",
          city: "",
          state: "",
          linkedin: "",
          objective: extracted.personalInfo?.objective || "",
          photo: null,
          photoPositionX: 50,
          photoPositionY: 50,
          photoZoom: 100,
        },
        experience: (extracted.experience || []).map((exp: any, idx: number) => ({
          id: `exp-${Date.now()}-${idx}`,
          company: exp.company || "",
          city: exp.city || "",
          position: exp.position || "",
          startDate: exp.startDate || "",
          endDate: exp.endDate || "",
          current: exp.current || false,
          description: exp.description || "",
        })),
        education: (extracted.education || []).map((edu: any, idx: number) => ({
          id: `edu-${Date.now()}-${idx}`,
          institution: edu.institution || "",
          course: edu.course || "",
          degree: edu.degree || "",
          startDate: edu.startDate || "",
          endDate: edu.endDate || "",
          current: edu.current || false,
        })),
        skills: (extracted.skills || []).map((skill: any, idx: number) => ({
          id: `skill-${Date.now()}-${idx}`,
          name: skill.name || "",
          level: skill.level || "Intermediário",
        })),
      };

      onImport(resumeData);
      setIsOpen(false);
      setLinkedinText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao processar dados");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button 
        onClick={() => isPremium ? setIsOpen(true) : onUnlock()} 
        variant="outline"
        className="gap-2 hidden"
        size="sm"
      >
        {!isPremium && <Lock className="h-4 w-4" />}
        {isPremium ? <Upload className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
        <span className="hidden sm:inline">Importar do LinkedIn</span>
        <span className="sm:hidden">LinkedIn</span>
        {!isPremium && <span className="text-xs opacity-70 ml-1 hidden md:inline">Premium</span>}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Importar Perfil do LinkedIn
            </DialogTitle>
            <DialogDescription>
              Cole o texto do seu perfil LinkedIn completo. A IA irá extrair automaticamente
              suas informações profissionais.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Textarea
              placeholder="Cole aqui todo o texto do seu perfil LinkedIn (nome, cargo, experiências, formação, habilidades...)&#10;&#10;Exemplo:&#10;João Silva&#10;Desenvolvedor Full Stack | React | Node.js&#10;&#10;Experiência:&#10;Empresa XYZ - Desenvolvedor Senior&#10;Jan 2020 - Presente&#10;..."
              value={linkedinText}
              onChange={(e) => setLinkedinText(e.target.value)}
              className="min-h-[300px] font-mono text-sm"
              disabled={loading}
            />

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button onClick={extractData} disabled={loading || linkedinText.length < 50}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Importar Dados
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
