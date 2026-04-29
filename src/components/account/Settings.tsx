import { useState } from "react";
import { User as FirebaseUser } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, AlertTriangle, Loader2, FileX, Edit2, Check, X } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteUser, updateProfile } from "firebase/auth";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface SettingsProps {
  user: FirebaseUser;
}

export function Settings({ user }: SettingsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(user.displayName || "");
  const [savingName, setSavingName] = useState(false);
  const navigate = useNavigate();

  const handleSaveName = async () => {
    if (!newName.trim()) {
      toast.error("Nome não pode estar vazio");
      return;
    }

    setSavingName(true);
    try {
      await updateProfile(user, { displayName: newName.trim() });
      toast.success("Nome atualizado com sucesso!");
      setEditingName(false);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao atualizar nome. Tente novamente.");
    } finally {
      setSavingName(false);
    }
  };

  const handleCancelEdit = () => {
    setNewName(user.displayName || "");
    setEditingName(false);
  };

  const handleClearData = () => {
    const storageKey = `clickfacil_resume_${user.uid}`;
    localStorage.removeItem(storageKey);
    localStorage.removeItem(`${storageKey}_timestamp`);
    localStorage.removeItem("clickfacil_template");
    setShowClearDialog(false);
    toast.success("Dados do currículo limpos com sucesso!");
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      // Deleta dados do Firestore
      await deleteDoc(doc(db, "users", user.uid));
      
      // Limpa localStorage
      const storageKey = `clickfacil_resume_${user.uid}`;
      localStorage.removeItem(storageKey);
      localStorage.removeItem(`${storageKey}_timestamp`);
      localStorage.removeItem("clickfacil_template");
      
      // Deleta conta do Firebase Auth
      await deleteUser(user);
      
      toast.success("Conta excluída com sucesso");
      navigate("/");
    } catch (error: any) {
      console.error(error);
      if (error.code === "auth/requires-recent-login") {
        toast.error("Por segurança, faça login novamente antes de excluir sua conta");
      } else {
        toast.error("Erro ao excluir conta. Tente novamente.");
      }
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold font-display text-foreground mb-2">
          Configurações
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Gerencie sua conta e dados
        </p>
      </div>

      {/* Informações da conta */}
      <div className="bg-card border border-border rounded-xl p-4 md:p-6">
        <h3 className="font-semibold text-foreground mb-4">Informações da conta</h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground">Nome</label>
            {editingName ? (
              <div className="flex items-center gap-2 mt-1">
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Seu nome"
                  className="flex-1"
                  disabled={savingName}
                />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleSaveName}
                  disabled={savingName}
                >
                  {savingName ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4 text-green-600" />
                  )}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleCancelEdit}
                  disabled={savingName}
                >
                  <X className="w-4 h-4 text-red-600" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between mt-1">
                <p className="text-sm text-foreground font-medium">
                  {user.displayName || "Não informado"}
                </p>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setEditingName(true)}
                  className="gap-2"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Editar
                </Button>
              </div>
            )}
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Email</label>
            <p className="text-sm text-foreground font-medium">{user.email}</p>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Conta criada em</label>
            <p className="text-sm text-foreground font-medium">
              {user.metadata.creationTime 
                ? new Date(user.metadata.creationTime).toLocaleDateString("pt-BR")
                : "Não disponível"}
            </p>
          </div>
        </div>
      </div>

      {/* Ações */}
      <div className="bg-card border border-border rounded-xl p-4 md:p-6">
        <h3 className="font-semibold text-foreground mb-4">Ações</h3>
        <div className="space-y-3">
          {/* Limpar dados */}
          <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4 p-4 rounded-lg border border-border">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <FileX className="w-4 h-4 text-muted-foreground" />
                <h4 className="font-medium text-foreground text-sm">Limpar dados do currículo</h4>
              </div>
              <p className="text-xs text-muted-foreground">
                Remove todos os dados preenchidos no formulário. Sua conta e créditos não serão afetados.
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowClearDialog(true)}
              className="w-full sm:w-auto"
            >
              Limpar
            </Button>
          </div>

          {/* Excluir conta */}
          <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4 p-4 rounded-lg border border-destructive/50 bg-destructive/5">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-destructive" />
                <h4 className="font-medium text-destructive text-sm">Excluir conta</h4>
              </div>
              <p className="text-xs text-muted-foreground">
                Remove permanentemente sua conta, créditos e todos os dados. Esta ação não pode ser desfeita.
              </p>
            </div>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              className="w-full sm:w-auto"
            >
              Excluir
            </Button>
          </div>
        </div>
      </div>

      {/* Dialog - Limpar dados */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Limpar dados do currículo?</AlertDialogTitle>
            <AlertDialogDescription>
              Todos os dados preenchidos no formulário serão removidos. Sua conta e créditos permanecerão intactos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearData}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog - Excluir conta */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Excluir conta permanentemente?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação é <strong>irreversível</strong>. Todos os seus dados, créditos e histórico serão perdidos para sempre.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteAccount}
              disabled={deleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Excluindo...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir conta
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
