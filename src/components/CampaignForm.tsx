import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import InputField from "@/components/InputField";
import { cn } from "@/lib/utils";
import { industries, emotionalAppeals, objectives, targetAudiences } from "@/lib/campaignData";
import { CampaignInput } from "@/lib/generateCampaign";
import TransitionElement from "./TransitionElement";
import { ChevronDown, ChevronUp, XCircle } from "lucide-react";
import CampaignStyleSelector, { CampaignStyle } from './CampaignStyleSelector';

interface CampaignFormProps {
  onSubmit: (input: CampaignInput) => void;
  isGenerating: boolean;
  onIndustryChange?: (industry: string) => void;
}

const CampaignForm: React.FC<CampaignFormProps> = ({ onSubmit, isGenerating, onIndustryChange }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [formData, setFormData] = useState<CampaignInput>({
    brand: "",
    industry: "",
    targetAudience: [],
    objectives: [],
    emotionalAppeal: [],
    additionalConstraints: "",
    campaignStyle: undefined
  });

  const [errors, setErrors] = useState<{
    brand?: string;
    industry?: string;
    targetAudience?: string;
    objectives?: string;
    emotionalAppeal?: string;
  }>({});

  const [audienceInput, setAudienceInput] = useState("");
  const [objectiveInput, setObjectiveInput] = useState("");
  const [emotionalAppealInput, setEmotionalAppealInput] = useState("");

  const renderTagItem = (item: string, index: number, key: 'targetAudience' | 'objectives' | 'emotionalAppeal') => (
    <span
      key={index}
      className="px-2 py-1 bg-primary/15 text-primary dark:bg-primary/30 dark:text-white flex items-center gap-1 rounded-md text-sm border border-primary/20 dark:border-primary/40 shadow-sm"
    >
      {item}
      <button
        type="button"
        onClick={() => removeTagItem(key, index)}
        className="text-primary/80 hover:text-primary dark:text-white/80 dark:hover:text-white"
      >
        <XCircle size={16} />
      </button>
    </span>
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    
    if (name === 'industry' && onIndustryChange) {
      onIndustryChange(value);
    }
  };

  const addTagItem = (key: 'targetAudience' | 'objectives' | 'emotionalAppeal', value: string) => {
    if (!value.trim()) return;
    
    if (formData[key].includes(value.trim())) return;
    
    setFormData(prev => ({
      ...prev,
      [key]: [...prev[key], value.trim()]
    }));
    
    if (key === 'targetAudience') setAudienceInput('');
    else if (key === 'objectives') setObjectiveInput('');
    else if (key === 'emotionalAppeal') setEmotionalAppealInput('');
    
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: undefined }));
    }
  };

  const removeTagItem = (key: 'targetAudience' | 'objectives' | 'emotionalAppeal', index: number) => {
    setFormData(prev => ({
      ...prev,
      [key]: prev[key].filter((_, i) => i !== index)
    }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: typeof errors = {};
    
    if (!formData.brand.trim()) {
      newErrors.brand = "Brand name is required";
    }
    
    if (!formData.industry.trim()) {
      newErrors.industry = "Industry is required";
    }
    
    if (formData.targetAudience.length === 0) {
      newErrors.targetAudience = "At least one target audience is required";
    }
    
    if (formData.objectives.length === 0) {
      newErrors.objectives = "At least one objective is required";
    }
    
    if (formData.emotionalAppeal.length === 0) {
      newErrors.emotionalAppeal = "At least one emotional appeal is required";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    onSubmit(formData);
  };

  const handleAddFromDropdown = (key: 'targetAudience' | 'objectives' | 'emotionalAppeal', value: string) => {
    if (!value) return;
    addTagItem(key, value);
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    key: 'targetAudience' | 'objectives' | 'emotionalAppeal',
    value: string
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTagItem(key, value);
    }
  };

  const handleStyleChange = (style: CampaignStyle) => {
    setFormData(prev => ({
      ...prev,
      campaignStyle: style
    }));
  };

  const handleSelectFromDatalist = (
    key: 'targetAudience' | 'objectives' | 'emotionalAppeal', 
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { value } = e.target;
    
    if (key === 'targetAudience') setAudienceInput(value);
    else if (key === 'objectives') setObjectiveInput(value);
    else if (key === 'emotionalAppeal') setEmotionalAppealInput(value);
    
    const validOptions = key === 'targetAudience' 
      ? targetAudiences 
      : key === 'objectives' 
        ? objectives 
        : emotionalAppeals;
    
    if (validOptions.includes(value)) {
      addTagItem(key, value);
    }
  };

  return (
    <TransitionElement animation="slide-up" className="w-full max-w-4xl mx-auto">
      <form 
        onSubmit={handleFormSubmit} 
        className="bg-white/50 dark:bg-gray-800/40 backdrop-blur-lg border border-border dark:border-gray-700/50 rounded-2xl shadow-subtle p-6 md:p-8"
      >
        <h2 className="text-2xl md:text-3xl font-medium text-center mb-8 text-foreground">
          Create Your Campaign
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <TransitionElement delay={100}>
              <InputField
                label="Brand Name"
                id="brand"
                name="brand"
                placeholder="e.g. Nike, Apple, Spotify"
                value={formData.brand}
                onChange={handleInputChange}
                error={errors.brand}
                chip="Required"
              />
            </TransitionElement>
            
            <TransitionElement delay={200}>
              <div className="space-y-1.5">
                <label htmlFor="industry" className="text-sm font-medium text-foreground dark:text-white/90 flex items-center">
                  Industry
                  <span className="ml-2 text-xs font-medium px-2 py-0.5 bg-primary/10 text-primary dark:bg-primary/30 dark:text-primary-foreground rounded-full">
                    Required
                  </span>
                </label>
                <select
                  id="industry"
                  name="industry"
                  value={formData.industry}
                  onChange={handleSelectChange}
                  className={cn(
                    "w-full h-10 px-3 bg-white/80 dark:bg-gray-800/60 border rounded-md appearance-none transition-all duration-200",
                    "hover:bg-white dark:hover:bg-gray-800/80 focus:bg-white dark:focus:bg-gray-800/80 focus:ring-2 focus:ring-primary/20 focus:border-primary/50",
                    "text-foreground dark:text-white",
                    errors.industry
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
                {errors.industry && (
                  <p className="text-xs text-destructive dark:text-red-400">{errors.industry}</p>
                )}
              </div>
            </TransitionElement>
            
            <CampaignStyleSelector
              value={formData.campaignStyle}
              onChange={handleStyleChange}
            />
            
            <TransitionElement delay={300}>
              <div className="space-y-1.5">
                <label className="text-sm font-medium flex items-center justify-between text-foreground dark:text-white/90">
                  <span className="flex items-center">
                    Target Audience
                    <span className="ml-2 text-xs font-medium px-2 py-0.5 bg-primary/10 text-primary dark:bg-primary/30 dark:text-primary-foreground rounded-full">
                      Required
                    </span>
                  </span>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      const randomAudience = targetAudiences[Math.floor(Math.random() * targetAudiences.length)];
                      if (!formData.targetAudience.includes(randomAudience)) {
                        addTagItem('targetAudience', randomAudience);
                      }
                    }}
                    className="text-xs text-muted-foreground hover:text-foreground dark:text-white/70 dark:hover:text-white h-7 px-2"
                  >
                    Add Random
                  </Button>
                </label>
                
                <div className="flex flex-wrap gap-2 mb-2 min-h-8">
                  {formData.targetAudience.map((audience, index) => 
                    renderTagItem(audience, index, 'targetAudience')
                  )}
                </div>
                
                <div className="relative">
                  <input
                    list="target-audiences"
                    placeholder="Type or select audience"
                    value={audienceInput}
                    onChange={(e) => handleSelectFromDatalist('targetAudience', e)}
                    onKeyDown={(e) => handleKeyDown(e, 'targetAudience', audienceInput)}
                    className={cn(
                      "w-full h-10 px-3 bg-white/80 dark:bg-gray-800/60 border rounded-md transition-all duration-200",
                      "hover:bg-white dark:hover:bg-gray-800/80 focus:bg-white dark:focus:bg-gray-800/80 focus:ring-2 focus:ring-primary/20 focus:border-primary/50",
                      "text-foreground dark:text-white dark:placeholder:text-white/50",
                      errors.targetAudience
                        ? "border-destructive/50 focus:ring-destructive/20"
                        : "border-input dark:border-gray-700"
                    )}
                  />
                  <datalist id="target-audiences">
                    {targetAudiences.map((audience) => (
                      <option key={audience} value={audience} />
                    ))}
                  </datalist>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => addTagItem('targetAudience', audienceInput)}
                    className="absolute right-1 top-1 h-8 w-8 p-0"
                  >
                    +
                  </Button>
                </div>
                
                {errors.targetAudience && (
                  <p className="text-xs text-destructive dark:text-red-400">{errors.targetAudience}</p>
                )}
                {formData.targetAudience.length === 0 && !errors.targetAudience && (
                  <p className="text-xs text-muted-foreground dark:text-white/60">
                    At least one target audience is required
                  </p>
                )}
              </div>
            </TransitionElement>
          </div>
          
          <div className="space-y-6">
            <TransitionElement delay={400}>
              <div className="space-y-1.5">
                <label className="text-sm font-medium flex items-center justify-between text-foreground dark:text-white/90">
                  <span className="flex items-center">
                    Campaign Objectives
                    <span className="ml-2 text-xs font-medium px-2 py-0.5 bg-primary/10 text-primary dark:bg-primary/30 dark:text-primary-foreground rounded-full">
                      Required
                    </span>
                  </span>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      const randomObjective = objectives[Math.floor(Math.random() * objectives.length)];
                      if (!formData.objectives.includes(randomObjective)) {
                        addTagItem('objectives', randomObjective);
                      }
                    }}
                    className="text-xs text-muted-foreground hover:text-foreground dark:text-white/70 dark:hover:text-white h-7 px-2"
                  >
                    Add Random
                  </Button>
                </label>
                
                <div className="flex flex-wrap gap-2 mb-2 min-h-8">
                  {formData.objectives.map((objective, index) => 
                    renderTagItem(objective, index, 'objectives')
                  )}
                </div>
                
                <div className="relative">
                  <input
                    list="objectives-list"
                    placeholder="Type or select objective"
                    value={objectiveInput}
                    onChange={(e) => handleSelectFromDatalist('objectives', e)}
                    onKeyDown={(e) => handleKeyDown(e, 'objectives', objectiveInput)}
                    className={cn(
                      "w-full h-10 px-3 bg-white/80 dark:bg-gray-800/60 border rounded-md transition-all duration-200",
                      "hover:bg-white dark:hover:bg-gray-800/80 focus:bg-white dark:focus:bg-gray-800/80 focus:ring-2 focus:ring-primary/20 focus:border-primary/50",
                      "text-foreground dark:text-white dark:placeholder:text-white/50",
                      errors.objectives
                        ? "border-destructive/50 focus:ring-destructive/20"
                        : "border-input dark:border-gray-700"
                    )}
                  />
                  <datalist id="objectives-list">
                    {objectives.map((objective) => (
                      <option key={objective} value={objective} />
                    ))}
                  </datalist>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => addTagItem('objectives', objectiveInput)}
                    className="absolute right-1 top-1 h-8 w-8 p-0"
                  >
                    +
                  </Button>
                </div>
                
                {errors.objectives && (
                  <p className="text-xs text-destructive dark:text-red-400">{errors.objectives}</p>
                )}
                {formData.objectives.length === 0 && !errors.objectives && (
                  <p className="text-xs text-muted-foreground dark:text-white/60">
                    At least one objective is required
                  </p>
                )}
              </div>
            </TransitionElement>
            
            <TransitionElement delay={500}>
              <div className="space-y-1.5">
                <label className="text-sm font-medium flex items-center justify-between text-foreground dark:text-white/90">
                  <span className="flex items-center">
                    Emotional Appeal
                    <span className="ml-2 text-xs font-medium px-2 py-0.5 bg-primary/10 text-primary dark:bg-primary/30 dark:text-primary-foreground rounded-full">
                      Required
                    </span>
                  </span>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      const randomEmotion = emotionalAppeals[Math.floor(Math.random() * emotionalAppeals.length)];
                      if (!formData.emotionalAppeal.includes(randomEmotion)) {
                        addTagItem('emotionalAppeal', randomEmotion);
                      }
                    }}
                    className="text-xs text-muted-foreground hover:text-foreground dark:text-white/70 dark:hover:text-white h-7 px-2"
                  >
                    Add Random
                  </Button>
                </label>
                
                <div className="flex flex-wrap gap-2 mb-2 min-h-8">
                  {formData.emotionalAppeal.map((emotion, index) => 
                    renderTagItem(emotion, index, 'emotionalAppeal')
                  )}
                </div>
                
                <div className="relative">
                  <input
                    list="emotional-appeals"
                    placeholder="Type or select emotion"
                    value={emotionalAppealInput}
                    onChange={(e) => handleSelectFromDatalist('emotionalAppeal', e)}
                    onKeyDown={(e) => handleKeyDown(e, 'emotionalAppeal', emotionalAppealInput)}
                    className={cn(
                      "w-full h-10 px-3 bg-white/80 dark:bg-gray-800/60 border rounded-md transition-all duration-200",
                      "hover:bg-white dark:hover:bg-gray-800/80 focus:bg-white dark:focus:bg-gray-800/80 focus:ring-2 focus:ring-primary/20 focus:border-primary/50",
                      "text-foreground dark:text-white dark:placeholder:text-white/50",
                      errors.emotionalAppeal
                        ? "border-destructive/50 focus:ring-destructive/20"
                        : "border-input dark:border-gray-700"
                    )}
                  />
                  <datalist id="emotional-appeals">
                    {emotionalAppeals.map((emotion) => (
                      <option key={emotion} value={emotion} />
                    ))}
                  </datalist>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => addTagItem('emotionalAppeal', emotionalAppealInput)}
                    className="absolute right-1 top-1 h-8 w-8 p-0"
                  >
                    +
                  </Button>
                </div>
                
                {errors.emotionalAppeal && (
                  <p className="text-xs text-destructive dark:text-red-400">{errors.emotionalAppeal}</p>
                )}
                {formData.emotionalAppeal.length === 0 && !errors.emotionalAppeal && (
                  <p className="text-xs text-muted-foreground dark:text-white/60">
                    At least one emotional appeal is required
                  </p>
                )}
              </div>
            </TransitionElement>
          </div>
        </div>
        
        <div className="mt-6">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm flex items-center gap-1 text-muted-foreground mx-auto hover:text-foreground dark:text-white/70 dark:hover:text-white"
          >
            {showAdvanced ? (
              <>
                Hide Advanced Options <ChevronUp size={16} />
              </>
            ) : (
              <>
                Show Advanced Options <ChevronDown size={16} />
              </>
            )}
          </Button>
          
          {showAdvanced && (
            <TransitionElement animation="slide-down" className="mt-4">
              <InputField
                label="Additional Constraints or Requirements"
                id="additionalConstraints"
                name="additionalConstraints"
                placeholder="Any specific themes, channels, or constraints to consider..."
                multiline
                rows={3}
                value={formData.additionalConstraints}
                onChange={handleInputChange}
              />
            </TransitionElement>
          )}
        </div>
        
        <div className="mt-8 flex justify-center">
          <TransitionElement delay={600} animation="slide-up">
            <Button 
              type="submit" 
              disabled={isGenerating}
              className="w-full md:w-auto px-8 py-6 h-auto text-lg font-medium rounded-xl shadow-subtle hover:shadow-md transition-all duration-300 bg-primary text-primary-foreground"
            >
              {isGenerating ? "Generating Campaign..." : "Generate Campaign Idea"}
            </Button>
          </TransitionElement>
        </div>
      </form>
    </TransitionElement>
  );
};

export default CampaignForm;
