import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { Skill, Language } from "@/types/resume";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FieldTooltip from "./FieldTooltip";

interface Props {
  skills: Skill[];
  languages: Language[];
  onSkillsChange: (data: Skill[]) => void;
  onLanguagesChange: (data: Language[]) => void;
}

const SkillsStep = ({ skills, languages, onSkillsChange, onLanguagesChange }: Props) => {
  const addSkill = () => onSkillsChange([...skills, { id: crypto.randomUUID(), name: "", level: "Intermediário" }]);
  const removeSkill = (id: string) => onSkillsChange(skills.filter((s) => s.id !== id));
  const updateSkill = (id: string, field: keyof Skill, value: string) => onSkillsChange(skills.map((s) => (s.id === id ? { ...s, [field]: value } : s)));

  const addLang = () => onLanguagesChange([...languages, { id: crypto.randomUUID(), name: "", level: "Básico" }]);
  const removeLang = (id: string) => onLanguagesChange(languages.filter((l) => l.id !== id));
  const updateLang = (id: string, field: keyof Language, value: string) => onLanguagesChange(languages.map((l) => (l.id === id ? { ...l, [field]: value } : l)));

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold font-display text-foreground">Habilidades e Idiomas</h2>
        <p className="text-muted-foreground mt-1">Destaque suas competências técnicas e idiomas</p>
      </div>

      {/* Skills */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold font-display text-foreground">
          Habilidades <FieldTooltip text="Liste ferramentas, softwares ou competências que você domina e são relevantes para a vaga." />
        </h3>
        {skills.map((skill) => (
          <div key={skill.id} className="flex items-end gap-3">
            <div className="flex-1">
              <Label>Habilidade</Label>
              <Input placeholder="Ex: Excel, Photoshop, Gestão de Projetos" value={skill.name} onChange={(e) => updateSkill(skill.id, "name", e.target.value)} />
            </div>
            <div className="w-40">
              <Label>Nível</Label>
              <Select value={skill.level} onValueChange={(v) => updateSkill(skill.id, "level", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Básico">Básico</SelectItem>
                  <SelectItem value="Intermediário">Intermediário</SelectItem>
                  <SelectItem value="Avançado">Avançado</SelectItem>
                  <SelectItem value="Especialista">Especialista</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <button type="button" onClick={() => removeSkill(skill.id)} className="mb-2 text-muted-foreground hover:text-destructive">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        <Button type="button" variant="outline" onClick={addSkill} className="w-full border-dashed">
          <Plus className="w-4 h-4 mr-2" /> Adicionar Habilidade
        </Button>
      </div>

      {/* Languages */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold font-display text-foreground">
          Idiomas <FieldTooltip text="Idiomas que você fala ou entende. Mesmo que básico, inclua!" />
        </h3>
        {languages.map((lang) => (
          <div key={lang.id} className="flex items-end gap-3">
            <div className="flex-1">
              <Label>Idioma</Label>
              <Input placeholder="Ex: Inglês, Espanhol" value={lang.name} onChange={(e) => updateLang(lang.id, "name", e.target.value)} />
            </div>
            <div className="w-40">
              <Label>Nível</Label>
              <Select value={lang.level} onValueChange={(v) => updateLang(lang.id, "level", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Básico">Básico</SelectItem>
                  <SelectItem value="Intermediário">Intermediário</SelectItem>
                  <SelectItem value="Avançado">Avançado</SelectItem>
                  <SelectItem value="Fluente">Fluente</SelectItem>
                  <SelectItem value="Nativo">Nativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <button type="button" onClick={() => removeLang(lang.id)} className="mb-2 text-muted-foreground hover:text-destructive">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        <Button type="button" variant="outline" onClick={addLang} className="w-full border-dashed">
          <Plus className="w-4 h-4 mr-2" /> Adicionar Idioma
        </Button>
      </div>
    </div>
  );
};

export default SkillsStep;
