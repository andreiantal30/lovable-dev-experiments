
import React from "react";
import { cn } from "@/lib/utils";
import TransitionElement from "@/components/TransitionElement";
import { industries } from "@/lib/campaignData";

interface IndustrySelectorProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  error?: string;
  delay?: number;
}

const IndustrySelector: React.FC<IndustrySelectorProps> = ({
  value,
  onChange,
  error,
  delay = 0
}) => {
  return (
    <TransitionElement delay={delay}>
      <div className="space-y-2">
        <label htmlFor="industry" className="text-sm font-medium text-foreground dark:text-white/90 flex items-center">
          Industry
          <span className="ml-2 text-xs font-medium px-2 py-0.5 bg-primary/10 text-primary dark:bg-primary/30 dark:text-primary-foreground rounded-full">
            Required
          </span>
        </label>
        <select
          id="industry"
          name="industry"
          value={value}
          onChange={onChange}
          className={cn(
            "w-full h-10 px-3 bg-white/80 dark:bg-gray-800/60 border rounded-md appearance-none transition-all duration-200",
            "hover:bg-white dark:hover:bg-gray-800/80 focus:bg-white dark:focus:bg-gray-800/80 focus:ring-2 focus:ring-primary/20 focus:border-primary/50",
            "text-foreground dark:text-white",
            error
              ? "border-destructive/50 focus:ring-destructive/20"
              : "border-input dark:border-gray-700"
          )}
        >
          <option value="">Select Industry</option>
          {industries.map((industry) => (
            <option key={industry} value={industry}>
              {industry}
            </option>
          ))}
        </select>
        {error && (
          <p className="text-xs text-destructive dark:text-red-400 mt-1">{error}</p>
        )}
      </div>
    </TransitionElement>
  );
};

export default IndustrySelector;
