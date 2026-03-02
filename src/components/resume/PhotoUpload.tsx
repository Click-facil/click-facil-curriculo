import { Camera, X, Settings2 } from "lucide-react";
import { useRef, useState } from "react";
import PhotoCropDialog from "./PhotoCropDialog";

interface PhotoUploadProps {
  photo: string | null;
  onChange: (photo: string | null) => void;
  positionX?: number;
  positionY?: number;
  zoom?: number;
  onPositionChange?: (x: number, y: number, zoom: number) => void;
}

const PhotoUpload = ({ photo, onChange, positionX = 50, positionY = 50, zoom = 100, onPositionChange }: PhotoUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [cropOpen, setCropOpen] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("A foto deve ter no máximo 5MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      onChange(ev.target?.result as string);
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
              style={{
                objectPosition: `${positionX}% ${positionY}%`,
                transform: `scale(${zoom / 100})`,
                transformOrigin: `${positionX}% ${positionY}%`,
              }}
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
            onClick={() => setCropOpen(true)}
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            <Settings2 className="w-3 h-3" /> Ajustar foto
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

      {photo && (
        <PhotoCropDialog
          open={cropOpen}
          onOpenChange={setCropOpen}
          photo={photo}
          positionX={positionX}
          positionY={positionY}
          zoom={zoom}
          onSave={(x, y, z) => onPositionChange?.(x, y, z)}
        />
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
