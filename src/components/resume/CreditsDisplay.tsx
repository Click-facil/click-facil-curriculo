import { Zap, Infinity } from "lucide-react";

interface CreditsDisplayProps {
  credits: number;
  isUnlimited: boolean;
  onClick: () => void;
}

export function CreditsDisplay({ credits, isUnlimited, onClick }: CreditsDisplayProps) {
  const low = !isUnlimited && credits <= 2;

  return (
    <button
      onClick={onClick}
      title="Ver e comprar créditos"
      className={`
        flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold
        border transition-colors cursor-pointer select-none
        ${low
          ? "bg-red-50 border-red-200 text-red-700 hover:bg-red-100 dark:bg-red-950 dark:border-red-800 dark:text-red-400"
          : "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-400"
        }
      `}
    >
      <Zap className="w-3.5 h-3.5 fill-current" />
      {isUnlimited ? (
        <Infinity className="w-3.5 h-3.5" />
      ) : (
        <span>{credits}</span>
      )}
      <span className="hidden sm:inline">créditos</span>
      {low && <span className="hidden sm:inline text-red-500">— comprar</span>}
    </button>
  );
}