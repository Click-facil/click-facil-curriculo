import { HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface FieldTooltipProps {
  text: string;
}

const FieldTooltip = ({ text }: FieldTooltipProps) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <button type="button" className="inline-flex ml-1 text-muted-foreground hover:text-accent transition-colors">
        <HelpCircle className="w-3.5 h-3.5" />
      </button>
    </TooltipTrigger>
    <TooltipContent side="top" className="max-w-[250px] text-xs">
      {text}
    </TooltipContent>
  </Tooltip>
);

export default FieldTooltip;
