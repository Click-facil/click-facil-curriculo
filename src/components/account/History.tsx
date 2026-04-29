import { useState, useEffect } from "react";
import { User as FirebaseUser } from "firebase/auth";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2, TrendingUp, TrendingDown, Clock } from "lucide-react";

interface Transaction {
  id: string;
  type: "spend" | "add";
  action: string;
  amount: number;
  balanceAfter: number;
  timestamp: Date;
}

interface HistoryProps {
  user: FirebaseUser;
}

const ACTION_LABELS: Record<string, string> = {
  DOWNLOAD_PDF: "Download PDF",
  LINKEDIN_IMPORT: "Importação LinkedIn",
  COVER_LETTER: "Carta de apresentação",
  IMPROVE_AI: "Melhoria de texto IA",
  UNLOCK_TEMPLATE: "Desbloqueio de template",
  ATS_ANALYSIS: "Análise ATS",
  PURCHASE: "Compra de créditos",
  WELCOME: "Boas-vindas",
};

export function History({ user }: HistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const q = query(
          collection(db, "users", user.uid, "transactions"),
          orderBy("timestamp", "desc"),
          limit(50)
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate() || new Date(),
        })) as Transaction[];
        setTransactions(data);
      } catch (error) {
        console.error("Erro ao buscar histórico:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [user.uid]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold font-display text-foreground mb-2">
          Histórico
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Todas as suas transações de créditos
        </p>
      </div>

      {transactions.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">Nenhuma transação ainda</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {/* Mobile: Cards */}
          <div className="md:hidden divide-y divide-border">
            {transactions.map((transaction) => {
              const isAdd = transaction.type === "add";
              return (
                <div key={transaction.id} className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {ACTION_LABELS[transaction.action] || transaction.action}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <Clock className="w-3 h-3 flex-shrink-0" />
                        {transaction.timestamp.toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`inline-flex items-center gap-1 text-sm font-semibold ${
                        isAdd ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500"
                      }`}>
                        {isAdd ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        {isAdd ? "+" : "-"}{transaction.amount}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Saldo: {transaction.balanceAfter}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop: Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-3">
                    Data
                  </th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-3">
                    Ação
                  </th>
                  <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-3">
                    Créditos
                  </th>
                  <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-3">
                    Saldo após
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {transactions.map((transaction) => {
                  const isAdd = transaction.type === "add";
                  return (
                    <tr key={transaction.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-3.5 h-3.5" />
                          {transaction.timestamp.toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-foreground">
                          {ACTION_LABELS[transaction.action] || transaction.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className={`inline-flex items-center gap-1 text-sm font-semibold ${
                          isAdd ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500"
                        }`}>
                          {isAdd ? (
                            <TrendingUp className="w-4 h-4" />
                          ) : (
                            <TrendingDown className="w-4 h-4" />
                          )}
                          {isAdd ? "+" : "-"}{transaction.amount}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-medium text-foreground">
                          {transaction.balanceAfter}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
