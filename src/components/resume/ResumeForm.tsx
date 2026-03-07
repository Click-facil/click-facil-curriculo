import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Download, Eye, EyeOff, FileText, Save, Palette, Mail, Info } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { ResumeData, emptyResume } from "@/types/resume";
import StepIndicator from "./StepIndicator";
import PersonalInfoStep from "./PersonalInfoStep";
import EducationStep from "./EducationStep";
import ExperienceStep from "./ExperienceStep";
import CoursesStep from "./CoursesStep";
import SkillsStep from "./SkillsStep";
import ResumePreview from "./ResumePreview";
import OnboardingTour from "./OnboardingTour";
import { toast } from "sonner";
import { exportToDocx } from "@/lib/docx-export";

const STEPS = ["Dados Pessoais", "Formação", "Experiência", "Cursos", "Habilidades", "Finalizar"];
const STORAGE_KEY = "clickfacil_resume_data";
const TEMPLATE_KEY = "clickfacil_template";

export type TemplateStyle = "modern" | "classic" | "minimal" | "creative" | "executive";

const TEMPLATES: { id: TemplateStyle; name: string; description: string }[] = [
  { id: "modern", name: "Moderno", description: "Sidebar lateral com ícones" },
  { id: "classic", name: "Clássico", description: "Coluna única, serifado e formal" },
  { id: "minimal", name: "Minimalista", description: "Flat design, clean e direto" },
  { id: "creative", name: "Criativo", description: "Colorido e ousado" },
  { id: "executive", name: "Executivo", description: "Elegante e sofisticado" },
];

const ResumeForm = () => {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<ResumeData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : emptyResume;
    } catch {
      return emptyResume;
    }
  });
  const [generating, setGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [template, setTemplate] = useState<TemplateStyle>(() => {
    return (localStorage.getItem(TEMPLATE_KEY) as TemplateStyle) || "modern";
  });
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        setLastSaved(new Date());
      } catch { /* ignore */ }
    }, 1000);
    return () => clearTimeout(timeout);
  }, [data]);

  useEffect(() => {
    localStorage.setItem(TEMPLATE_KEY, template);
  }, [template]);

  const getProgress = useCallback(() => {
    let filled = 0;
    let total = 6;
    const pi = data.personalInfo;
    if (pi.fullName) filled++;
    if (pi.email) filled++;
    if (pi.phone) filled++;
    if (pi.city) filled++;
    if (pi.state) filled++;
    if (pi.objective) filled++;
    if (data.education.length > 0) { filled++; } total++;
    if (data.experience.length > 0) { filled++; } total++;
    if (data.skills.length > 0) { filled++; } total++;
    return Math.round((filled / total) * 100);
  }, [data]);

  const next = () => {
    if (step === 0) {
      const { fullName, email, phone, city, state, objective } = data.personalInfo;
      if (!fullName || !email || !phone || !city || !state || !objective) {
        toast.error("Preencha todos os campos obrigatórios (*) antes de continuar.");
        return;
      }
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const handleDownload = async () => {
    setGenerating(true);
    try {
      const element = document.getElementById("resume-preview");
      if (!element) {
        toast.error("Prévia não encontrada. Tente novamente.");
        return;
      }

      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#ffffff",
        logging: false,
        imageTimeout: 0,
      });

      const imgData = canvas.toDataURL("image/png", 1.0);
      const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });

      const pdfW = 210;
      const pdfH = 297;
      const imgW = pdfW;
      const imgH = (canvas.height * pdfW) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgW, imgH);

      const fileName = `curriculo-${data.personalInfo.fullName.replace(/\s+/g, "-").toLowerCase() || "meu"}.pdf`;
      pdf.save(fileName);

      toast.success("Currículo baixado com sucesso!");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao gerar PDF. Tente novamente.");
    } finally {
      setGenerating(false);
    }
  };

  const handleDocxDownload = async () => {
    setGenerating(true);
    try {
      await exportToDocx(data, template);
      toast.success("Currículo DOCX baixado com sucesso!");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao gerar DOCX. Tente novamente.");
    } finally {
      setGenerating(false);
    }
  };

  const handleClearData = () => {
    if (window.confirm("Tem certeza que deseja limpar todos os dados e começar de novo?")) {
      setData(emptyResume);
      setStep(0);
      localStorage.removeItem(STORAGE_KEY);
      toast.success("Dados limpos com sucesso!");
    }
  };

  const progress = getProgress();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <OnboardingTour />

      {/* Header */}
      <header className="bg-hero text-primary-foreground py-6 shadow-elevated">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold font-display">
                Click Fácil <span className="font-normal opacity-80">| Gerador de Currículo</span>
              </h1>
              <p className="text-sm opacity-70 mt-1">Crie seu currículo profissional em minutos</p>
            </div>
            <div className="flex items-center gap-2">
              {lastSaved && (
                <span className="text-xs opacity-50 hidden sm:flex items-center gap-1">
                  <Save className="w-3 h-3" /> Salvo automaticamente
                </span>
              )}
              <ThemeToggle />
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs opacity-80 mb-1">
              <span>Progresso do currículo</span>
              <span className="font-semibold">{progress}%</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${progress}%`,
                  background: progress === 100 ? "#48bb78" : "linear-gradient(90deg, #63b3ed, #4299e1)",
                }}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 py-8 flex-1">
        {step < STEPS.length - 1 ? (
          <div className={`flex gap-6 ${showPreview ? "flex-col lg:flex-row" : ""}`}>
            <div className={showPreview ? "lg:w-1/2" : "w-full"}>
              <StepIndicator steps={STEPS} currentStep={step} />

              <div className="bg-card rounded-xl shadow-card p-6 md:p-8 border border-border">
                {step === 0 && (
                  <PersonalInfoStep data={data.personalInfo} onChange={(personalInfo) => setData({ ...data, personalInfo })} />
                )}
                {step === 1 && (
                  <EducationStep data={data.education} onChange={(education) => setData({ ...data, education })} />
                )}
                {step === 2 && (
                  <ExperienceStep data={data.experience} onChange={(experience) => setData({ ...data, experience })} />
                )}
                {step === 3 && (
                  <CoursesStep data={data.courses} onChange={(courses) => setData({ ...data, courses })} />
                )}
                {step === 4 && (
                  <SkillsStep
                    skills={data.skills}
                    languages={data.languages}
                    onSkillsChange={(skills) => setData({ ...data, skills })}
                    onLanguagesChange={(languages) => setData({ ...data, languages })}
                  />
                )}

                {/* Navigation */}
                <div className="flex justify-between mt-8 pt-6 border-t border-border">
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={prev} disabled={step === 0}>
                      <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowPreview(!showPreview)}
                      title={showPreview ? "Ocultar prévia" : "Ver prévia em tempo real"}
                      className="hidden lg:flex"
                    >
                      {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                  <Button onClick={next}>
                    {step === STEPS.length - 2 ? (
                      <><Eye className="w-4 h-4 mr-2" /> Visualizar Currículo</>
                    ) : (
                      <>Próximo <ArrowRight className="w-4 h-4 ml-2" /></>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Live preview panel - desktop only */}
            {showPreview && (
              <div className="lg:w-1/2 hidden lg:block">
                <div className="sticky top-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-muted-foreground">📄 Prévia em Tempo Real</h3>
                  </div>
                  <div
                    className="border border-border rounded-xl overflow-hidden shadow-card"
                    style={{ transform: "scale(0.65)", transformOrigin: "top left", width: "153.8%", height: "auto" }}
                  >
                    <ResumePreview data={data} template={template} />
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Final step - Preview & Download */
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold font-display text-foreground">Seu Currículo está Pronto! 🎉</h2>
                <p className="text-muted-foreground">Revise e faça o download em PDF ou DOCX</p>
              </div>
              <div className="flex gap-2 flex-wrap justify-center">
                <Button variant="outline" onClick={prev}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Editar
                </Button>
                <Button variant="outline" onClick={handleDocxDownload} disabled={generating}>
                  <FileText className="w-4 h-4 mr-2" /> DOCX
                </Button>
                <Button onClick={handleDownload} disabled={generating}>
                  <Download className="w-4 h-4 mr-2" />
                  {generating ? "Gerando..." : "Baixar PDF"}
                </Button>
              </div>
            </div>

            {/* Template selector */}
            <div className="flex flex-wrap gap-3 items-center">
              <Palette className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground font-medium">Template:</span>
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTemplate(t.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                    template === t.id
                      ? "bg-primary text-primary-foreground border-primary shadow-glow"
                      : "bg-card text-foreground border-border hover:border-primary/50"
                  }`}
                >
                  {t.name}
                  <span className="block text-[10px] opacity-70">{t.description}</span>
                </button>
              ))}
            </div>

            {/* Actions row */}
            <div className="flex justify-end">
              <Button variant="ghost" size="sm" onClick={handleClearData} className="text-destructive hover:text-destructive">
                Limpar tudo e recomeçar
              </Button>
            </div>

            {/* Preview — mobile: scroll horizontal livre; desktop: normal */}
            <div className="w-full overflow-x-auto pb-8 -mx-4 px-4">
              <div className="min-w-[794px]">
                <ResumePreview data={data} template={template} />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ===== FOOTER: Conheça o Click Fácil / Fale Conosco ===== */}
      <footer className="bg-hero text-primary-foreground mt-12">
        {/* About strip */}
        <div className="container max-w-6xl mx-auto px-4 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Brand */}
            <div>
              <h3 className="text-lg font-bold font-display mb-2">Click Fácil</h3>
              <p className="text-sm opacity-75 leading-relaxed">
                Criamos ferramentas simples e gratuitas para ajudar você a conquistar seu próximo emprego.
                Rápido, bonito e sem complicação.
              </p>
            </div>

            {/* Como funciona */}
            <div>
              <h3 className="text-base font-semibold font-display mb-3 flex items-center gap-2">
                <Info className="w-4 h-4" /> Como funciona
              </h3>
              <ul className="space-y-1 text-sm opacity-75">
                <li>✅ 100% gratuito, sem cadastro</li>
                <li>✅ Dados salvos no seu navegador</li>
                <li>✅ Download em PDF e DOCX</li>
                <li>✅ 5 templates profissionais</li>
                <li>✅ Funciona no celular e no computador</li>
              </ul>
            </div>

            {/* Fale conosco */}
            <div>
              <h3 className="text-base font-semibold font-display mb-3 flex items-center gap-2">
                <Mail className="w-4 h-4" /> Fale Conosco
              </h3>
              <p className="text-sm opacity-75 mb-3">
                Sugestões, dúvidas ou problemas? Manda um e-mail, respondemos rápido!
              </p>
              <a
                href="mailto:contato@clickfacil.com.br"
                className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 transition-colors px-4 py-2 rounded-lg text-sm font-medium"
              >
                <Mail className="w-4 h-4" />
                contato@clickfacil.com.br
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10">
          <div className="container max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs opacity-50">
            <span>© {new Date().getFullYear()} Click Fácil. Todos os direitos reservados.</span>
            <span>Feito com ❤️ para quem busca uma oportunidade</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ResumeForm;