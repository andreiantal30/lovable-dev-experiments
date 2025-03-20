import React, { useState } from "react";
import { CampaignInput } from "@/lib/generateCampaign";
import TransitionElement from "@/components/TransitionElement";
import { CampaignStyle } from '@/components/CampaignStyleSelector';
import FormSection from "./FormSection";
import IndustrySelector from "./IndustrySelector";
import AdvancedOptions from "./AdvancedOptions";
import FormHeader from "./FormHeader";
import SubmitButton from "./SubmitButton";
import TagManager from "./TagManager";
import BrandInput from "./BrandInput";
import StyleSelection from "./StyleSelection";
import PersonaSelector from "./PersonaSelector";
import { PersonaType } from "@/types/persona";

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
    campaignStyle: undefined,
    persona: undefined
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleIndustryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, industry: value }));
    if (errors.industry) {
      setErrors((prev) => ({ ...prev, industry: undefined }));
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
  
  const handlePersonaChange = (personaId: string) => {
    setFormData(prev => ({
      ...prev,
      persona: personaId as PersonaType
    }));
  };

  return (
    <TransitionElement animation="slide-up" className="w-full max-w-4xl mx-auto">
      <form 
        onSubmit={handleFormSubmit} 
        className="bg-white/50 dark:bg-gray-800/40 backdrop-blur-lg border border-border dark:border-gray-700/50 rounded-2xl shadow-subtle p-10 md:p-14"
      >
        <FormHeader 
          title="Create Your Campaign"
          subtitle="Unlock creative strategies, fresh angles, and cutting-edge executions drawn from global campaigns that have made a lasting impact."
        />
        
        <div className="mt-8 mb-10">
          <PersonaSelector 
            selectedPersona={formData.persona} 
            onChange={handlePersonaChange} 
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div className="space-y-12">
            <BrandInput
              value={formData.brand}
              onChange={handleInputChange}
              error={errors.brand}
            />
            
            <IndustrySelector
              value={formData.industry}
              onChange={handleIndustryChange}
              error={errors.industry}
              delay={200}
            />
            
            <StyleSelection
              value={formData.campaignStyle}
              onChange={handleStyleChange}
            />
            
            <TagManager
              title="Target Audience"
              required
              delay={300}
              keyName="targetAudience"
              selectedItems={formData.targetAudience}
              inputValue={audienceInput}
              setInputValue={setAudienceInput}
              addItem={(value) => addTagItem('targetAudience', value)}
              removeItem={(index) => removeTagItem('targetAudience', index)}
              error={errors.targetAudience}
            />
          </div>
          
          <div className="space-y-12">
            <TagManager
              title="Campaign Objectives"
              required
              delay={400}
              keyName="objectives"
              selectedItems={formData.objectives}
              inputValue={objectiveInput}
              setInputValue={setObjectiveInput}
              addItem={(value) => addTagItem('objectives', value)}
              removeItem={(index) => removeTagItem('objectives', index)}
              error={errors.objectives}
            />
            
            <TagManager
              title="Emotional Appeal"
              required
              delay={500}
              keyName="emotionalAppeal"
              selectedItems={formData.emotionalAppeal}
              inputValue={emotionalAppealInput}
              setInputValue={setEmotionalAppealInput}
              addItem={(value) => addTagItem('emotionalAppeal', value)}
              removeItem={(index) => removeTagItem('emotionalAppeal', index)}
              error={errors.emotionalAppeal}
            />
          </div>
        </div>
        
        <AdvancedOptions
          showAdvanced={showAdvanced}
          setShowAdvanced={setShowAdvanced}
          additionalConstraints={formData.additionalConstraints}
          onChange={handleInputChange}
        />
        
        <SubmitButton isGenerating={isGenerating} />
      </form>
    </TransitionElement>
  );
};

export default CampaignForm;
