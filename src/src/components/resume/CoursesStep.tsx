import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { Course } from "@/types/resume";
import FieldTooltip from "./FieldTooltip";
import { formatHours, formatYear } from "@/lib/phone-mask";

interface Props {
  data: Course[];
  onChange: (data: Course[]) => void;
}

const CoursesStep = ({ data, onChange }: Props) => {
  const add = () => {
    onChange([...data, { id: crypto.randomUUID(), name: "", institution: "", hours: "", year: "" }]);
  };

  const remove = (id: string) => onChange(data.filter((c) => c.id !== id));
  const update = (id: string, field: keyof Course, value: string) => {
    onChange(data.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold font-display text-foreground">Cursos e Certificações</h2>
        <p className="text-muted-foreground mt-1">Adicione cursos relevantes que valorizem seu perfil</p>
      </div>

      {data.length === 0 && (
        <div className="text-center py-8 text-muted-foreground bg-muted/50 rounded-lg border border-dashed border-border">
          <p className="text-sm">Nenhum curso adicionado ainda.</p>
          <p className="text-xs mt-1">Cursos online, workshops e certificações contam!</p>
        </div>
      )}

      {data.map((course, index) => (
        <div key={course.id} className="p-4 rounded-lg border border-border bg-card space-y-4 relative">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              Curso {index + 1}
            </span>
            <button type="button" onClick={() => remove(course.id)} className="text-muted-foreground hover:text-destructive transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label>Nome do Curso * <FieldTooltip text="Nome completo do curso ou certificação obtida." /></Label>
              <Input placeholder="Ex: Excel Avançado, Marketing Digital" value={course.name} onChange={(e) => update(course.id, "name", e.target.value)} />
            </div>
            <div>
              <Label>Instituição * <FieldTooltip text="Onde realizou: Senai, Coursera, Udemy, etc." /></Label>
              <Input placeholder="Onde realizou o curso" value={course.institution} onChange={(e) => update(course.id, "institution", e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Carga Horária</Label>
                <Input placeholder="Ex: 40h" value={course.hours} onChange={(e) => update(course.id, "hours", formatHours(e.target.value))} />
              </div>
              <div>
                <Label>Ano</Label>
                <Input placeholder="Ex: 2024" value={course.year} onChange={(e) => update(course.id, "year", formatYear(e.target.value))} />
              </div>
            </div>
          </div>
        </div>
      ))}

      <Button type="button" variant="outline" onClick={add} className="w-full border-dashed">
        <Plus className="w-4 h-4 mr-2" /> Adicionar Curso
      </Button>
    </div>
  );
};

export default CoursesStep;
