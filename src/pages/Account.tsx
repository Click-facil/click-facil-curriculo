import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth, onAuthChange, logout } from "@/lib/firebase";
import { User as FirebaseUser } from "firebase/auth";
import { Sidebar } from "@/components/account/Sidebar";
import { Overview } from "@/components/account/Overview";
import { Settings } from "@/components/account/Settings";
import { History } from "@/components/account/History";
import { Loader2, LayoutDashboard, Settings as SettingsIcon, History as HistoryIcon, ArrowLeft, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

type Section = "overview" | "settings" | "history";

const Account = () => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<Section>("overview");
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthChange((u) => {
      if (!u) {
        navigate("/");
      } else {
        setUser(u);
      }
      setLoading(false);
    });
    return unsub;
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Mobile: Header com menu */}
      <div className="md:hidden bg-card border-b border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <img 
              src="/ponteiro_clickfacil.ico" 
              alt="Click Fácil" 
              className="w-8 h-8"
            />
            <div>
              <p className="text-sm font-semibold text-foreground truncate">
                {user.displayName || "Usuário"}
              </p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
        </div>
        
        {/* Tabs mobile */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { id: "overview" as Section, label: "Visão Geral", icon: LayoutDashboard },
            { id: "settings" as Section, label: "Configurações", icon: SettingsIcon },
            { id: "history" as Section, label: "Histórico", icon: HistoryIcon },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </div>
        
        {/* Botões mobile */}
        <div className="flex gap-2 mt-4">
          <Link to="/" className="flex-1">
            <Button variant="outline" size="sm" className="w-full gap-2">
              <ArrowLeft className="w-4 h-4" />
              Editor
            </Button>
          </Link>
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-2"
            onClick={() => logout()}
          >
            <LogOut className="w-4 h-4" />
            Sair
          </Button>
        </div>
      </div>

      {/* Desktop: Sidebar */}
      <Sidebar 
        user={user} 
        activeSection={activeSection} 
        onSectionChange={setActiveSection}
      />
      
      <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {activeSection === "overview" && <Overview user={user} />}
          {activeSection === "settings" && <Settings user={user} />}
          {activeSection === "history" && <History user={user} />}
        </div>
      </main>
    </div>
  );
};

export default Account;
