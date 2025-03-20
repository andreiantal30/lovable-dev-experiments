
import React from "react";
import TransitionElement from "@/components/TransitionElement";
import { industries } from "@/lib/campaignData";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface IndustrySelectorProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  delay?: number;
}

const IndustrySelector: React.FC<IndustrySelectorProps> = ({
  value,
  onChange,
  error,
  delay = 0
}) => {
  const handleValueChange = (newValue: string) => {
    onChange(newValue);
  };

  return (
    <TransitionElement delay={delay}>
      <div className="space-y-3">
        <label htmlFor="industry" className="text-sm font-medium text-foreground dark:text-white/90 flex items-center">
          Industry
          <span className="ml-2 text-xs font-medium px-2 py-0.5 bg-primary/10 text-primary dark:bg-primary/30 dark:text-primary-foreground rounded-full">
            Required
          </span>
        </label>
        
        <Select value={value} onValueChange={handleValueChange}>
          <SelectTrigger 
            id="industry"
            className="w-full h-12 bg-white/80 dark:bg-gray-800/60 hover:bg-white dark:hover:bg-gray-800/80"
          >
            <SelectValue placeholder="Select Industry" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-gray-800 border-input dark:border-gray-700">
            {industries.map((industry) => (
              <SelectItem key={industry} value={industry}>
                {industry}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {error && (
          <p className="text-xs text-destructive dark:text-red-400 mt-2">{error}</p>
        )}
      </div>
    </TransitionElement>
  );
};

export default IndustrySelector;
