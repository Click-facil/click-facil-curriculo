import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, ArrowRight, Download, Eye, EyeOff, FileText,
  Save, Palette, Mail, Info, Lock, LogOut, User,
} from "lucide-react";
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
import AuthModal from "./AuthModal";
import CheckoutModal from "./CheckoutModal";
import { toast } from "sonner";
import { exportToDocx } from "@/lib/docx-export";
import { auth, onAuthChange, logout, checkPremium, grantPremium } from "@/lib/firebase";
import type { User as FirebaseUser } from "firebase/auth";

const STEPS = ["Dados Pessoais", "Formação", "Experiência", "Cursos", "Habilidades", "Finalizar"];
const STORAGE_KEY = "clickfacil_resume_data";
const TEMPLATE_KEY = "clickfacil_template";

export type TemplateStyle = "modern" | "classic" | "minimal" | "creative" | "executive";

const TEMPLATES: { id: TemplateStyle; name: string; description: string; free: boolean }[] = [
  { id: "classic",   name: "Clássico",    description: "Coluna única, serifado e formal", free: true  },
  { id: "minimal",   name: "Minimalista", description: "Flat design, clean e direto",     free: true  },
  { id: "modern",    name: "Moderno",     description: "Sidebar lateral com ícones",      free: false },
  { id: "creative",  name: "Criativo",    description: "Colorido e ousado",               free: false },
  { id: "executive", name: "Executivo",   description: "Elegante e sofisticado",          free: false },
];

const PREMIUM_TEMPLATES: TemplateStyle[] = ["modern", "creative", "executive"];

/**
 * ⚠️  ADMIN: adicione aqui os UIDs do Firebase dos usuários admin.
 * Para descobrir o seu UID após logar no site:
 *   Abra o console do browser (F12) e cole:
 *   (await import('https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js')).getAuth().currentUser?.uid
 *   OU veja no Firebase Console → Authentication → Users
 */
const ADMIN_UIDS: string[] = [
    "VC84FK6HWsfVBCVCt43OK6xw9x43",
];

const ResumeForm = () => {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<ResumeData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : emptyResume;
    } catch { return emptyResume; }
  });
  const [generating, setGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [template, setTemplate] = useState<TemplateStyle>(
    () => (localStorage.getItem(TEMPLATE_KEY) as TemplateStyle) || "classic"
  );
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // ── Auth / premium ──────────────────────────────────────────────────────────
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthChange(async (u) => {
      setUser(u);
      if (u) {
        const admin = ADMIN_UIDS.includes(u.uid);
        setIsAdmin(admin);
        if (admin) {
          setIsPremium(true);
        } else {
          const premium = await checkPremium(u.uid);
          setIsPremium(premium);
        }
      } else {
        setIsAdmin(false);
        setIsPremium(false);
      }
    });
    return unsub;
  }, []);

  // Detecta retorno do MP (?payment=success) — fallback para cartão
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("payment") === "success" && user && !isAdmin) {
      grantPremium(user.uid).then(() => {
        setIsPremium(true);
        toast.success("🎉 Pagamento confirmado! Acesso premium liberado.");
        window.history.replaceState({}, "", "/");
      });
    }
  }, [user, isAdmin]);

  // Autosave
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        setLastSaved(new Date());
      } catch { /* ignore */ }
    }, 1000);
    return () => clearTimeout(t);
  }, [data]);

  useEffect(() => { localStorage.setItem(TEMPLATE_KEY, template); }, [template]);

  // ── Helpers ─────────────────────────────────────────────────────────────────

  const hasAccess = useCallback((t: TemplateStyle) => {
    if (!PREMIUM_TEMPLATES.includes(t)) return true;
    if (isAdmin) return true;
    if (isPremium) return true;
    return false;
  }, [isAdmin, isPremium]);

  const requireAccess = (action: string): boolean => {
    if (!user) {
      setPendingAction(action);
      setShowAuth(true);
      return false;
    }
    if (!isPremium && !isAdmin) {
      setPendingAction(action);
      setShowCheckout(true);
      return false;
    }
    return true;
  };

  const handleAuthSuccess = async () => {
    setShowAuth(false);
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    const admin = ADMIN_UIDS.includes(currentUser.uid);
    setIsAdmin(admin);
    if (admin) {
      setIsPremium(true);
      executePendingAction();
      return;
    }
    const premium = await checkPremium(currentUser.uid);
    setIsPremium(premium);
    if (!premium) {
      setShowCheckout(true);
    } else {
      executePendingAction();
    }
  };

  const handleCheckoutSuccess = () => {
    setShowCheckout(false);
    setIsPremium(true);
    toast.success("🎉 Acesso premium liberado!");
    executePendingAction();
  };

  const executePendingAction = () => {
    if (!pendingAction) return;
    if (pendingAction === "download-pdf") handleDownload(true);
    if (pendingAction === "download-docx") handleDocxDownload(true);
    if (pendingAction?.startsWith("select-template:")) {
      setTemplate(pendingAction.split(":")[1] as TemplateStyle);
    }
    setPendingAction(null);
  };

  const handleSelectTemplate = (t: TemplateStyle) => {
    if (!hasAccess(t)) {
      setPendingAction(`select-template:${t}`);
      if (!user) { setShowAuth(true); } else { setShowCheckout(true); }
      return;
    }
    setTemplate(t);
  };

  const getProgress = useCallback(() => {
    let filled = 0;
    const pi = data.personalInfo;
    if (pi.fullName) filled++;
    if (pi.email) filled++;
    if (pi.phone) filled++;
    if (pi.city) filled++;
    if (pi.state) filled++;
    if (pi.objective) filled++;
    if (data.education.length > 0) filled++;
    if (data.experience.length > 0) filled++;
    if (data.skills.length > 0) filled++;
    return Math.round((filled / 9) * 100);
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

  // ── Downloads ────────────────────────────────────────────────────────────────

  const handleDownload = async (skipCheck = false) => {
    if (!skipCheck && !hasAccess(template)) {
      requireAccess("download-pdf");
      return;
    }
    setGenerating(true);
    try {
      const element = document.getElementById("resume-preview");
      if (!element) { toast.error("Prévia não encontrada."); return; }
      await document.fonts.ready;
      await new Promise((r) => setTimeout(r, 300));
      const domtoimage = (await import("dom-to-image-more")).default;
      const { jsPDF } = await import("jspdf");
      const scale = 3;
      const imgData = await domtoimage.toPng(element, {
        width: element.offsetWidth * scale,
        height: element.offsetHeight * scale,
        style: {
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          width: `${element.offsetWidth}px`,
          height: `${element.offsetHeight}px`,
        },
      });
      const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
      const pdfW = 210;
      const pdfH = (element.offsetHeight * pdfW) / element.offsetWidth;
      pdf.addImage(imgData, "PNG", 0, 0, pdfW, pdfH);
      const name = data.personalInfo.fullName.replace(/\s+/g, "-").toLowerCase() || "meu";
      pdf.save(`curriculo-${name}.pdf`);
      toast.success("Currículo baixado com sucesso!");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao gerar PDF.");
    } finally {
      setGenerating(false);
    }
  };

  const handleDocxDownload = async (skipCheck = false) => {
    if (!skipCheck && !hasAccess(template)) {
      requireAccess("download-docx");
      return;
    }
    setGenerating(true);
    try {
      await exportToDocx(data, template);
      toast.success("Currículo DOCX baixado!");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao gerar DOCX.");
    } finally {
      setGenerating(false);
    }
  };

  const handleClearData = () => {
    if (window.confirm("Tem certeza que deseja limpar todos os dados?")) {
      setData(emptyResume);
      setStep(0);
      localStorage.removeItem(STORAGE_KEY);
      toast.success("Dados limpos!");
    }
  };

  const progress = getProgress();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <OnboardingTour />

      {showAuth && (
        <AuthModal
          context="premium"
          onClose={() => { setShowAuth(false); setPendingAction(null); }}
          onSuccess={handleAuthSuccess}
        />
      )}
      {showCheckout && user && (
        <CheckoutModal
          uid={user.uid}
          email={user.email || ""}
          onClose={() => { setShowCheckout(false); setPendingAction(null); }}
          onSuccess={handleCheckoutSuccess}
        />
      )}

      <header className="bg-hero text-primary-foreground py-6 shadow-elevated">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold font-display">
                Click Fácil <span className="font-normal opacity-80">| Gerador de Currículo</span>
              </h1>
              <p className="text-sm opacity-70 mt-1">Crie seu currículo profissional em minutos</p>
            </div>
            <div className="flex items-center gap-3">
              {lastSaved && (
                <span className="text-xs opacity-50 hidden sm:flex items-center gap-1">
                  <Save className="w-3 h-3" /> Salvo automaticamente
                </span>
              )}
              {user ? (
                <div className="flex items-center gap-2">
                  {isAdmin && (
                    <span className="text-xs bg-red-400 text-white font-bold px-2 py-0.5 rounded-full">ADMIN</span>
                  )}
                  {isPremium && !isAdmin && (
                    <span className="text-xs bg-amber-400 text-amber-900 font-bold px-2 py-0.5 rounded-full">PREMIUM</span>
                  )}
                  <span className="text-xs opacity-70 hidden sm:block">{user.displayName || user.email}</span>
                  <button onClick={() => logout()} title="Sair" className="opacity-60 hover:opacity-100 transition">
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { setPendingAction(null); setShowAuth(true); }}
                  className="flex items-center gap-1.5 text-xs opacity-80 hover:opacity-100 transition bg-white/10 px-3 py-1.5 rounded-lg"
                >
                  <User className="w-3.5 h-3.5" /> Entrar
                </button>
              )}
              <ThemeToggle />
            </div>
          </div>
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
                {step === 0 && <PersonalInfoStep data={data.personalInfo} onChange={(personalInfo) => setData({ ...data, personalInfo })} />}
                {step === 1 && <EducationStep data={data.education} onChange={(education) => setData({ ...data, education })} />}
                {step === 2 && <ExperienceStep data={data.experience} onChange={(experience) => setData({ ...data, experience })} />}
                {step === 3 && <CoursesStep data={data.courses} onChange={(courses) => setData({ ...data, courses })} />}
                {step === 4 && (
                  <SkillsStep
                    skills={data.skills}
                    languages={data.languages}
                    onSkillsChange={(skills) => setData({ ...data, skills })}
                    onLanguagesChange={(languages) => setData({ ...data, languages })}
                  />
                )}
                <div className="flex justify-between mt-8 pt-6 border-t border-border">
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={prev} disabled={step === 0}>
                      <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setShowPreview(!showPreview)} className="hidden lg:flex">
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
              {!user && (
                <div className="mt-4 p-4 rounded-xl border border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800 flex items-center justify-between gap-4">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    💡 <strong>Crie uma conta grátis</strong> para salvar seu currículo em qualquer dispositivo.
                  </p>
                  <Button size="sm" variant="outline" className="flex-shrink-0 border-blue-400 text-blue-700 hover:bg-blue-100"
                    onClick={() => { setPendingAction(null); setShowAuth(true); }}>
                    Criar grátis
                  </Button>
                </div>
              )}
            </div>
            {showPreview && (
              <div className="lg:w-1/2 hidden lg:block">
                <div className="sticky top-4">
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3">📄 Prévia em Tempo Real</h3>
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
                <Button variant="outline" onClick={() => handleDocxDownload()} disabled={generating}>
                  <FileText className="w-4 h-4 mr-2" />
                  {!hasAccess(template) && <Lock className="w-3 h-3 mr-1 opacity-60" />}
                  DOCX
                </Button>
                <Button onClick={() => handleDownload()} disabled={generating}>
                  <Download className="w-4 h-4 mr-2" />
                  {!hasAccess(template) && <Lock className="w-3 h-3 mr-1 opacity-60" />}
                  {generating ? "Gerando..." : "Baixar PDF"}
                </Button>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <Palette className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground font-medium">Escolha o template:</span>
              </div>
              <div className="flex flex-wrap gap-3">
                {TEMPLATES.map((t) => {
                  const locked = !hasAccess(t.id);
                  const active = template === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => handleSelectTemplate(t.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border relative ${
                        active
                          ? "bg-primary text-primary-foreground border-primary shadow-glow"
                          : "bg-card text-foreground border-border hover:border-primary/50"
                      }`}
                    >
                      {locked && <Lock className="w-3 h-3 absolute top-1.5 right-1.5 opacity-50" />}
                      {t.name}
                      <span className="block text-[10px] opacity-70">{t.description}</span>
                      {t.free ? (
                        <span className="block text-[9px] text-green-600 font-bold">GRÁTIS</span>
                      ) : (
                        <span className="block text-[9px] text-amber-600 font-bold">
                          {hasAccess(t.id) ? "PREMIUM ✓" : "PREMIUM — R$9,90"}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              {!isPremium && !isAdmin && (
                <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-amber-900 text-sm">✨ Desbloqueie os 3 templates premium por apenas R$&nbsp;9,90</p>
                    <p className="text-xs text-amber-700">Pagamento único · acesso vitalício · PIX ou cartão</p>
                  </div>
                  <Button
                    size="sm"
                    className="bg-amber-500 hover:bg-amber-600 text-white flex-shrink-0"
                    onClick={() => { if (!user) { setShowAuth(true); } else { setShowCheckout(true); } }}
                  >
                    Desbloquear agora
                  </Button>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <Button variant="ghost" size="sm" onClick={handleClearData} className="text-destructive hover:text-destructive">
                Limpar tudo e recomeçar
              </Button>
            </div>

            <div className="w-full overflow-x-auto pb-8 -mx-4 px-4">
              <div className="min-w-[794px]">
                <ResumePreview data={data} template={template} />
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-hero text-primary-foreground mt-12">
        <div className="container max-w-6xl mx-auto px-4 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-bold font-display mb-2">Click Fácil</h3>
              <p className="text-sm opacity-75 leading-relaxed">
                Ferramentas simples e gratuitas para ajudar você a conquistar seu próximo emprego.
              </p>
            </div>
            <div>
              <h3 className="text-base font-semibold font-display mb-3 flex items-center gap-2">
                <Info className="w-4 h-4" /> Como funciona
              </h3>
              <ul className="space-y-1 text-sm opacity-75">
                <li>✅ Templates Clássico e Minimalista grátis</li>
                <li>✅ Sem cadastro obrigatório</li>
                <li>✅ Download em PDF e DOCX</li>
                <li>⭐ Templates premium por R$9,90 únicos</li>
                <li>⭐ Currículo salvo na nuvem com conta</li>
              </ul>
            </div>
            <div>
              <h3 className="text-base font-semibold font-display mb-3 flex items-center gap-2">
                <Mail className="w-4 h-4" /> Fale Conosco
              </h3>
              <p className="text-sm opacity-75 mb-3">Sugestões, dúvidas ou problemas?</p>
              <a
                href="mailto:contato@clickfacil.com.br"
                className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 transition-colors px-4 py-2 rounded-lg text-sm font-medium"
              >
                <Mail className="w-4 h-4" /> solucoesdigitais.clickfacil@gmail.com
              </a>
            </div>
          </div>
        </div>
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