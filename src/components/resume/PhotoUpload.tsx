import { Camera, X } from "lucide-react";
import { useRef } from "react";

interface PhotoUploadProps {
  photo: string | null;
  onChange: (photo: string | null) => void;
  positionX?: number;
  positionY?: number;
  zoom?: number;
  onPositionChange?: (x: number, y: number, zoom: number) => void;
}

// Recorta a imagem para proporção 3:4 (largura:altura) usando canvas
// Garante que a saída seja sempre 300x400px sem distorção
const cropTo3x4 = (dataUrl: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      // Proporção alvo: 3 largura para 4 altura
      const targetW = 3;
      const targetH = 4;
      const targetRatio = targetW / targetH; // 0.75

      const imgRatio = img.naturalWidth / img.naturalHeight;

      let srcX = 0;
      let srcY = 0;
      let srcW = img.naturalWidth;
      let srcH = img.naturalHeight;

      if (imgRatio > targetRatio) {
        // Foto mais larga que 3:4 → corta laterais
        srcW = Math.round(img.naturalHeight * targetRatio);
        srcX = Math.round((img.naturalWidth - srcW) / 2);
      } else if (imgRatio < targetRatio) {
        // Foto mais alta que 3:4 → corta topo/base
        srcH = Math.round(img.naturalWidth / targetRatio);
        srcY = Math.round((img.naturalHeight - srcH) / 2);
      }
      // Se já for 3:4 exato, usa tudo

      const canvas = document.createElement("canvas");
      canvas.width = 300;
      canvas.height = 400;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, 300, 400);

      resolve(canvas.toDataURL("image/jpeg", 0.92));
    };
    img.onerror = () => resolve(dataUrl); // fallback: usa original
    img.src = dataUrl;
  });
};

const PhotoUpload = ({ photo, onChange }: PhotoUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("A foto deve ter no máximo 5MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const raw = ev.target?.result as string;
      const cropped = await cropTo3x4(raw);
      onChange(cropped);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Container exatamente 3:4 = w-24(96px) h-32(128px) */}
      <div
        onClick={() => inputRef.current?.click()}
        className="w-24 h-32 rounded-md border-2 border-dashed border-border hover:border-accent cursor-pointer flex items-center justify-center overflow-hidden bg-secondary transition-colors relative group"
      >
        {photo ? (
          <>
            <img
              src={photo}
              alt="Foto"
              style={{ width: "100%", height: "100%", display: "block" }}
            />
            <div className="absolute inset-0 bg-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="w-6 h-6 text-primary-foreground" />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-1 text-muted-foreground">
            <Camera className="w-8 h-8" />
            <span className="text-xs text-center">Foto 3x4</span>
          </div>
        )}
      </div>

      {photo && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            <Camera className="w-3 h-3" /> Trocar foto
          </button>
          <span className="text-muted-foreground">·</span>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-xs text-destructive hover:underline flex items-center gap-1"
          >
            <X className="w-3 h-3" /> Remover
          </button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
};

export default PhotoUpload;