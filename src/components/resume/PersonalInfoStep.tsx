import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import PhotoUpload from "./PhotoUpload";
import FieldTooltip from "./FieldTooltip";
import { ImproveButton } from "./ImproveButton";
import { PersonalInfo } from "@/types/resume";
import { formatPhone } from "@/lib/phone-mask";

interface Props {
  data: PersonalInfo;
  onChange: (data: PersonalInfo) => void;
}

const PersonalInfoStep = ({ data, onChange }: Props) => {
  const update = (field: keyof PersonalInfo, value: string | null) => {
    onChange({ ...data, [field]: value });
  };

  const handlePhone = (value: string) => {
    update("phone", formatPhone(value));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <PhotoUpload
          photo={data.photo}
          onChange={(v) => update("photo", v)}
          positionX={data.photoPositionX ?? 50}
          positionY={data.photoPositionY ?? 50}
          zoom={data.photoZoom ?? 100}
          onPositionChange={(x, y, z) => onChange({ ...data, photoPositionX: x, photoPositionY: y, photoZoom: z })}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Label htmlFor="fullName">
            Nome Completo *
            <FieldTooltip text="Digite seu nome completo, como aparece em documentos oficiais." />
          </Label>
          <Input id="fullName" placeholder="Ex: Maria da Silva" value={data.fullName} onChange={(e) => update("fullName", e.target.value)} />
        </div>
        <div>
          <Label htmlFor="email">
            E-mail *
            <FieldTooltip text="Use um e-mail profissional. Evite apelidos ou nomes informais." />
          </Label>
          <Input id="email" type="email" placeholder="seu@email.com" value={data.email} onChange={(e) => update("email", e.target.value)} />
        </div>
        <div>
          <Label htmlFor="phone">
            Telefone *
            <FieldTooltip text="Número com DDD para contato dos recrutadores." />
          </Label>
          <Input id="phone" placeholder="(00) 00000-0000" value={data.phone} onChange={(e) => handlePhone(e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="address">
            Endereço
            <FieldTooltip text="Opcional. Rua e número são suficientes." />
          </Label>
          <Input id="address" placeholder="Rua, Número, Bairro" value={data.address} onChange={(e) => update("address", e.target.value)} />
        </div>
        <div>
          <Label htmlFor="city">
            Cidade *
            <FieldTooltip text="Cidade onde você mora atualmente." />
          </Label>
          <Input id="city" placeholder="Sua cidade" value={data.city} onChange={(e) => update("city", e.target.value)} />
        </div>
        <div>
          <Label htmlFor="state">
            Estado *
            <FieldTooltip text="Sigla do estado. Ex: SP, RJ, MG" />
          </Label>
          <Input id="state" placeholder="UF" maxLength={2} value={data.state} onChange={(e) => update("state", e.target.value.toUpperCase())} />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="linkedin">
            LinkedIn
            <FieldTooltip text="Seu perfil do LinkedIn valoriza o currículo. Cole apenas o link." />
          </Label>
          <Input id="linkedin" placeholder="linkedin.com/in/seu-perfil" value={data.linkedin} onChange={(e) => update("linkedin", e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="objective">
            Objetivo Profissional *
            <FieldTooltip text="Seja direto e específico. Cite a área e o que você pode oferecer à empresa." />
          </Label>
          <Textarea
            id="objective"
            placeholder="Descreva brevemente seu objetivo profissional. Ex: Busco oportunidade na área de marketing digital, onde possa contribuir com minha experiência em gestão de redes sociais e criação de conteúdo."
            value={data.objective}
            onChange={(e) => update("objective", e.target.value)}
            rows={3}
          />
          <ImproveButton
            value={data.objective}
            onChange={(novoTexto) => update("objective", novoTexto)}
            tipo="objetivo"
          />
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoStep;
