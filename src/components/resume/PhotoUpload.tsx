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

// Recorta a imagem para proporção 3x4 centralizada usando canvas
const cropTo3x4 = (dataUrl: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const targetRatio = 3 / 4; // largura / altura
      const imgRatio = img.width / img.height;

      let srcX = 0;
      let srcY = 0;
      let srcW = img.width;
      let srcH = img.height;

      if (imgRatio > targetRatio) {
        // Imagem mais larga que 3x4: recorta as laterais
        srcW = img.height * targetRatio;
        srcX = (img.width - srcW) / 2;
      } else {
        // Imagem mais alta que 3x4: recorta em cima/baixo
        srcH = img.width / targetRatio;
        srcY = (img.height - srcH) / 2;
      }

      const canvas = document.createElement("canvas");
      // Saída: 300x400px (proporção 3x4 nítida)
      canvas.width = 300;
      canvas.height = 400;

      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, 300, 400);

      resolve(canvas.toDataURL("image/jpeg", 0.92));
    };
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
      // Recorta para 3x4 antes de salvar
      const cropped = await cropTo3x4(raw);
      onChange(cropped);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        onClick={() => inputRef.current?.click()}
        className="w-28 h-36 rounded-md border-2 border-dashed border-border hover:border-accent cursor-pointer flex items-center justify-center overflow-hidden bg-secondary transition-colors relative group"
      >
        {photo ? (
          <>
            <img
              src={photo}
              alt="Foto"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="w-6 h-6 text-primary-foreground" />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-1 text-muted-foreground">
            <Camera className="w-8 h-8" />
            <span className="text-xs">Foto 3x4</span>
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