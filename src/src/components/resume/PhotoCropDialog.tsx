import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { ZoomIn, ZoomOut, Move } from "lucide-react";

interface PhotoCropDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  photo: string;
  positionX: number;
  positionY: number;
  zoom: number;
  onSave: (posX: number, posY: number, zoom: number) => void;
}

import { useState } from "react";

const PhotoCropDialog = ({ open, onOpenChange, photo, positionX, positionY, zoom, onSave }: PhotoCropDialogProps) => {
  const [x, setX] = useState(positionX);
  const [y, setY] = useState(positionY);
  const [z, setZ] = useState(zoom);

  // Reset state when dialog opens
  const handleOpenChange = (val: boolean) => {
    if (val) {
      setX(positionX);
      setY(positionY);
      setZ(zoom);
    }
    onOpenChange(val);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ajustar Foto</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4">
          {/* 3x4 preview frame */}
          <div
            className="w-48 h-64 rounded-md border-2 border-dashed border-border overflow-hidden bg-secondary relative"
            style={{ aspectRatio: "3/4" }}
          >
            <img
              src={photo}
              alt="Preview"
              className="absolute inset-0 w-full h-full object-cover"
              style={{
                objectPosition: `${x}% ${y}%`,
                transform: `scale(${z / 100})`,
                transformOrigin: `${x}% ${y}%`,
              }}
            />
          </div>
          <p className="text-xs text-muted-foreground">Formato 3×4 — ajuste a posição e o zoom</p>

          {/* Controls */}
          <div className="w-full space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs flex items-center gap-1.5">
                <Move className="w-3.5 h-3.5" /> Posição horizontal
              </Label>
              <Slider value={[x]} onValueChange={([v]) => setX(v)} min={0} max={100} step={1} />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs flex items-center gap-1.5">
                <Move className="w-3.5 h-3.5" /> Posição vertical
              </Label>
              <Slider value={[y]} onValueChange={([v]) => setY(v)} min={0} max={100} step={1} />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs flex items-center gap-1.5">
                <ZoomIn className="w-3.5 h-3.5" /> Zoom
              </Label>
              <div className="flex items-center gap-2">
                <ZoomOut className="w-4 h-4 text-muted-foreground" />
                <Slider value={[z]} onValueChange={([v]) => setZ(v)} min={100} max={200} step={1} className="flex-1" />
                <ZoomIn className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>Cancelar</Button>
          <Button onClick={() => { onSave(x, y, z); onOpenChange(false); }}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PhotoCropDialog;
