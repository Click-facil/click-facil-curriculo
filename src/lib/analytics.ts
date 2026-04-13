// lib/analytics.ts
// Dispara eventos para o Google Analytics (gtag) com fallback silencioso
// Todos os eventos aparecem em: Analytics → Engajamento → Eventos

declare function gtag(...args: unknown[]): void;

function track(eventName: string, params?: Record<string, unknown>) {
  try {
    if (typeof gtag !== "undefined") {
      gtag("event", eventName, params);
    }
  } catch {
    // silencioso — nunca quebra a aplicação
  }
}

// Disparado quando o usuário avança de passo (1 a 5)
// No Analytics: veja qual passo tem mais abandono
export function trackStepCompleted(step: number, stepName: string) {
  track("curriculo_step_completed", {
    step_number: step,
    step_name: stepName,
  });
}

// Disparado quando chega no passo 6 (Finalizar)
// Indica que o usuário preencheu o currículo inteiro
export function trackResumeCompleted() {
  track("curriculo_completed");
}

// Disparado quando o PDF é baixado com sucesso
// Evento de conversão principal — usuário gerou valor real
export function trackPDFDownloaded(template: string, isPremium: boolean) {
  track("curriculo_download_pdf", {
    template_used: template,
    user_type: isPremium ? "premium" : "free",
  });
}

// Disparado quando o usuário clica em "Desbloquear agora" ou "Desbloquear por R$ 9,90"
// Mede intenção de compra (funil)
export function trackUnlockIntent(origin: string) {
  track("premium_unlock_intent", {
    origin, // ex: "banner_templates", "card_carta", "download_pdf"
  });
}

// Disparado quando o pagamento é confirmado e o premium é liberado
// Evento de receita — mais importante do funil
export function trackPremiumPurchased() {
  track("premium_purchase", {
    value: 9.9,
    currency: "BRL",
  });
}

// Disparado quando a carta de apresentação é gerada
export function trackCoverLetterGenerated() {
  track("cover_letter_generated");
}

// Disparado quando a análise ATS é concluída
export function trackATSAnalyzed(score: number) {
  track("ats_analysis_completed", {
    ats_score: score,
  });
}