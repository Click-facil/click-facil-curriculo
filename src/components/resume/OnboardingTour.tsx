import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, ArrowRight, Sparkles, FileText, Upload, Download } from "lucide-react";

const TOUR_STEPS = [
  {
    icon: Sparkles,
    title: "Bem-vindo ao Click Fácil! 👋",
    description: "Crie currículos profissionais com IA, análise ATS, carta de apresentação e vagas personalizadas. Tudo em minutos!",
  },
  {
    icon: FileText,
    title: "Preencha passo a passo",
    description: "Formulário dividido em etapas simples. Use a IA para melhorar seus textos e destaque suas experiências profissionais.",
  },
  {
    icon: Upload,
    title: "Recursos inteligentes",
    description: "Importe do LinkedIn, melhore textos com IA, gere carta de apresentação e veja sua compatibilidade ATS automaticamente.",
  },
  {
    icon: Download,
    title: "Escolha e baixe",
    description: "8 templates profissionais disponíveis. Baixe em PDF quantas vezes quiser. Sistema de créditos flexível e justo!",
  },
];

const TOUR_KEY = "clickfacil_tour_completed";

const OnboardingTour = () => {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const done = localStorage.getItem(TOUR_KEY);
    if (!done) setShow(true);
  }, []);

  const dismiss = () => {
    setShow(false);
    localStorage.setItem(TOUR_KEY, "true");
  };

  const next = () => {
    if (step < TOUR_STEPS.length - 1) setStep(step + 1);
    else dismiss();
  };

  if (!show) return null;

  const current = TOUR_STEPS[step];
  const Icon = current.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-card rounded-2xl shadow-elevated max-w-md w-full p-8 relative animate-in fade-in zoom-in-95">
        <button onClick={dismiss} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
          <X className="w-5 h-5" />
        </button>

        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Icon className="w-8 h-8 text-primary" />
          </div>
        </div>

        <h3 className="text-xl font-bold font-display text-center text-foreground mb-2">{current.title}</h3>
        <p className="text-muted-foreground text-center text-sm leading-relaxed mb-6">{current.description}</p>

        {/* Dots */}
        <div className="flex justify-center gap-2 mb-6">
          {TOUR_STEPS.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all ${
                i === step ? "bg-primary w-6" : i < step ? "bg-success" : "bg-border"
              }`}
            />
          ))}
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={dismiss} className="flex-1">
            Pular
          </Button>
          <Button onClick={next} className="flex-1">
            {step < TOUR_STEPS.length - 1 ? (
              <>Próximo <ArrowRight className="w-4 h-4 ml-1" /></>
            ) : (
              "Começar! 🚀"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingTour;
