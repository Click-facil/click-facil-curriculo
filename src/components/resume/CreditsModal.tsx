import { useState, useEffect, useRef, useCallback } from "react";
import { X, QrCode, CreditCard, Copy, Check, Loader2, CheckCircle, AlertCircle, Lock, Coins, Zap, Star, Crown, Infinity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

declare global {
  interface Window {
    MercadoPago: new (publicKey: string, options?: { locale: string }) => MPInstance;
  }
}
interface MPInstance {
  cardForm: (options: object) => MPCardForm;
}
interface MPCardForm {
  getCardFormData: () => MPCardFormData;
  unmount: () => void;
}
interface MPCardFormData {
  token: string;
  issuer_id: string;
  payment_method_id: string;
  transaction_amount: number;
  installments: number;
  payer: { email: string; identification: { type: string; number: string } };
}

const MP_PUBLIC_KEY = import.meta.env.VITE_MP_PUBLIC_KEY as string;

interface CreditsModalProps {
  uid: string;
  email: string;
  credits: number;
  triggerAction?: string;
  onClose: () => void;
  onSuccess: () => void;
}

type Tab = "pix" | "card";
type PaymentStep = "idle" | "loading" | "waiting" | "confirmed" | "error";

const PACKAGES = [
  { id: "starter", name: "Starter", credits: 10, price: 4.90, icon: Coins, color: "blue" },
  { id: "popular", name: "Popular", credits: 30, price: 9.90, icon: Zap, color: "violet", badge: "Mais vendido" },
  { id: "pro", name: "Pro", credits: 80, price: 19.90, icon: Star, color: "amber" },
  { id: "subscription", name: "Assinatura", credits: 50, price: 14.90, icon: Crown, color: "emerald", recurring: true },
];

const CreditsModal = ({ uid, email, credits, triggerAction, onClose, onSuccess }: CreditsModalProps) => {
  const [selectedPackage, setSelectedPackage] = useState("popular");
  const [tab, setTab] = useState<Tab>("pix");
  const [paymentStep, setPaymentStep] = useState<PaymentStep>("idle");
  const [pixCode, setPixCode] = useState("");
  const [pixQrBase64, setPixQrBase64] = useState("");
  const [pixPaymentId, setPixPaymentId] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [cardError, setCardError] = useState("");
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mpFormRef = useRef<MPCardForm | null>(null);
  const isMountedRef = useRef(false);

  const selectedPkg = PACKAGES.find(p => p.id === selectedPackage) || PACKAGES[1];

  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      safeUnmountForm();
    };
  }, []);

  useEffect(() => {
    if (tab === "card") {
      loadAndInitMP();
    } else {
      safeUnmountForm();
    }
  }, [tab, selectedPackage]);

  const safeUnmountForm = () => {
    if (mpFormRef.current && isMountedRef.current) {
      try {
        mpFormRef.current.unmount();
      } catch (e) {
        // ignora erro
      }
      mpFormRef.current = null;
      isMountedRef.current = false;
    }
  };

  const loadAndInitMP = () => {
    const scriptId = "mp-js";
    if (document.getElementById(scriptId) && window.MercadoPago) {
      initMPForm();
      return;
    }
    if (document.getElementById(scriptId)) {
      const interval = setInterval(() => {
        if (window.MercadoPago) {
          clearInterval(interval);
          initMPForm();
        }
      }, 100);
      return;
    }
    const script = document.createElement("script");
    script.id = scriptId;
    script.src = "https://sdk.mercadopago.com/js/v2";
    script.onload = initMPForm;
    document.head.appendChild(script);
  };

  const initMPForm = () => {
    if (!window.MercadoPago) return;
    setTimeout(() => {
      try {
        const mp = new window.MercadoPago(MP_PUBLIC_KEY, { locale: "pt-BR" });
        mpFormRef.current = mp.cardForm({
          amount: selectedPkg.price.toFixed(2),
          iframe: true,
          form: {
            id: "mp-card-form",
            cardNumber: { id: "mp-card-number", placeholder: "Número do cartão" },
            expirationDate: { id: "mp-expiration-date", placeholder: "MM/AA" },
            securityCode: { id: "mp-security-code", placeholder: "CVV" },
            cardholderName: { id: "mp-cardholder-name", placeholder: "Nome igual no cartão", type: "text" },
            issuer: { id: "mp-issuer", placeholder: "Banco emissor" },
            installments: { id: "mp-installments", placeholder: "Parcelas" },
            identificationType: { id: "mp-identification-type", placeholder: "Tipo" },
            identificationNumber: { id: "mp-identification-number", placeholder: "CPF" },
            cardholderEmail: { id: "mp-cardholder-email", placeholder: email },
          },
          callbacks: {
            onFormMounted: (err: unknown) => {
              if (err) {
                console.warn("MP form mount error:", err);
                isMountedRef.current = false;
              } else {
                isMountedRef.current = true;
              }
            },
            onSubmit: async (e: Event) => {
              e.preventDefault();
              const data = mpFormRef.current?.getCardFormData();
              if (!data?.token) return;
              await processCard(data);
            },
          },
        });
      } catch (e) {
        console.error("MP init error:", e);
      }
    }, 300);
  };

  const handleGeneratePix = async () => {
    setPaymentStep("loading");
    try {
      const res = await fetch("/api/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          method: "pix", 
          uid, 
          email,
          package_id: selectedPackage,
          amount: selectedPkg.price,
        }),
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
      setPaymentStep("waiting");
      startPolling(data.payment_id);
    } catch (err) {
      console.error(err);
      setPaymentStep("error");
    }
  };

  const startPolling = useCallback((paymentId: number) => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/check-payment?payment_id=${paymentId}`);
        const data = await res.json() as { status: string };
        if (data.status === "approved") {
          clearInterval(pollingRef.current!);
          setPaymentStep("confirmed");
          setTimeout(() => onSuccess(), 2000);
        }
      } catch { /* continua tentando */ }
    }, 5000);
  }, [onSuccess]);

  const handleCopy = () => {
    navigator.clipboard.writeText(pixCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const processCard = async (formData: MPCardFormData) => {
    setPaymentStep("loading");
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
          package_id: selectedPackage,
          amount: selectedPkg.price,
        }),
      });
      const data = await res.json() as { status: string; status_detail: string; error?: string };
      if (!res.ok || data.error) throw new Error(data.error || "Erro ao processar cartão");

      if (data.status === "approved") {
        setPaymentStep("confirmed");
        setTimeout(() => onSuccess(), 2000);
      } else if (data.status === "in_process") {
        setCardError("Pagamento em análise. Você receberá uma confirmação em breve.");
        setPaymentStep("idle");
      } else {
        const msgs: Record<string, string> = {
          cc_rejected_insufficient_amount: "Saldo insuficiente no cartão.",
          cc_rejected_bad_filled_card_number: "Número do cartão inválido.",
          cc_rejected_bad_filled_security_code: "CVV incorreto.",
          cc_rejected_bad_filled_date: "Data de vencimento incorreta.",
          cc_rejected_call_for_authorize: "Cartão bloqueado. Entre em contato com o banco.",
        };
        setCardError(msgs[data.status_detail] || "Cartão recusado. Verifique os dados ou tente outro cartão.");
        setPaymentStep("error");
      }
    } catch (err) {
      console.error(err);
      setCardError("Erro ao processar. Tente novamente.");
      setPaymentStep("error");
    }
  };

  const handleTabChange = (newTab: Tab) => {
    if (newTab === tab) return;
    if (newTab === "pix") {
      safeUnmountForm();
    }
    setTab(newTab);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-5 text-white sticky top-0 z-10">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Comprar Créditos</h2>
              <p className="text-sm text-white/80">Saldo atual: {credits} créditos</p>
            </div>
          </div>
          {triggerAction && (
            <div className="mt-3 bg-white/10 rounded-lg px-3 py-2 text-sm">
              💡 {triggerAction}
            </div>
          )}
        </div>

        {/* Pacotes */}
        <div className="p-6 space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Escolha seu pacote:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PACKAGES.map((pkg) => {
              const Icon = pkg.icon;
              const isSelected = selectedPackage === pkg.id;
              return (
                <button
                  key={pkg.id}
                  onClick={() => setSelectedPackage(pkg.id)}
                  className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                    isSelected
                      ? `border-${pkg.color}-500 bg-${pkg.color}-50 dark:bg-${pkg.color}-950`
                      : "border-gray-200 dark:border-zinc-700 hover:border-gray-300"
                  }`}
                >
                  {pkg.badge && (
                    <span className="absolute -top-2 -right-2 bg-violet-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {pkg.badge}
                    </span>
                  )}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-5 h-5 text-${pkg.color}-600`} />
                      <span className="font-bold text-gray-800 dark:text-white">{pkg.name}</span>
                    </div>
                    {isSelected && <Check className="w-5 h-5 text-green-600" />}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-1">
                      {pkg.recurring ? (
                        <>
                          <Infinity className="w-4 h-4 text-emerald-600" />
                          <span className="text-2xl font-extrabold text-gray-900 dark:text-white">
                            {pkg.credits}
                          </span>
                          <span className="text-sm text-gray-500">/mês</span>
                        </>
                      ) : (
                        <>
                          <span className="text-2xl font-extrabold text-gray-900 dark:text-white">
                            {pkg.credits}
                          </span>
                          <span className="text-sm text-gray-500">créditos</span>
                        </>
                      )}
                    </div>
                    <div className="text-lg font-bold text-gray-700 dark:text-gray-300">
                      R$ {pkg.price.toFixed(2)}
                      {pkg.recurring && <span className="text-xs font-normal">/mês</span>}
                    </div>
                    {!pkg.recurring && (
                      <div className="text-xs text-gray-500">
                        R$ {(pkg.price / pkg.credits).toFixed(2)} por crédito
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-zinc-700 mt-6">
            <button
              onClick={() => handleTabChange("pix")}
              className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition border-b-2 ${
                tab === "pix" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <QrCode className="w-4 h-4" /> PIX
            </button>
            <button
              onClick={() => handleTabChange("card")}
              className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition border-b-2 ${
                tab === "card" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <CreditCard className="w-4 h-4" /> Cartão de Crédito
            </button>
          </div>

          {/* PIX Tab */}
          {tab === "pix" && (
            <div className="space-y-4 pt-4">
              {paymentStep === "idle" && (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                    <QrCode className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-white">Pague com PIX</p>
                    <p className="text-sm text-gray-500 mt-1">QR code gerado na hora. Aprovação em segundos.</p>
                  </div>
                  <Button className="w-full h-11 bg-green-600 hover:bg-green-700 text-white font-bold" onClick={handleGeneratePix}>
                    Gerar QR Code PIX - R$ {selectedPkg.price.toFixed(2)}
                  </Button>
                </div>
              )}
              {paymentStep === "loading" && (
                <div className="flex flex-col items-center gap-3 py-6">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  <p className="text-sm text-gray-500">Gerando PIX...</p>
                </div>
              )}
              {paymentStep === "waiting" && (
                <div className="space-y-4">
                  <p className="text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                    Escaneie o QR code ou copie o código abaixo
                  </p>
                  {pixQrBase64 && (
                    <div className="flex justify-center">
                      <img src={`data:image/png;base64,${pixQrBase64}`} alt="QR Code PIX" className="w-48 h-48 rounded-xl border border-gray-200" />
                    </div>
                  )}
                  <div className="bg-gray-50 dark:bg-zinc-800 rounded-xl p-3">
                    <p className="text-xs text-gray-500 mb-2 font-medium">PIX Copia e Cola:</p>
                    <div className="flex gap-2">
                      <input readOnly value={pixCode} className="flex-1 text-xs bg-transparent text-gray-700 dark:text-gray-300 outline-none truncate" />
                      <button onClick={handleCopy} className="flex-shrink-0 flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition">
                        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        {copied ? "Copiado!" : "Copiar"}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Aguardando confirmação do pagamento...
                  </div>
                </div>
              )}
              {paymentStep === "confirmed" && (
                <div className="flex flex-col items-center gap-3 py-6 text-center">
                  <CheckCircle className="w-14 h-14 text-green-500" />
                  <p className="text-lg font-bold text-gray-800 dark:text-white">Pagamento confirmado! 🎉</p>
                  <p className="text-sm text-gray-500">+{selectedPkg.credits} créditos adicionados à sua conta</p>
                </div>
              )}
              {paymentStep === "error" && (
                <div className="flex flex-col items-center gap-3 py-4 text-center">
                  <AlertCircle className="w-10 h-10 text-red-500" />
                  <p className="text-sm text-gray-700 dark:text-gray-300">Erro ao gerar o PIX. Tente novamente.</p>
                  <Button variant="outline" onClick={() => setPaymentStep("idle")}>Tentar novamente</Button>
                </div>
              )}
            </div>
          )}

          {/* Card Tab */}
          {tab === "card" && (
            <div className="pt-4">
              {paymentStep === "confirmed" ? (
                <div className="flex flex-col items-center gap-3 py-6 text-center">
                  <CheckCircle className="w-14 h-14 text-green-500" />
                  <p className="text-lg font-bold text-gray-800 dark:text-white">Pagamento aprovado! 🎉</p>
                  <p className="text-sm text-gray-500">+{selectedPkg.credits} créditos adicionados à sua conta</p>
                </div>
              ) : (
                <form id="mp-card-form" className="space-y-3">
                  {cardError && (
                    <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      {cardError}
                    </div>
                  )}
                  <div>
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Número do cartão</label>
                    <div id="mp-card-number" className="h-10 border border-gray-300 dark:border-zinc-600 rounded-lg px-3 bg-white dark:bg-zinc-800" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Validade</label>
                      <div id="mp-expiration-date" className="h-10 border border-gray-300 dark:border-zinc-600 rounded-lg px-3 bg-white dark:bg-zinc-800" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">CVV</label>
                      <div id="mp-security-code" className="h-10 border border-gray-300 dark:border-zinc-600 rounded-lg px-3 bg-white dark:bg-zinc-800" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Nome no cartão</label>
                    <div id="mp-cardholder-name" className="h-10 border border-gray-300 dark:border-zinc-600 rounded-lg px-3 bg-white dark:bg-zinc-800" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Tipo documento</label>
                      <div id="mp-identification-type" className="h-10 border border-gray-300 dark:border-zinc-600 rounded-lg px-3 bg-white dark:bg-zinc-800" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">CPF</label>
                      <div id="mp-identification-number" className="h-10 border border-gray-300 dark:border-zinc-600 rounded-lg px-3 bg-white dark:bg-zinc-800" />
                    </div>
                  </div>
                  <div id="mp-issuer" style={{ display: "none" }} />
                  <div id="mp-installments" style={{ display: "none" }} />
                  <div id="mp-cardholder-email" style={{ display: "none" }} />
                  <Button
                    type="submit"
                    className="w-full h-11 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white font-bold mt-2"
                    disabled={paymentStep === "loading"}
                  >
                    {paymentStep === "loading" ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processando...</>
                    ) : (
                      <><Lock className="w-4 h-4 mr-2" /> Pagar R$ {selectedPkg.price.toFixed(2)}</>
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

export default CreditsModal;
