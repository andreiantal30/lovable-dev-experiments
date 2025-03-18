
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

// Update the type to include the new advanced styles
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
  { value: "loyalty-community", label: "Loyalty & Community-Building" }
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
      <div className="space-y-1.5">
        <Label className="text-sm font-medium">
          Campaign Style
          <span className="ml-2 text-xs font-medium px-2 py-0.5 bg-primary/10 text-primary rounded-full">
            Optional
          </span>
        </Label>
        
        <div className="flex flex-wrap gap-2 mb-3">
          <Toggle
            variant="outline"
            size="sm"
            pressed={value === "digital"}
            onPressedChange={() => onChange(value === "digital" ? undefined : "digital")}
            className="data-[state=on]:bg-primary/10 data-[state=on]:text-primary"
          >
            Digital-first
          </Toggle>
          
          <Toggle
            variant="outline"
            size="sm"
            pressed={value === "experiential"}
            onPressedChange={() => onChange(value === "experiential" ? undefined : "experiential")}
            className="data-[state=on]:bg-primary/10 data-[state=on]:text-primary"
          >
            Experiential
          </Toggle>
          
          <Toggle
            variant="outline"
            size="sm"
            pressed={value === "social"}
            onPressedChange={() => onChange(value === "social" ? undefined : "social")}
            className="data-[state=on]:bg-primary/10 data-[state=on]:text-primary"
          >
            Social-led
          </Toggle>
        </div>
        
        <div className="mt-2">
          <Label className="text-sm font-medium mb-1.5 block">
            More Campaign Styles
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
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select an advanced style" />
            </SelectTrigger>
            <SelectContent>
              {advancedStyleOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">
            Selecting a style from this dropdown will override the toggle selection above
          </p>
        </div>
      </div>
    </TransitionElement>
  );
};

export default CampaignStyleSelector;
