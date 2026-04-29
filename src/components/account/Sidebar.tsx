import { User as FirebaseUser } from "firebase/auth";
import { Link } from "react-router-dom";
import { LayoutDashboard, Settings, History, ArrowLeft, LogOut } from "lucide-react";
import { logout } from "@/lib/firebase";
import { Button } from "@/components/ui/button";

type Section = "overview" | "settings" | "history";

interface SidebarProps {
  user: FirebaseUser;
  activeSection: Section;
  onSectionChange: (section: Section) => void;
}

export function Sidebar({ user, activeSection, onSectionChange }: SidebarProps) {
  const menuItems = [
    { id: "overview" as Section, label: "Visão Geral", icon: LayoutDashboard },
    { id: "settings" as Section, label: "Configurações", icon: Settings },
    { id: "history" as Section, label: "Histórico", icon: History },
  ];

  return (
    <aside className="hidden md:flex w-64 bg-card border-r border-border flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3 mb-4">
          <img 
            src="/ponteiro_clickfacil.ico" 
            alt="Click Fácil" 
            className="w-8 h-8"
          />
          <span className="font-bold font-display text-foreground">Click Fácil</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground truncate">
            {user.displayName || "Usuário"}
          </p>
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border space-y-2">
        <Link to="/">
          <Button variant="outline" size="sm" className="w-full justify-start gap-2">
            <ArrowLeft className="w-4 h-4" />
            Voltar ao editor
          </Button>
        </Link>
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
          onClick={() => logout()}
        >
          <LogOut className="w-4 h-4" />
          Sair
        </Button>
      </div>
    </aside>
  );
}
