import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, CheckCircle, Zap, AlertCircle } from "lucide-react";

// ⚠️  Substitua pela URL do seu link de pagamento do Mercado Pago
const MERCADO_PAGO_LINK = "https://mpago.la/SEU_LINK_AQUI";

const PREMIUM_TEMPLATES = [
  { emoji: "🎨", name: "Moderno", desc: "Sidebar lateral com ícones" },
  { emoji: "✨", name: "Criativo", desc: "Colorido e ousado" },
  { emoji: "👔", name: "Executivo", desc: "Elegante e sofisticado" },
];

interface Props {
  onClose: () => void;
  /** Chamado quando usuário clica "Já paguei" — app vai verificar no Firestore */
  onAlreadyPaid: () => void;
}

const PaymentModal = ({ onClose, onAlreadyPaid }: Props) => {
  const [checking, setChecking] = useState(false);

  const handlePay = () => {
    // Abre o link do MP numa nova aba.
    // O MP redireciona para /?payment=success após pagamento com cartão.
    window.open(MERCADO_PAGO_LINK, "_blank");
  };

  const handleAlreadyPaid = async () => {
    setChecking(true);
    // Pequeno delay para dar tempo do webhook processar
    await new Promise((r) => setTimeout(r, 1500));
    setChecking(false);
    onAlreadyPaid();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-md p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-3 shadow-lg">
            <Zap className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Templates Premium
          </h2>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="text-gray-400 line-through text-base">R$&nbsp;19,90</span>
            <span className="text-3xl font-extrabold text-green-600">R$&nbsp;9,90</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">pagamento único · acesso vitalício</p>
        </div>

        {/* Templates incluídos */}
        <ul className="space-y-2 mb-6">
          {PREMIUM_TEMPLATES.map((t) => (
            <li key={t.name} className="flex items-center gap-3 text-sm">
              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
              <span className="font-medium">{t.emoji} {t.name}</span>
              <span className="text-gray-400">— {t.desc}</span>
            </li>
          ))}
          <li className="flex items-center gap-3 text-sm">
            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
            <span className="font-medium">💾 Currículo salvo na nuvem</span>
          </li>
          <li className="flex items-center gap-3 text-sm">
            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
            <span className="font-medium">📱 Acesso em qualquer dispositivo</span>
          </li>
        </ul>

        {/* CTA principal */}
        <Button
          className="w-full h-12 text-base font-bold bg-[#009ee3] hover:bg-[#0087c3] text-white"
          onClick={handlePay}
        >
          Pagar R$&nbsp;9,90 no Mercado Pago
        </Button>

        {/* Aviso PIX */}
        <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200 flex gap-2 text-xs text-amber-800">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>
            Pagou por <strong>PIX ou boleto</strong>? O Mercado Pago não
            redireciona automaticamente nesses casos. Clique em{" "}
            <strong>"Já paguei"</strong> abaixo para liberar seu acesso.
          </span>
        </div>

        {/* Já paguei */}
        <Button
          variant="outline"
          className="w-full mt-3 h-10 border-green-500 text-green-700 hover:bg-green-50"
          onClick={handleAlreadyPaid}
          disabled={checking}
        >
          {checking ? "Verificando..." : "✅ Já paguei — liberar acesso"}
        </Button>

        <p className="text-center text-xs text-gray-400 mt-4">
          Precisa de ajuda?{" "}
          <a
            href="mailto:contato@clickfacil.com.br"
            className="text-blue-500 hover:underline"
          >
            contato@clickfacil.com.br
          </a>
        </p>
      </div>
    </div>
  );
};

export default PaymentModal;
