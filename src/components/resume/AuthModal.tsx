import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Mail, Lock, Eye, EyeOff, Chrome, User } from "lucide-react";
import {
  loginWithGoogle,
  loginWithEmail,
  registerWithEmail,
  grantWelcomeCredits,
} from "@/lib/firebase";
import { updateProfile } from "firebase/auth";
import { toast } from "sonner";

interface Props {
  onClose: () => void;
  /** Chamado após login/cadastro bem-sucedido */
  onSuccess: () => void;
  /** Se true, mostra contexto de "para salvar seu currículo" */
  context?: "save" | "premium";
}

const AuthModal = ({ onClose, onSuccess, context = "premium" }: Props) => {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGoogle = async () => {
    setLoading(true);
    try {
      const result = await loginWithGoogle();
      const uid = result.user.uid;
      // Verifica se é novo usuário pelo Firebase (_tokenResponse é interno mas confiável)
      const isNew = (result as any)._tokenResponse?.isNewUser === true;
      if (isNew) {
        await grantWelcomeCredits(uid);
        toast.success("Conta criada! Você ganhou 8 créditos grátis ⚡");
      } else {
        toast.success("Login realizado com sucesso!");
      }
      onSuccess();
    } catch (e: any) {
      toast.error(e?.message || "Erro ao entrar com Google.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmail = async () => {
    if (!email || !password) {
      toast.error("Preencha e-mail e senha.");
      return;
    }
    if (mode === "register" && !name.trim()) {
      toast.error("Preencha seu nome.");
      return;
    }
    setLoading(true);
    try {
      if (mode === "login") {
        await loginWithEmail(email, password);
        toast.success("Login realizado!");
      } else {
        const credential = await registerWithEmail(email, password);
        // Atualiza o nome do usuário
        await updateProfile(credential.user, { displayName: name.trim() });
        await grantWelcomeCredits(credential.user.uid);
        toast.success("Conta criada! Você ganhou 8 créditos grátis ⚡");
      }
      onSuccess();
    } catch (e: any) {
      const msg =
        e?.code === "auth/email-already-in-use"
          ? "E-mail já cadastrado. Faça login."
          : e?.code === "auth/wrong-password" || e?.code === "auth/user-not-found"
          ? "E-mail ou senha incorretos."
          : e?.code === "auth/weak-password"
          ? "Senha muito fraca (mín. 6 caracteres)."
          : e?.message || "Erro ao autenticar.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-md p-8 relative">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">⚡</span>
          </div>
          {context === "premium" ? (
            <>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Ganhe 8 créditos grátis
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Crie sua conta e use créditos para importar LinkedIn, gerar
                carta de apresentação, melhorar com IA e muito mais.
              </p>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Salvar currículo
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Crie uma conta grátis e ganhe 8 créditos de boas-vindas ⚡
              </p>
            </>
          )}
        </div>

        {/* Google */}
        <Button
          variant="outline"
          className="w-full flex items-center gap-3 mb-4 h-11"
          onClick={handleGoogle}
          disabled={loading}
        >
          <Chrome className="w-4 h-4" />
          Continuar com Google
        </Button>

        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-gray-200 dark:bg-zinc-700" />
          <span className="text-xs text-gray-400">ou</span>
          <div className="flex-1 h-px bg-gray-200 dark:bg-zinc-700" />
        </div>

        {/* Email / senha */}
        <div className="space-y-3">
          {mode === "register" && (
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Seu nome"
                className="pl-9"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="email"
              placeholder="seu@email.com"
              className="pl-9"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleEmail()}
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type={showPass ? "text" : "password"}
              placeholder="Senha (mín. 6 caracteres)"
              className="pl-9 pr-9"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleEmail()}
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <Button
          className="w-full mt-4 h-11 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white"
          onClick={handleEmail}
          disabled={loading}
        >
          {loading
            ? "Aguarde..."
            : mode === "login"
            ? "Entrar"
            : "Criar conta grátis"}
        </Button>

        <p className="text-center text-sm text-gray-500 mt-4">
          {mode === "login" ? (
            <>
              Não tem conta?{" "}
              <button
                className="text-blue-600 hover:underline font-medium"
                onClick={() => setMode("register")}
              >
                Criar grátis
              </button>
            </>
          ) : (
            <>
              Já tem conta?{" "}
              <button
                className="text-blue-600 hover:underline font-medium"
                onClick={() => setMode("login")}
              >
                Entrar
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default AuthModal;