import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";
import { Experience } from "@/types/resume";
import FieldTooltip from "./FieldTooltip";
import { ImproveButton } from "./ImproveButton";

interface Props {
  data: Experience[];
  onChange: (data: Experience[]) => void;
  spend: (action: string) => Promise<boolean>;
  onShowCredits: () => void;
}

const ExperienceStep = ({ data, onChange, spend, onShowCredits }: Props) => {
  const add = () => {
    onChange([...data, { id: crypto.randomUUID(), company: "", city: "", position: "", startDate: "", endDate: "", current: false, description: "" }]);
  };

  const remove = (id: string) => onChange(data.filter((e) => e.id !== id));
  const update = (id: string, field: keyof Experience, value: string | boolean) => {
    onChange(data.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold font-display text-foreground">Experiência Profissional</h2>
        <p className="text-muted-foreground mt-1">Descreva suas experiências, da mais recente para a mais antiga</p>
      </div>

      {data.length === 0 && (
        <div className="text-center py-8 text-muted-foreground bg-muted/50 rounded-lg border border-dashed border-border">
          <p className="text-sm">Nenhuma experiência adicionada ainda.</p>
          <p className="text-xs mt-1">Sem experiência? Pule esta etapa sem problemas!</p>
        </div>
      )}

      {data.map((exp, index) => (
        <div key={exp.id} className="p-4 rounded-lg border border-border bg-card space-y-4 relative">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              Experiência {index + 1}
            </span>
            <button type="button" onClick={() => remove(exp.id)} className="text-muted-foreground hover:text-destructive transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Empresa * <FieldTooltip text="Nome da empresa onde você trabalhou." /></Label>
              <Input placeholder="Nome da empresa" value={exp.company} onChange={(e) => update(exp.id, "company", e.target.value)} />
            </div>
            <div>
              <Label>Cidade da Empresa * <FieldTooltip text="Cidade e estado da empresa. Ex: São Paulo - SP" /></Label>
              <Input placeholder="Ex: São Paulo - SP" value={exp.city} onChange={(e) => update(exp.id, "city", e.target.value)} />
            </div>
            <div>
              <Label>Cargo * <FieldTooltip text="Seu cargo ou função exercida na empresa." /></Label>
              <Input placeholder="Seu cargo" value={exp.position} onChange={(e) => update(exp.id, "position", e.target.value)} />
            </div>
            <div>
              <Label>Início *</Label>
              <Input type="month" value={exp.startDate} onChange={(e) => update(exp.id, "startDate", e.target.value)} />
            </div>
            <div>
              <Label>Término</Label>
              <Input type="month" value={exp.endDate} onChange={(e) => update(exp.id, "endDate", e.target.value)} disabled={exp.current} />
              <div className="flex items-center gap-2 mt-2">
                <Checkbox id={`current-exp-${exp.id}`} checked={exp.current} onCheckedChange={(v) => update(exp.id, "current", !!v)} />
                <label htmlFor={`current-exp-${exp.id}`} className="text-sm text-muted-foreground">Emprego atual</label>
              </div>
            </div>
            <div className="md:col-span-2">
              <Label>Descrição das Atividades * <FieldTooltip text="Use verbos de ação e descreva resultados. Ex: 'Gerenciei equipe de 5 pessoas'. Cada linha será um tópico." /></Label>
              <Textarea
                placeholder="Descreva suas principais atividades e conquistas neste cargo. Use verbos de ação. Ex: Gerenciei equipe de 5 pessoas, aumentando a produtividade em 30%."
                value={exp.description}
                onChange={(e) => update(exp.id, "description", e.target.value)}
                rows={3}
              />
              <ImproveButton
                value={exp.description}
                onChange={(novoTexto) => update(exp.id, "description", novoTexto)}
                tipo="experiencia"
                spend={spend}
                onShowCredits={onShowCredits}
              />
            </div>
          </div>
        </div>
      ))}

      <Button type="button" variant="outline" onClick={add} className="w-full border-dashed">
        <Plus className="w-4 h-4 mr-2" /> Adicionar Experiência
      </Button>
    </div>
  );
};

export default ExperienceStep;
