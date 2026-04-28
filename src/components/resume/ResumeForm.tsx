import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, ArrowRight, Download, Eye, EyeOff, FileText,
  Save, Palette, Mail, Info, Lock, LogOut, User, Check,
} from "lucide-react";
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
import { CoverLetterGenerator } from "./CoverLetterGenerator";
import { ATSAnalyzer } from "./ATSAnalyzer";
import { LinkedInImporter } from "./LinkedInImporter";
import { JobRecommendations } from "./JobRecommendations";
import { toast } from "sonner";
// import { exportToDocx } from "@/lib/docx-export";
import { auth, onAuthChange, logout, checkPremium, grantPremium, addCredits } from "@/lib/firebase";
import { useCredits } from "@/hooks/useCredits";
import CreditsModal from "./CreditsModal";
import type { User as FirebaseUser } from "firebase/auth";
import {
  trackStepCompleted,
  trackResumeCompleted,
  trackPDFDownloaded,
  trackUnlockIntent,
  trackPremiumPurchased,
} from "@/lib/analytics";

const STEPS = ["Dados Pessoais", "Formação", "Experiência", "Cursos", "Habilidades", "Finalizar"];
const storageKey = (uid: string | null) => `clickfacil_resume_${uid || "guest"}`;
const TEMPLATE_KEY = "clickfacil_template";

export type TemplateStyle = "modern" | "classic" | "minimal" | "creative" | "executive" | "tech" | "academic" | "elegant";

const TEMPLATES: { id: TemplateStyle; name: string; description: string; free: boolean }[] = [
  { id: "classic",   name: "Clássico",    description: "Coluna única, serifado e formal", free: true  },
  { id: "minimal",   name: "Minimalista", description: "Flat design, clean e direto",     free: true  },
  { id: "modern",    name: "Moderno",     description: "Sidebar lateral com ícones",      free: false },
  { id: "creative",  name: "Criativo",    description: "Colorido e ousado",               free: false },
  { id: "executive", name: "Executivo",   description: "Elegante e sofisticado",          free: false },
  { id: "tech",      name: "Tech",        description: "Dark mode estilo terminal",       free: false },
  { id: "academic",  name: "Acadêmico",   description: "Formal, ideal para pesquisa",    free: false },
  { id: "elegant",   name: "Elegante",    description: "Rosê, sofisticado e feminino",   free: false },
];

const PREMIUM_TEMPLATES: TemplateStyle[] = ["modern", "creative", "executive", "tech", "academic", "elegant"];

const ADMIN_UIDS: string[] = [
  "VC84FK6HWsfVBCVCt43OK6xw9x43",
];

const ResumeForm = () => {
  const [step, setStep] = useState(0);
  const [uid, setUid] = useState<string | null>(null);
  const [data, setData] = useState<ResumeData>(emptyResume);
  const [generating, setGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [template, setTemplate] = useState<TemplateStyle>(
    () => (localStorage.getItem(TEMPLATE_KEY) as TemplateStyle) || "classic"
  );
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  // Hook de créditos
  const { credits, spend, unlockTemplate, isTemplateUnlocked } = useCredits(uid);

  useEffect(() => {
    const unsub = onAuthChange(async (u) => {
      setUser(u);
      const currentUid = u?.uid || null;
      setUid(currentUid);
      if (u) {
        const admin = ADMIN_UIDS.includes(u.uid);
        setIsAdmin(admin);
        setIsPremium(admin ? true : await checkPremium(u.uid));
      } else {
        setIsAdmin(false);
        setIsPremium(false);
      }
      try {
        const saved = localStorage.getItem(storageKey(currentUid));
        setData(saved ? JSON.parse(saved) : emptyResume);
      } catch {
        setData(emptyResume);
      }
    });
    return unsub;
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("payment") === "success" && user && !isAdmin) {
      grantPremium(user.uid).then(() => {
        setIsPremium(true);
        trackPremiumPurchased();
        toast.success("🎉 Pagamento confirmado! Acesso premium liberado.");
        window.history.replaceState({}, "", "/");
      });
    }
  }, [user, isAdmin]);

  useEffect(() => {
    const t = setTimeout(() => {
      try {
        localStorage.setItem(storageKey(uid), JSON.stringify(data));
        setLastSaved(new Date());
      } catch { /* ignore */ }
    }, 1000);
    return () => clearTimeout(t);
  }, [data, uid]);

  useEffect(() => { localStorage.setItem(TEMPLATE_KEY, template); }, [template]);

  const hasAccess = useCallback((t: TemplateStyle) => {
    if (!PREMIUM_TEMPLATES.includes(t)) return true;
    if (isAdmin) return true;
    if (isPremium) return true;
    if (isTemplateUnlocked(t)) return true;
    return false;
  }, [isAdmin, isPremium, isTemplateUnlocked]);

  const requireAccessForDownload = (action: string): boolean => {
    if (!user) { setPendingAction(action); setShowAuth(true); return false; }
    return true;
  };

  const handleAuthSuccess = async () => {
    setShowAuth(false);
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    const admin = ADMIN_UIDS.includes(currentUser.uid);
    setIsAdmin(admin);
    if (admin) { setIsPremium(true); executePendingAction(); return; }
    const premium = await checkPremium(currentUser.uid);
    setIsPremium(premium);
    // No novo modelo, usuário autenticado já tem créditos — executa ação pendente
    executePendingAction();
  };

  const handleCheckoutSuccess = () => {
    setShowCheckout(false);
    setShowCreditsModal(false);
    toast.success("🎉 Créditos adicionados com sucesso!");
    executePendingAction();
  };

  const executePendingAction = () => {
    if (!pendingAction) return;
    if (pendingAction === "download-pdf") handleDownload(true);
    // if (pendingAction === "download-docx") handleDocxDownload(true);
    setPendingAction(null);
  };

  const handleSelectTemplate = async (t: TemplateStyle) => {
    if (hasAccess(t)) { setTemplate(t); return; }
    if (!user) { setShowAuth(true); return; }
    const ok = await unlockTemplate(t);
    if (!ok) { setShowCreditsModal(true); return; }
    setTemplate(t);
    toast.success(`Template ${t} desbloqueado! ⚡`);
  };

  const getProgress = useCallback(() => {
    const pi = data.personalInfo;

    // Cada passo vale 20 pontos (5 passos × 20 = 100)
    // Passo 1 — Dados Pessoais: campos obrigatórios
    const camposP1 = [pi.fullName, pi.email, pi.phone, pi.city, pi.state, pi.objective];
    const p1 = Math.round((camposP1.filter(Boolean).length / camposP1.length) * 20);

    // Passo 2 — Formação: pelo menos 1 entrada
    const p2 = data.education.length > 0 ? 20 : 0;

    // Passo 3 — Experiência: pelo menos 1 entrada (opcional, vale metade se vazio)
    const p3 = data.experience.length > 0 ? 20 : 10;

    // Passo 4 — Cursos: pelo menos 1 entrada (opcional, vale metade se vazio)
    const p4 = data.courses.length > 0 ? 20 : 10;

    // Passo 5 — Habilidades: pelo menos 3 habilidades
    const totalSkills = data.skills.length;
    const p5 = totalSkills >= 3 ? 20 : Math.round((totalSkills / 3) * 20);

    return Math.min(p1 + p2 + p3 + p4 + p5, 100);
  }, [data]);

  const next = () => {
    if (step === 0) {
      const { fullName, email, phone, city, state, objective } = data.personalInfo;
      if (!fullName || !email || !phone || !city || !state || !objective) {
        toast.error("Preencha todos os campos obrigatórios (*) antes de continuar.");
        return;
      }
    }
    const nextStep = Math.min(step + 1, STEPS.length - 1);
    trackStepCompleted(step + 1, STEPS[step]);
    if (nextStep === STEPS.length - 1) trackResumeCompleted();
    setStep(nextStep);
  };
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const handleDownload = async (skipCheck = false) => {
    if (!skipCheck) {
      if (!user) { setPendingAction("download-pdf"); setShowAuth(true); return; }
      if (!isAdmin) {
        const ok = await spend("DOWNLOAD_PDF");
        if (!ok) { setShowCreditsModal(true); return; }
      }
    }
    setGenerating(true);
    
    const isEdge = /Edg/.test(navigator.userAgent);
    if (isEdge) {
      toast.info("⚠️ Seu PDF pode sofrer alterações por estar usando navegador Edge", { duration: 5000 });
    }
    
    try {
      const element = document.getElementById("resume-preview");
      if (!element) { toast.error("Prévia não encontrada."); return; }

      await document.fonts.ready;
      await new Promise((r) => setTimeout(r, 600));

      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      const wrapper = document.createElement("div");
      wrapper.style.cssText = [
        "position:fixed",
        "left:0",
        "top:0",
        "width:794px",
        "z-index:-9999",
        "pointer-events:none",
        "overflow:hidden",
        "background:#fff",
        "color-scheme:light",
      ].join(";");

      const clone = element.cloneNode(true) as HTMLElement;

      clone.style.cssText += [
        ";width:794px",
        "background-color:#ffffff",
        "color-scheme:light",
        "font-kerning:none",
        "text-rendering:geometricPrecision",
        "-webkit-font-smoothing:antialiased",
        "font-variant-ligatures:none",
      ].join(";");

      // Propaga propriedades para descendentes
      const allElements = clone.querySelectorAll<HTMLElement>("*");
      const problematicTemplates: TemplateStyle[] = ["classic", "elegant", "academic", "tech"];
      const needsWhiteSpaceFix = problematicTemplates.includes(template);
      allElements.forEach((el) => {
        // Força a desativação de ligaturas e ajustes complexos de fonte
        el.style.setProperty("font-kerning", "none", "important");
        el.style.setProperty("text-rendering", "geometricPrecision", "important");
        el.style.setProperty("font-variant-ligatures", "none", "important");
        
        // FIX DEFINITIVO: Força o alinhamento à esquerda no momento de gerar o PDF
        el.style.setProperty("text-align", "left", "important");

        // Para templates com problema de espaçamento, aplicar whiteSpace fix rigoroso
        if (needsWhiteSpaceFix) {
          el.style.setProperty("word-spacing", "2px", "important");
          el.style.setProperty("letter-spacing", "0.2px", "important");
          el.style.setProperty("white-space", "pre-wrap", "important");
          el.style.setProperty("word-break", "keep-all", "important");
          el.style.setProperty("overflow-wrap", "break-word", "important");
        }
      });

      wrapper.appendChild(clone);
      document.body.appendChild(wrapper);

      await new Promise((r) => setTimeout(r, 500));

      let canvas: HTMLCanvasElement;
      try {
        canvas = await html2canvas(clone, {
          scale: 3,
          useCORS: true,
          allowTaint: false,
          backgroundColor: "#ffffff",
          logging: false,
          imageTimeout: 15000,
          scrollX: 0,
          scrollY: 0,
          foreignObjectRendering: false,
          windowWidth: 794,
          windowHeight: clone.scrollHeight,
          width: 794,
          height: clone.scrollHeight,
          x: 0,
          y: 0,
        });
      } finally {
        document.body.removeChild(wrapper);
      }

      if (!canvas || canvas.width === 0 || canvas.height === 0) {
        throw new Error("Canvas vazio ou inválido");
      }

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
      const pdfW = 210;
      const pdfH = (canvas.height * pdfW) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfW, pdfH);
      const name = data.personalInfo.fullName.replace(/\s+/g, "-").toLowerCase() || "meu";
      pdf.save(`curriculo-${name}.pdf`);
      trackPDFDownloaded(template, isPremium);
      toast.success("Currículo baixado com sucesso!");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao gerar PDF. Tente novamente.");
    } finally {
      setGenerating(false);
    }
  };

  // const handleDocxDownload = async (skipCheck = false) => {
  //   if (!skipCheck && !hasAccess(template)) {
  //     requireAccessForDownload("download-docx");
  //     return;
  //   }
  //   setGenerating(true);
  //   try {
  //     await exportToDocx(data, template);
  //     toast.success("Currículo DOCX baixado!");
  //   } catch (err) {
  //     console.error(err);
  //     toast.error("Erro ao gerar DOCX.");
  //   } finally {
  //     setGenerating(false);
  //   }
  // };

  const handleClearData = () => {
    if (window.confirm("Tem certeza que deseja limpar todos os dados?")) {
      setData(emptyResume);
      setStep(0);
      localStorage.removeItem(storageKey(uid));
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
      {showCreditsModal && user && (
        <CreditsModal
          uid={user.uid}
          email={user.email || ""}
          credits={credits}
          onClose={() => setShowCreditsModal(false)}
          onSuccess={handleCheckoutSuccess}
        />
      )}

      <header className="bg-hero text-primary-foreground py-6 shadow-elevated">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-3">
              <img 
                src="/ponteiro_clickfacil.ico" 
                alt="Click Fácil" 
                className="w-8 h-8 md:w-10 md:h-10"
              />
              <div>
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold font-display">
                  Click Fácil <span className="font-normal opacity-80 hidden sm:inline">| Gerador de Currículo</span>
                </h1>
                <p className="text-xs md:text-sm opacity-70 mt-1 hidden md:block">Crie seu currículo profissional em minutos</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {lastSaved && (
                <span className="text-xs opacity-50 hidden sm:flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-green-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4C9.11 4 6.6 5.64 5.35 8.04C2.34 8.36 0 10.91 0 14C0 17.31 2.69 20 6 20H19C21.76 20 24 17.76 24 15C24 12.36 21.95 10.22 19.35 10.04Z" fill="currentColor"/>
                  </svg>
                  Salvo
                </span>
              )}
              {user ? (
                <div className="flex items-center gap-2">
                  {isAdmin && <span className="text-xs bg-red-400 text-white font-bold px-2 py-0.5 rounded-full">ADMIN</span>}
                  {!isAdmin && (
                    <button
                      onClick={() => setShowCreditsModal(true)}
                      className="text-xs bg-violet-500 text-white font-bold px-2 py-1 rounded-full hover:bg-violet-600 transition"
                    >
                      ⚡ {credits} créditos
                    </button>
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
                {step === 0 && (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-2xl font-bold font-display text-foreground">Dados Pessoais</h2>
                        <p className="text-muted-foreground mt-1">Informações básicas para o cabeçalho do currículo</p>
                      </div>
                      <LinkedInImporter
                        onImport={(importedData) => {
                          setData({ ...data, ...importedData });
                          toast.success("Dados importados do LinkedIn com sucesso!");
                        }}
                        spend={spend}
                        onShowCredits={() => setShowCreditsModal(true)}
                      />
                    </div>
                    <PersonalInfoStep
                      data={data.personalInfo}
                      onChange={(personalInfo) => setData({ ...data, personalInfo })}
                      uid={uid}
                      credits={credits}
                      isUnlimited={isAdmin}
                      onShowCredits={() => setShowCreditsModal(true)}
                      onShowAuth={() => setShowAuth(true)}
                    />
                  </>
                )}
                {step === 1 && <EducationStep data={data.education} onChange={(education) => setData({ ...data, education })} />}
                {step === 2 && <ExperienceStep
                  data={data.experience}
                  onChange={(experience) => setData({ ...data, experience })}
                  uid={uid}
                  credits={credits}
                  isUnlimited={isAdmin}
                  onShowCredits={() => setShowCreditsModal(true)}
                  onShowAuth={() => setShowAuth(true)}
                />}
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

            {/* Cabeçalho */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold font-display text-foreground">Seu Currículo está Pronto! 🎉</h2>
                <p className="text-muted-foreground">Revise, escolha o template e faça o download</p>
              </div>
              <div className="flex gap-2 flex-wrap justify-center">
                <Button variant="outline" onClick={prev}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Editar
                </Button>
                <Button onClick={() => handleDownload()} disabled={generating}>
                  <Download className="w-4 h-4 mr-2" />
                  {!hasAccess(template) && <Lock className="w-3 h-3 mr-1 opacity-60" />}
                  {generating ? "Gerando..." : "Baixar PDF"}
                </Button>
              </div>
            </div>

            {/* Seletor de templates */}
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Palette className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-semibold text-foreground">Escolha o template:</span>
              </div>

              {/* Templates + carta de apresentação na mesma linha */}
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3">
                {TEMPLATES.map((t) => {
                  const locked = !hasAccess(t.id);
                  const active = template === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => handleSelectTemplate(t.id)}
                      className={`w-full sm:w-auto px-4 py-2 rounded-lg text-sm font-medium transition-all border relative ${
                        active
                          ? "bg-primary text-primary-foreground border-primary shadow-glow"
                          : "bg-background text-foreground border-border hover:border-primary/50"
                      }`}
                    >
                      {locked && <Lock className="w-3 h-3 absolute top-1.5 right-1.5 opacity-40" />}
                      {t.name}
                      <span className="block text-[10px] opacity-70">{t.description}</span>
                      {t.free ? (
                        <span className="block text-[9px] text-green-600 font-bold">GRÁTIS</span>
                      ) : (
                        <span className="block text-[9px] text-amber-600 font-bold">
                          {hasAccess(t.id) ? "DESBLOQUEADO ✓" : "1 crédito ⚡"}
                        </span>
                      )}
                    </button>
                  );
                })}

                {/* Card carta de apresentação — mesmo estilo dos templates */}
                <div
                  className={`w-full sm:w-auto px-4 py-2 rounded-lg text-sm border relative flex flex-col justify-between ${
                    isAdmin
                      ? "bg-background text-foreground border-border"
                      : "bg-background text-foreground border-border opacity-70"
                  }`}
                >
                  {!isAdmin && <Lock className="w-3 h-3 absolute top-1.5 right-1.5 opacity-40" />}
                  <div>
                    <span className="font-medium flex items-center gap-1">
                      <Mail className="w-3 h-3" /> Carta de Apresentação
                    </span>
                    <span className="block text-[10px] opacity-70">Gerada por IA com seus dados</span>
                    <span className="block text-[9px] text-amber-600 font-bold">
                      {isAdmin ? "ILIMITADO ✓" : "2 créditos ⚡"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Banner créditos */}
              {!isAdmin && (
                <div className="mt-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-2">
                    <p className="font-semibold text-amber-900 dark:text-amber-300 text-sm">
                      ⚡ Compre créditos e use como quiser
                    </p>
                    <ul className="text-xs text-amber-800 dark:text-amber-400 space-y-1">
                      <li className="flex items-center gap-2"><FileText className="w-3 h-3 flex-shrink-0" /> Templates premium — 1 crédito cada</li>
                      <li className="flex items-center gap-2"><Mail className="w-3 h-3 flex-shrink-0" /> Carta de apresentação — 2 créditos</li>
                      <li className="flex items-center gap-2"><Check className="w-3 h-3 flex-shrink-0" /> Pacote Popular: 30 créditos por R$&nbsp;9,90</li>
                    </ul>
                  </div>
                  <Button
                    size="sm"
                    className="bg-amber-500 hover:bg-amber-600 text-white flex-shrink-0 w-full sm:w-auto"
                    onClick={() => { trackUnlockIntent("banner_templates"); if (!user) { setShowAuth(true); } else { setShowCreditsModal(true); } }}
                  >
                    Comprar créditos
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile: prévia → ATS → vagas → carta → limpar */}
            <div className="block xl:hidden space-y-6">
              <div className="w-full overflow-hidden" style={{ height: "505px" }}>
                <div
                  style={{
                    transform: "scale(0.45)",
                    transformOrigin: "top left",
                    width: "222%",
                    pointerEvents: "none",
                  }}
                >
                  <ResumePreview data={data} template={template} />
                </div>
              </div>
              <ATSAnalyzer 
                data={data}
                spend={spend}
                onShowCredits={() => setShowCreditsModal(true)}
                uid={uid}
              />
              <CoverLetterGenerator
                data={data}
                spend={spend}
                onShowCredits={() => setShowCreditsModal(true)}
              />
              <JobRecommendations
                userObjective={data.personalInfo.objective}
                isPremium={isPremium || isAdmin}
                onUpgrade={() => { if (!user) { setShowAuth(true); } else { setShowCreditsModal(true); } }}
              />
              <div className="flex justify-end pb-4">
                <Button variant="ghost" size="sm" onClick={handleClearData} className="text-destructive hover:text-destructive">
                  Limpar tudo e recomeçar
                </Button>
              </div>
            </div>

            {/* Desktop: coluna lateral esquerda (ATS + vagas + carta + limpar) | coluna direita (prévia) */}
            <div className="hidden xl:flex flex-row gap-6 items-start pb-8">
              <div className="w-72 flex-shrink-0 space-y-4">
                <ATSAnalyzer 
                  data={data}
                  spend={spend}
                  onShowCredits={() => setShowCreditsModal(true)}
                  uid={uid}
                />
                <CoverLetterGenerator
                  data={data}
                  spend={spend}
                  onShowCredits={() => setShowCreditsModal(true)}
                />
                <JobRecommendations
                  userObjective={data.personalInfo.objective}
                  isPremium={isPremium || isAdmin}
                  onUpgrade={() => { if (!user) { setShowAuth(true); } else { setShowCreditsModal(true); } }}
                />
                <div className="flex justify-end">
                  <Button variant="ghost" size="sm" onClick={handleClearData} className="text-destructive hover:text-destructive">
                    Limpar tudo e recomeçar
                  </Button>
                </div>
              </div>
              <div className="flex-1 min-w-0 overflow-x-auto">
                <div className="min-w-[794px]">
                  <ResumePreview data={data} template={template} />
                </div>
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
                <li>✅ Download em PDF</li>
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
                href="mailto:solucoesdigitais.clickfacil@gmail.com"
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
            <div className="flex gap-4">
              <Link to="/privacidade" className="hover:opacity-80 transition-opacity">Política de Privacidade</Link>
              <Link to="/termos" className="hover:opacity-80 transition-opacity">Termos de Uso</Link>
            </div>
            <span>Feito com ❤️ para quem busca uma oportunidade</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ResumeForm;