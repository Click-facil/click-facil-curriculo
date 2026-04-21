import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Upload, Sparkles, Lock, CheckCircle2, AlertCircle, HelpCircle } from "lucide-react";
import { ResumeData } from "@/types/resume";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

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
  const [preview, setPreview] = useState<any>(null);
  const [showTutorial, setShowTutorial] = useState(false);

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

      // Gerar preview antes de importar
      setPreview({
        name: extracted.personalInfo?.fullName || "Não detectado",
        objective: extracted.personalInfo?.objective || "Não detectado",
        experienceCount: extracted.experience?.length || 0,
        educationCount: extracted.education?.length || 0,
        skillsCount: extracted.skills?.length || 0,
        rawData: extracted, // Guardar dados para importação posterior
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao processar dados");
    } finally {
      setLoading(false);
    }
  };

  const confirmImport = () => {
    if (!preview?.rawData) return;

    const extracted = preview.rawData;

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
    setPreview(null);
  };

  const handleTextChange = (text: string) => {
    setLinkedinText(text);
    setError(null);
    setPreview(null);
  };

  return (
    <>
      <Button 
        onClick={() => isPremium ? setIsOpen(true) : onUnlock()} 
        variant="outline"
        className="gap-2"
        size="sm"
      >
        {!isPremium && <Lock className="h-4 w-4" />}
        {isPremium ? <Upload className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
        <span className="hidden sm:inline">Importar do LinkedIn</span>
        <span className="sm:hidden">LinkedIn</span>
        {!isPremium && <span className="text-xs opacity-70 ml-1 hidden md:inline">Premium</span>}
      </Button>

      <Dialog open={isOpen} onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          setLinkedinText("");
          setError(null);
          setPreview(null);
          setShowTutorial(false);
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Importar Perfil do LinkedIn
            </DialogTitle>
            <DialogDescription>
              Cole todo o texto do seu perfil LinkedIn. A IA irá extrair automaticamente suas informações.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Tutorial colapsável */}
            <Collapsible open={showTutorial} onOpenChange={setShowTutorial}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground">
                  <HelpCircle className="h-4 w-4" />
                  {showTutorial ? "Ocultar tutorial" : "Como copiar meu perfil do LinkedIn?"}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3 pt-3">
                <div className="bg-muted/50 rounded-lg p-4 space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-semibold text-xs">1</div>
                    <div>
                      <p className="font-medium">Abra seu perfil no LinkedIn</p>
                      <p className="text-muted-foreground text-xs mt-1">Acesse linkedin.com/in/seu-perfil</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-semibold text-xs">2</div>
                    <div>
                      <p className="font-medium">Selecione todo o conteúdo</p>
                      <p className="text-muted-foreground text-xs mt-1">
                        Pressione <kbd className="px-1.5 py-0.5 bg-background border rounded text-xs">Ctrl+A</kbd> (Windows) ou <kbd className="px-1.5 py-0.5 bg-background border rounded text-xs">Cmd+A</kbd> (Mac)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-semibold text-xs">3</div>
                    <div>
                      <p className="font-medium">Copie o texto</p>
                      <p className="text-muted-foreground text-xs mt-1">
                        Pressione <kbd className="px-1.5 py-0.5 bg-background border rounded text-xs">Ctrl+C</kbd> (Windows) ou <kbd className="px-1.5 py-0.5 bg-background border rounded text-xs">Cmd+C</kbd> (Mac)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-semibold text-xs">4</div>
                    <div>
                      <p className="font-medium">Cole aqui embaixo</p>
                      <p className="text-muted-foreground text-xs mt-1">
                        Pressione <kbd className="px-1.5 py-0.5 bg-background border rounded text-xs">Ctrl+V</kbd> no campo abaixo
                      </p>
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
            <div className="relative">
              <Textarea
                placeholder="Cole aqui todo o texto do seu perfil LinkedIn...&#10;&#10;Exemplo:&#10;João Silva&#10;Desenvolvedor Full Stack | React | Node.js&#10;&#10;Sobre&#10;Profissional com 5 anos de experiência...&#10;&#10;Experiência&#10;Empresa XYZ - Desenvolvedor Senior&#10;jan de 2020 - Presente (3 anos)&#10;São Paulo, Brasil&#10;- Desenvolvimento de aplicações web...&#10;&#10;Formação acadêmica&#10;Universidade Federal - Ciência da Computação&#10;2015 - 2019&#10;&#10;Competências&#10;JavaScript • React • Node.js • TypeScript..."
                value={linkedinText}
                onChange={(e) => handleTextChange(e.target.value)}
                className="min-h-[280px] font-mono text-sm resize-none"
                disabled={loading}
              />
              {linkedinText.length > 0 && (
                <div className="absolute bottom-2 right-2 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
                  {linkedinText.length} caracteres
                </div>
              )}
            </div>

            {/* Validação em tempo real */}
            {linkedinText.length > 0 && linkedinText.length < 50 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Cole um texto mais completo do seu perfil (mínimo 50 caracteres)
                </AlertDescription>
              </Alert>
            )}

            {linkedinText.length >= 50 && !preview && !loading && (
              <Alert className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertDescription className="text-green-800 dark:text-green-200">
                  Texto detectado! Clique em "Analisar Dados" para continuar.
                </AlertDescription>
              </Alert>
            )}

            {/* Preview dos dados extraídos */}
            {preview && (
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Dados detectados:
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Nome</p>
                    <p className="font-medium truncate">{preview.name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Objetivo</p>
                    <p className="font-medium truncate">{preview.objective}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Experiências</p>
                    <p className="font-medium">{preview.experienceCount} encontrada(s)</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Formações</p>
                    <p className="font-medium">{preview.educationCount} encontrada(s)</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Habilidades</p>
                    <p className="font-medium">{preview.skillsCount} encontrada(s)</p>
                  </div>
                </div>
                <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
                  <AlertDescription className="text-blue-800 dark:text-blue-200 text-xs">
                    ✨ Revise os dados detectados e clique em "Confirmar Importação" para preencher seu currículo automaticamente.
                  </AlertDescription>
                </Alert>
              </div>
            )}

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
              {!preview ? (
                <Button 
                  onClick={extractData} 
                  disabled={loading || linkedinText.length < 50}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analisando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Analisar Dados
                    </>
                  )}
                </Button>
              ) : (
                <Button onClick={confirmImport} className="bg-green-600 hover:bg-green-700">
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Confirmar Importação
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
