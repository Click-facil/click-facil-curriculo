import { useState, useEffect } from "react";
import { User as FirebaseUser } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useCredits } from "@/hooks/useCredits";
import { Button } from "@/components/ui/button";
import { FileText, Zap, Calendar, ArrowRight } from "lucide-react";
import { isAdmin } from "@/lib/admin";

interface OverviewProps {
  user: FirebaseUser;
}

export function Overview({ user }: OverviewProps) {
  const { credits, isUnlimited } = useCredits(user.uid);
  const [lastEdited, setLastEdited] = useState<Date | null>(null);
  const [hasResume, setHasResume] = useState(false);
  const navigate = useNavigate();
  const userIsAdmin = isAdmin(user.uid);

  useEffect(() => {
    const storageKey = `clickfacil_resume_${user.uid}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      setHasResume(true);
      // Tenta pegar a data de modificação do localStorage
      const timestamp = localStorage.getItem(`${storageKey}_timestamp`);
      if (timestamp) {
        setLastEdited(new Date(parseInt(timestamp)));
      }
    }
  }, [user.uid]);

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold font-display text-foreground mb-2">
          Olá, {user.displayName || "Usuário"}! 👋
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Bem-vindo à sua área pessoal
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        {/* Créditos */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border border-blue-200 dark:border-blue-800/50 rounded-xl p-4 md:p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Créditos disponíveis</p>
              <p className="text-2xl font-bold text-foreground">
                {userIsAdmin ? "∞" : credits}
              </p>
            </div>
          </div>
          {userIsAdmin ? (
            <p className="text-xs text-blue-800 dark:text-blue-400">
              Você tem acesso ilimitado como administrador
            </p>
          ) : (
            <p className="text-xs text-blue-800 dark:text-blue-400">
              {credits < 5 && "Considere adicionar mais créditos para continuar usando todas as funcionalidades"}
              {credits >= 5 && "Você tem créditos suficientes para várias ações"}
            </p>
          )}
        </div>

        {/* Currículo */}
        <div className="bg-card border border-border rounded-xl p-4 md:p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Seu currículo</p>
              <p className="text-lg font-semibold text-foreground">
                {hasResume ? "Salvo" : "Não iniciado"}
              </p>
            </div>
          </div>
          {lastEdited && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
              <Calendar className="w-3.5 h-3.5" />
              Última edição: {lastEdited.toLocaleDateString("pt-BR")}
            </div>
          )}
          <Button 
            onClick={() => navigate("/")} 
            size="sm" 
            className="w-full"
          >
            {hasResume ? "Continuar editando" : "Começar agora"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* Info adicional */}
      <div className="bg-muted/50 rounded-xl p-4 md:p-6">
        <h3 className="font-semibold text-foreground mb-3 text-sm md:text-base">O que você pode fazer:</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">✓</span>
            <span>Criar e editar seu currículo com 8 templates profissionais</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">✓</span>
            <span>Melhorar textos com IA e gerar carta de apresentação</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">✓</span>
            <span>Analisar compatibilidade ATS e ver vagas personalizadas</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">✓</span>
            <span>Baixar em PDF quantas vezes quiser (2 créditos por download)</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
