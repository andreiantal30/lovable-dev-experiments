
import React from "react";
import { creativeLenses, CreativeLens } from "@/utils/creativeLenses";
import TransitionElement from "@/components/TransitionElement";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CreativeLensSelectorProps {
  selectedLens: CreativeLens | undefined;
  onChange: (lens: CreativeLens) => void;
}

const CreativeLensSelector: React.FC<CreativeLensSelectorProps> = ({
  selectedLens,
  onChange
}) => {
  return (
    <TransitionElement delay={400} className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground dark:text-white/90">
          Creative Lens
          <span className="ml-2 text-xs font-medium px-2 py-0.5 bg-primary/10 text-primary dark:bg-primary/30 dark:text-primary-foreground rounded-full">
            Optional
          </span>
        </label>
        <p className="text-xs text-muted-foreground dark:text-white/60">
          Select a creative lens to approach your campaign from a unique perspective
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
        <TooltipProvider>
          {creativeLenses.map((lens) => (
            <Tooltip key={lens.id}>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant={selectedLens === lens.id ? "default" : "outline"}
                  className={cn(
                    "w-full h-auto py-3 justify-start flex flex-col items-center gap-2 text-sm",
                    selectedLens === lens.id 
                      ? "border-primary/50 bg-primary/10 text-primary hover:bg-primary/20 dark:bg-primary/20 dark:text-primary-foreground" 
                      : "border-muted hover:border-muted-foreground/20"
                  )}
                  onClick={() => onChange(lens.id)}
                >
                  <lens.icon className="h-5 w-5" />
                  <span>{lens.name}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs p-4">
                <div className="space-y-2">
                  <p className="font-medium">{lens.name}</p>
                  <p className="text-sm">{lens.description}</p>
                </div>
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </div>
    </TransitionElement>
  );
};

export default CreativeLensSelector;
