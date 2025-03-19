
import { Toggle } from "@/components/ui/toggle";
import { Label } from "@/components/ui/label";
import TransitionElement from "./TransitionElement";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

// Update the type to include the new styles
export type CampaignStyle = 
  | "digital" 
  | "experiential" 
  | "social" 
  | "influencer" 
  | "guerrilla" 
  | "ugc" 
  | "brand-activism" 
  | "branded-entertainment" 
  | "retail-activation" 
  | "product-placement" 
  | "data-personalization" 
  | "real-time" 
  | "event-based" 
  | "ooh-ambient" 
  | "ai-generated" 
  | "co-creation" 
  | "stunt-marketing" 
  | "ar-vr" 
  | "performance" 
  | "loyalty-community" 
  | "stunt"
  | "UGC"
  | undefined;

// Create a map of style values to display names for the dropdown
const advancedStyleOptions = [
  { value: "influencer", label: "Influencer-Driven" },
  { value: "guerrilla", label: "Guerrilla Marketing" },
  { value: "ugc", label: "User-Generated Content (UGC)" },
  { value: "brand-activism", label: "Brand Activism" },
  { value: "branded-entertainment", label: "Branded Entertainment" },
  { value: "retail-activation", label: "Retail Activation" },
  { value: "product-placement", label: "Product Placement & Integration" },
  { value: "data-personalization", label: "Data-Driven Personalization" },
  { value: "real-time", label: "Real-Time & Reactive Marketing" },
  { value: "event-based", label: "Event-Based" },
  { value: "ooh-ambient", label: "OOH & Ambient" },
  { value: "ai-generated", label: "AI-Generated" },
  { value: "co-creation", label: "Co-Creation & Collabs" },
  { value: "stunt-marketing", label: "Stunt Marketing" },
  { value: "ar-vr", label: "AR/VR-Driven" },
  { value: "performance", label: "Performance-Driven" },
  { value: "loyalty-community", label: "Loyalty & Community-Building" },
  { value: "stunt", label: "PR Stunt" },
  { value: "UGC", label: "User-Generated Content" }
];

interface CampaignStyleSelectorProps {
  value: CampaignStyle;
  onChange: (style: CampaignStyle) => void;
}

const CampaignStyleSelector = ({ value, onChange }: CampaignStyleSelectorProps) => {
  // Check if the current style is one of the advanced styles
  const isAdvancedStyle = value && !["digital", "experiential", "social"].includes(value);
  
  return (
    <TransitionElement delay={100}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium flex items-center">
            Campaign Style
            <span className="ml-2 text-xs font-medium px-2 py-0.5 bg-primary/10 text-primary rounded-full">
              Optional
            </span>
          </Label>
        </div>
        
        {/* Primary campaign styles */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <Toggle
            variant="outline"
            size="default"
            pressed={value === "digital"}
            onPressedChange={() => onChange(value === "digital" ? undefined : "digital")}
            className="data-[state=on]:bg-primary/15 data-[state=on]:text-primary h-10 w-full"
          >
            Digital-first
          </Toggle>
          
          <Toggle
            variant="outline"
            size="default"
            pressed={value === "experiential"}
            onPressedChange={() => onChange(value === "experiential" ? undefined : "experiential")}
            className="data-[state=on]:bg-primary/15 data-[state=on]:text-primary h-10 w-full"
          >
            Experiential
          </Toggle>
          
          <Toggle
            variant="outline"
            size="default"
            pressed={value === "social"}
            onPressedChange={() => onChange(value === "social" ? undefined : "social")}
            className="data-[state=on]:bg-primary/15 data-[state=on]:text-primary h-10 w-full"
          >
            Social-led
          </Toggle>
        </div>
        
        {/* Advanced styles section */}
        <div className="bg-background/40 dark:bg-gray-800/30 backdrop-blur-sm p-4 rounded-lg border border-border/80 dark:border-gray-700/50">
          <Label className="text-sm font-medium mb-3 block">
            Advanced Campaign Styles
          </Label>
          <Select 
            value={isAdvancedStyle ? value : ""}
            onValueChange={(newValue) => {
              if (newValue) {
                onChange(newValue as CampaignStyle);
              } else {
                onChange(undefined);
              }
            }}
          >
            <SelectTrigger className="w-full bg-background/60 dark:bg-gray-800/60 border-border/50 dark:border-gray-700/70">
              <SelectValue placeholder="Select an advanced style" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {advancedStyleOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground dark:text-gray-400 mt-2 italic">
            Selecting an advanced style will override the primary style selection
          </p>
        </div>
      </div>
    </TransitionElement>
  );
};

export default CampaignStyleSelector;
