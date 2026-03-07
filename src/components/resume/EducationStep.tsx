import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2 } from "lucide-react";
import { Education } from "@/types/resume";
import FieldTooltip from "./FieldTooltip";

interface Props {
  data: Education[];
  onChange: (data: Education[]) => void;
}

const DEGREE_OPTIONS = [
  "Ensino Fundamental",
  "Ensino Médio",
  "Técnico",
  "Graduação",
  "Pós-Graduação",
  "MBA",
  "Mestrado",
  "Doutorado",
];

const EducationStep = ({ data, onChange }: Props) => {
  const add = () => {
    onChange([
      ...data,
      { id: crypto.randomUUID(), institution: "", course: "", degree: "Ensino Médio", startDate: "", endDate: "", current: false },
    ]);
  };

  const remove = (id: string) => onChange(data.filter((e) => e.id !== id));
  const update = (id: string, field: keyof Education, value: string | boolean) => {
    onChange(data.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold font-display text-foreground">Formação Acadêmica</h2>
        <p className="text-muted-foreground mt-1">Adicione suas formações, da mais recente para a mais antiga</p>
      </div>

      {data.length === 0 && (
        <div className="text-center py-8 text-muted-foreground bg-muted/50 rounded-lg border border-dashed border-border">
          <p className="text-sm">Nenhuma formação adicionada ainda.</p>
          <p className="text-xs mt-1">Clique no botão abaixo para começar.</p>
        </div>
      )}

      {data.map((edu, index) => (
        <div key={edu.id} className="p-4 rounded-lg border border-border bg-card space-y-4 relative">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              Formação {index + 1}
            </span>
            <button type="button" onClick={() => remove(edu.id)} className="text-muted-foreground hover:text-destructive transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label>Instituição * <FieldTooltip text="Nome completo da escola, faculdade ou universidade." /></Label>
              <Input placeholder="Nome da instituição" value={edu.institution} onChange={(e) => update(edu.id, "institution", e.target.value)} />
            </div>
            <div>
              <Label>Curso * <FieldTooltip text="Nome do curso que você fez ou está fazendo." /></Label>
              <Input placeholder="Nome do curso" value={edu.course} onChange={(e) => update(edu.id, "course", e.target.value)} />
            </div>
            <div>
              <Label>Nível *</Label>
              <select
                value={edu.degree}
                onChange={(e) => update(edu.id, "degree", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                {DEGREE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Início *</Label>
              <Input type="month" value={edu.startDate} onChange={(e) => update(edu.id, "startDate", e.target.value)} />
            </div>
            <div>
              <Label>Término</Label>
              <Input type="month" value={edu.endDate} onChange={(e) => update(edu.id, "endDate", e.target.value)} disabled={edu.current} />
              <div className="flex items-center gap-2 mt-2">
                <Checkbox id={`current-edu-${edu.id}`} checked={edu.current} onCheckedChange={(v) => update(edu.id, "current", !!v)} />
                <label htmlFor={`current-edu-${edu.id}`} className="text-sm text-muted-foreground">Cursando</label>
              </div>
            </div>
          </div>
        </div>
      ))}

      <Button type="button" variant="outline" onClick={add} className="w-full border-dashed">
        <Plus className="w-4 h-4 mr-2" /> Adicionar Formação
      </Button>
    </div>
  );
};

export default EducationStep;