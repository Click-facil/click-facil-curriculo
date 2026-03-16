/**
 * CheckoutModal.tsx
 *
 * Checkout personalizado com:
 * - Aba PIX: QR code + copia e cola + polling automático
 * - Aba Cartão: formulário tokenizado pelo MercadoPago.js (sem redirecionar)
 *
 * Deps: nenhuma extra além do que já está no projeto.
 * O MercadoPago.js é carregado via script tag dinamicamente.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { X, QrCode, CreditCard, Copy, Check, Loader2, CheckCircle, AlertCircle, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { grantPremium } from "@/lib/firebase";
import { toast } from "sonner";

// ── Tipos do MercadoPago.js ───────────────────────────────────────────────────
declare global {
  interface Window {
    MercadoPago: new (publicKey: string, options?: { locale: string }) => MPInstance;
  }
}
interface MPInstance {
  cardForm: (options: {
    amount: string;
    iframe: boolean;
    form: {
      id: string;
      cardNumber: { id: string; placeholder: string };
      expirationDate: { id: string; placeholder: string };
      securityCode: { id: string; placeholder: string };
      cardholderName: { id: string; placeholder: string; type: string };
      issuer: { id: string; placeholder: string };
      installments: { id: string; placeholder: string };
      identificationType: { id: string; placeholder: string };
      identificationNumber: { id: string; placeholder: string };
      cardholderEmail: { id: string; placeholder: string };
    };
    callbacks: {
      onFormMounted: (err: unknown) => void;
      onSubmit: (e: Event) => void;
      onFetching?: (resource: string) => void;
    };
  }) => { getCardFormData: () => MPCardFormData; unmount: () => void };
}
interface MPCardFormData {
  token: string;
  issuer_id: string;
  payment_method_id: string;
  transaction_amount: number;
  installments: number;
  payer: { email: string; identification: { type: string; number: string } };
}

// ── Chave pública do MP (não é secreta — vai no frontend) ────────────────────
// Substitua pela sua Public Key do Mercado Pago (começa com APP_USR- ou TEST-)
const MP_PUBLIC_KEY = "APP_USR-78fa9f55-2125-45f1-85b1-9421ba17afd8";

interface Props {
  uid: string;
  email: string;
  onClose: () => void;
  onSuccess: () => void;
}

type Tab = "pix" | "card";
type PixStep = "idle" | "loading" | "waiting" | "confirmed" | "error";
type CardStep = "idle" | "loading" | "confirmed" | "error";

const CheckoutModal = ({ uid, email, onClose, onSuccess }: Props) => {
  const [tab, setTab] = useState<Tab>("pix");

  // ── PIX state ──────────────────────────────────────────────────────────────
  const [pixStep, setPixStep] = useState<PixStep>("idle");
  const [pixCode, setPixCode] = useState("");
  const [pixQrBase64, setPixQrBase64] = useState("");
  const [pixPaymentId, setPixPaymentId] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Card state ─────────────────────────────────────────────────────────────
  const [cardStep, setCardStep] = useState<CardStep>("idle");
  const [cardError, setCardError] = useState("");
  const mpFormRef = useRef<{ getCardFormData: () => MPCardFormData; unmount: () => void } | null>(null);

  // Carrega o MercadoPago.js quando a aba cartão é selecionada
  useEffect(() => {
    if (tab !== "card") return;

    const scriptId = "mp-js";
    if (document.getElementById(scriptId)) {
      initMPForm();
      return;
    }
    const script = document.createElement("script");
    script.id = scriptId;
    script.src = "https://sdk.mercadopago.com/js/v2";
    script.onload = initMPForm;
    document.head.appendChild(script);

    return () => {
      mpFormRef.current?.unmount();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const initMPForm = () => {
    if (!window.MercadoPago) return;
    const mp = new window.MercadoPago(MP_PUBLIC_KEY, { locale: "pt-BR" });
    mpFormRef.current = mp.cardForm({
      amount: "9.90",
      iframe: true,
      form: {
        id: "mp-card-form",
        cardNumber: { id: "mp-card-number", placeholder: "Número do cartão" },
        expirationDate: { id: "mp-expiration-date", placeholder: "MM/AA" },
        securityCode: { id: "mp-security-code", placeholder: "CVV" },
        cardholderName: { id: "mp-cardholder-name", placeholder: "Nome igual no cartão", type: "text" },
        issuer: { id: "mp-issuer", placeholder: "Banco emissor" },
        installments: { id: "mp-installments", placeholder: "Parcelas" },
        identificationType: { id: "mp-identification-type", placeholder: "CPF" },
        identificationNumber: { id: "mp-identification-number", placeholder: "000.000.000-00" },
        cardholderEmail: { id: "mp-cardholder-email", placeholder: email },
      },
      callbacks: {
        onFormMounted: (err) => { if (err) console.warn("MP form error:", err); },
        onSubmit: async (e) => {
          e.preventDefault();
          const data = mpFormRef.current?.getCardFormData();
          if (!data?.token) return;
          await processCard(data);
        },
      },
    });
  };

  // ── PIX handlers ───────────────────────────────────────────────────────────

  const handleGeneratePix = async () => {
    setPixStep("loading");
    try {
      const res = await fetch("/api/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method: "pix", uid, email }),
      });
      const data = await res.json() as {
        payment_id: number;
        qr_code: string;
        qr_code_base64: string;
        error?: string;
      };
      if (!res.ok || data.error) throw new Error(data.error || "Erro ao gerar PIX");

      setPixCode(data.qr_code);
      setPixQrBase64(data.qr_code_base64);
      setPixPaymentId(data.payment_id);
      setPixStep("waiting");
      startPolling(data.payment_id);
    } catch (err: unknown) {
      console.error(err);
      setPixStep("error");
    }
  };

  const startPolling = useCallback((paymentId: number) => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/check-payment?payment_id=${paymentId}`);
        const data = await res.json() as { status: string; uid: string };
        if (data.status === "approved") {
          clearInterval(pollingRef.current!);
          await grantPremium(uid);
          setPixStep("confirmed");
          setTimeout(() => onSuccess(), 2000);
        }
      } catch { /* continua tentando */ }
    }, 5000);
  }, [uid, onSuccess]);

  useEffect(() => () => {
    if (pollingRef.current) clearInterval(pollingRef.current);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(pixCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // ── Card handler ───────────────────────────────────────────────────────────

  const processCard = async (formData: MPCardFormData) => {
    setCardStep("loading");
    setCardError("");
    try {
      const res = await fetch("/api/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method: "card",
          uid,
          email: formData.payer.email || email,
          token: formData.token,
          issuer_id: formData.issuer_id,
          installments: formData.installments,
          payment_method_id: formData.payment_method_id,
        }),
      });
      const data = await res.json() as { status: string; status_detail: string; error?: string };

      if (!res.ok || data.error) throw new Error(data.error || "Erro ao processar cartão");

      if (data.status === "approved") {
        await grantPremium(uid);
        setCardStep("confirmed");
        setTimeout(() => onSuccess(), 2000);
      } else if (data.status === "in_process") {
        setCardError("Pagamento em análise. Você receberá uma confirmação em breve.");
        setCardStep("idle");
      } else {
        const msgs: Record<string, string> = {
          cc_rejected_insufficient_amount: "Saldo insuficiente no cartão.",
          cc_rejected_bad_filled_card_number: "Número do cartão inválido.",
          cc_rejected_bad_filled_security_code: "CVV incorreto.",
          cc_rejected_bad_filled_date: "Data de vencimento incorreta.",
          cc_rejected_call_for_authorize: "Cartão bloqueado. Entre em contato com o banco.",
        };
        setCardError(msgs[data.status_detail] || "Cartão recusado. Verifique os dados ou tente outro cartão.");
        setCardStep("error");
      }
    } catch (err: unknown) {
      console.error(err);
      setCardError("Erro ao processar. Tente novamente.");
      setCardStep("error");
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-5 text-white">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-xl">⭐</span>
            </div>
            <div>
              <h2 className="text-lg font-bold">Templates Premium</h2>
              <p className="text-sm text-white/80">Acesso vitalício · pagamento único</p>
            </div>
            <div className="ml-auto text-right">
              <div className="text-2xl font-extrabold">R$&nbsp;9,90</div>
              <div className="text-xs text-white/60 line-through">R$&nbsp;19,90</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-zinc-700">
          <button
            onClick={() => setTab("pix")}
            className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition border-b-2 ${
              tab === "pix"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <QrCode className="w-4 h-4" /> PIX
          </button>
          <button
            onClick={() => setTab("card")}
            className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition border-b-2 ${
              tab === "card"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <CreditCard className="w-4 h-4" /> Cartão de Crédito
          </button>
        </div>

        <div className="p-6">

          {/* ── PIX Tab ─────────────────────────────────────────────────── */}
          {tab === "pix" && (
            <div className="space-y-4">
              {pixStep === "idle" && (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                    <QrCode className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-white">Pague com PIX</p>
                    <p className="text-sm text-gray-500 mt-1">
                      QR code gerado na hora. Aprovação em segundos.
                    </p>
                  </div>
                  <Button
                    className="w-full h-11 bg-green-600 hover:bg-green-700 text-white font-bold"
                    onClick={handleGeneratePix}
                  >
                    Gerar QR Code PIX
                  </Button>
                </div>
              )}

              {pixStep === "loading" && (
                <div className="flex flex-col items-center gap-3 py-6">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  <p className="text-sm text-gray-500">Gerando PIX...</p>
                </div>
              )}

              {pixStep === "waiting" && (
                <div className="space-y-4">
                  <p className="text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                    Escaneie o QR code ou copie o código abaixo
                  </p>

                  {/* QR Code */}
                  {pixQrBase64 && (
                    <div className="flex justify-center">
                      <img
                        src={`data:image/png;base64,${pixQrBase64}`}
                        alt="QR Code PIX"
                        className="w-48 h-48 rounded-xl border border-gray-200"
                      />
                    </div>
                  )}

                  {/* Copia e cola */}
                  <div className="bg-gray-50 dark:bg-zinc-800 rounded-xl p-3">
                    <p className="text-xs text-gray-500 mb-2 font-medium">PIX Copia e Cola:</p>
                    <div className="flex gap-2">
                      <input
                        readOnly
                        value={pixCode}
                        className="flex-1 text-xs bg-transparent text-gray-700 dark:text-gray-300 outline-none truncate"
                      />
                      <button
                        onClick={handleCopy}
                        className="flex-shrink-0 flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition"
                      >
                        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        {copied ? "Copiado!" : "Copiar"}
                      </button>
                    </div>
                  </div>

                  {/* Polling indicator */}
                  <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Aguardando confirmação do pagamento...
                  </div>

                  <p className="text-center text-xs text-gray-400">
                    O acesso é liberado automaticamente após o pagamento.
                  </p>
                </div>
              )}

              {pixStep === "confirmed" && (
                <div className="flex flex-col items-center gap-3 py-6 text-center">
                  <CheckCircle className="w-14 h-14 text-green-500" />
                  <p className="text-lg font-bold text-gray-800 dark:text-white">Pagamento confirmado! 🎉</p>
                  <p className="text-sm text-gray-500">Liberando seu acesso premium...</p>
                </div>
              )}

              {pixStep === "error" && (
                <div className="flex flex-col items-center gap-3 py-4 text-center">
                  <AlertCircle className="w-10 h-10 text-red-500" />
                  <p className="text-sm text-gray-700 dark:text-gray-300">Erro ao gerar o PIX. Tente novamente.</p>
                  <Button variant="outline" onClick={() => setPixStep("idle")}>Tentar novamente</Button>
                </div>
              )}
            </div>
          )}

          {/* ── Card Tab ────────────────────────────────────────────────── */}
          {tab === "card" && (
            <div>
              {cardStep === "confirmed" ? (
                <div className="flex flex-col items-center gap-3 py-6 text-center">
                  <CheckCircle className="w-14 h-14 text-green-500" />
                  <p className="text-lg font-bold text-gray-800 dark:text-white">Pagamento aprovado! 🎉</p>
                  <p className="text-sm text-gray-500">Liberando seu acesso premium...</p>
                </div>
              ) : (
                <form id="mp-card-form" className="space-y-3">
                  {cardError && (
                    <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      {cardError}
                    </div>
                  )}

                  {/* Campos injetados pelo MP.js como iframes — o MP cria os iframes automaticamente */}
                  <div>
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">
                      Número do cartão
                    </label>
                    <div
                      id="mp-card-number"
                      className="h-10 border border-gray-300 dark:border-zinc-600 rounded-lg px-3 bg-white dark:bg-zinc-800"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">
                        Validade
                      </label>
                      <div
                        id="mp-expiration-date"
                        className="h-10 border border-gray-300 dark:border-zinc-600 rounded-lg px-3 bg-white dark:bg-zinc-800"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">
                        CVV
                      </label>
                      <div
                        id="mp-security-code"
                        className="h-10 border border-gray-300 dark:border-zinc-600 rounded-lg px-3 bg-white dark:bg-zinc-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">
                      Nome no cartão
                    </label>
                    <div
                      id="mp-cardholder-name"
                      className="h-10 border border-gray-300 dark:border-zinc-600 rounded-lg px-3 bg-white dark:bg-zinc-800"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">
                        Tipo documento
                      </label>
                      <div
                        id="mp-identification-type"
                        className="h-10 border border-gray-300 dark:border-zinc-600 rounded-lg px-3 bg-white dark:bg-zinc-800"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">
                        CPF
                      </label>
                      <div
                        id="mp-identification-number"
                        className="h-10 border border-gray-300 dark:border-zinc-600 rounded-lg px-3 bg-white dark:bg-zinc-800"
                      />
                    </div>
                  </div>

                  {/* Campos ocultos necessários pelo MP */}
                  <div id="mp-issuer" style={{ display: "none" }} />
                  <div id="mp-installments" style={{ display: "none" }} />
                  <div id="mp-cardholder-email" style={{ display: "none" }} />

                  <Button
                    type="submit"
                    className="w-full h-11 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white font-bold mt-2"
                    disabled={cardStep === "loading"}
                  >
                    {cardStep === "loading" ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processando...</>
                    ) : (
                      <><Lock className="w-4 h-4 mr-2" /> Pagar R$&nbsp;9,90</>
                    )}
                  </Button>

                  <div className="flex items-center justify-center gap-2 text-xs text-gray-400 mt-2">
                    <Lock className="w-3 h-3" />
                    Dados criptografados pelo Mercado Pago
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
