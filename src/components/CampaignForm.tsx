import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import InputField from "@/components/InputField";
import { cn } from "@/lib/utils";
import { industries, emotionalAppeals, objectives, targetAudiences } from "@/lib/campaignData";
import { CampaignInput } from "@/lib/generateCampaign";
import TransitionElement from "./TransitionElement";
import { ChevronDown, ChevronUp, XCircle } from "lucide-react";
import CampaignStyleSelector, { CampaignStyle } from './CampaignStyleSelector';
import AutoSuggestInput from './AutoSuggestInput';

interface CampaignFormProps {
  onSubmit: (input: CampaignInput) => void;
  isGenerating: boolean;
}

const CampaignForm: React.FC<CampaignFormProps> = ({ onSubmit, isGenerating }) => {
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

  const handleStyleChange = (style: CampaignStyle) => {
    setFormData(prev => ({
      ...prev,
      campaignStyle: style
    }));
  };

  return (
    <TransitionElement animation="slide-up" className="w-full max-w-4xl mx-auto">
      <form 
        onSubmit={handleFormSubmit} 
        className="bg-white/50 dark:bg-gray-800/40 backdrop-blur-lg border border-border dark:border-gray-700/50 rounded-2xl shadow-subtle p-6 md:p-8"
      >
        <h2 className="text-2xl md:text-3xl font-medium text-center mb-2 text-foreground">
          Create Your Campaign
        </h2>
        <p className="text-sm text-muted-foreground text-center max-w-2xl mx-auto mb-8">
          Unlock creative strategies, fresh angles, and cutting-edge executions drawn from global campaigns that have made a lasting impact.
        </p>
        
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
                
                <AutoSuggestInput
                  suggestions={targetAudiences}
                  value={audienceInput}
                  onChange={setAudienceInput}
                  onSelect={(value) => addTagItem('targetAudience', value)}
                  placeholder="Type or select audience"
                  error={!!errors.targetAudience}
                />
                
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
                
                <AutoSuggestInput
                  suggestions={objectives}
                  value={objectiveInput}
                  onChange={setObjectiveInput}
                  onSelect={(value) => addTagItem('objectives', value)}
                  placeholder="Type or select objective"
                  error={!!errors.objectives}
                />
                
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
                
                <AutoSuggestInput
                  suggestions={emotionalAppeals}
                  value={emotionalAppealInput}
                  onChange={setEmotionalAppealInput}
                  onSelect={(value) => addTagItem('emotionalAppeal', value)}
                  placeholder="Type or select emotion"
                  error={!!errors.emotionalAppeal}
                />
                
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
