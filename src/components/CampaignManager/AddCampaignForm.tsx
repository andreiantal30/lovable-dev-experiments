
import React, { useState } from 'react';
import { Campaign, industries, emotionalAppeals, objectives, targetAudiences } from '@/lib/campaignData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import AutoSuggestInput from '@/components/AutoSuggestInput';

interface AddCampaignFormProps {
  onSubmit: (campaign: Campaign) => void;
}

const AddCampaignForm: React.FC<AddCampaignFormProps> = ({ onSubmit }) => {
  const currentYear = new Date().getFullYear();
  
  const [campaign, setCampaign] = useState<Partial<Campaign>>({
    id: uuidv4(),
    year: currentYear,
    targetAudience: [],
    objectives: [],
    features: [],
    emotionalAppeal: [],
    outcomes: []
  });
  
  const [inputValues, setInputValues] = useState({
    targetAudience: '',
    objectives: '',
    emotionalAppeal: '',
    features: '',
    outcomes: ''
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCampaign(prev => ({ ...prev, [name]: value }));
  };
  
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCampaign(prev => ({ ...prev, [name]: parseInt(value) || currentYear }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setCampaign(prev => ({ ...prev, [name]: value }));
  };
  
  const handleArrayItemAdd = (field: keyof Campaign, value: string) => {
    if (!value) return;
    
    setCampaign(prev => {
      const currentArray = prev[field] as string[] || [];
      if (currentArray.includes(value)) return prev;
      
      return {
        ...prev,
        [field]: [...currentArray, value]
      };
    });
    
    // Clear the input field
    setInputValues(prev => ({
      ...prev,
      [field]: ''
    }));
  };
  
  const handleArrayItemRemove = (field: keyof Campaign, index: number) => {
    setCampaign(prev => {
      const currentArray = prev[field] as string[] || [];
      return {
        ...prev,
        [field]: currentArray.filter((_, i) => i !== index)
      };
    });
  };
  
  const handleInputValueChange = (field: string, value: string) => {
    setInputValues(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!campaign.name || !campaign.brand || !campaign.industry) {
      alert('Please fill in all required fields');
      return;
    }
    
    if (!campaign.targetAudience?.length || !campaign.objectives?.length || !campaign.emotionalAppeal?.length) {
      alert('Please add at least one item to each array field');
      return;
    }
    
    onSubmit(campaign as Campaign);
    
    // Reset form
    setCampaign({
      id: uuidv4(),
      year: currentYear,
      targetAudience: [],
      objectives: [],
      features: [],
      emotionalAppeal: [],
      outcomes: []
    });
    
    setInputValues({
      targetAudience: '',
      objectives: '',
      emotionalAppeal: '',
      features: '',
      outcomes: ''
    });
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Campaign Name*</label>
          <Input 
            name="name" 
            value={campaign.name || ''} 
            onChange={handleChange} 
            placeholder="e.g., Like a Girl" 
            required 
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Brand*</label>
          <Input 
            name="brand" 
            value={campaign.brand || ''} 
            onChange={handleChange} 
            placeholder="e.g., Always" 
            required 
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Year</label>
          <Input 
            name="year" 
            type="number" 
            value={campaign.year || currentYear} 
            onChange={handleNumberChange} 
            min="1990" 
            max={currentYear} 
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Industry*</label>
          <Select 
            value={campaign.industry || ''} 
            onValueChange={(value) => handleSelectChange('industry', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select industry" />
            </SelectTrigger>
            <SelectContent>
              {industries.map((industry) => (
                <SelectItem key={industry} value={industry}>
                  {industry}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Key Message</label>
        <Textarea 
          name="keyMessage" 
          value={campaign.keyMessage || ''} 
          onChange={handleChange} 
          placeholder="The main message of the campaign" 
          rows={2}
        />
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Strategy</label>
        <Textarea 
          name="strategy" 
          value={campaign.strategy || ''} 
          onChange={handleChange} 
          placeholder="The strategy used in the campaign" 
          rows={2}
        />
      </div>
      
      {/* Target Audience */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Target Audience*</label>
        <div className="flex flex-wrap gap-2 mt-2 mb-2">
          {campaign.targetAudience?.map((item, index) => (
            <Badge key={index} variant="secondary" className="pl-2 pr-1 py-1 flex items-center">
              {item}
              <button 
                type="button" 
                onClick={() => handleArrayItemRemove('targetAudience', index)}
                className="ml-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full p-1"
              >
                <X size={14} />
              </button>
            </Badge>
          ))}
        </div>
        <AutoSuggestInput
          suggestions={targetAudiences}
          value={inputValues.targetAudience}
          onChange={(value) => handleInputValueChange('targetAudience', value)}
          onSelect={(value) => handleArrayItemAdd('targetAudience', value)}
          placeholder="Type or select audience"
        />
      </div>
      
      {/* Objectives */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Objectives*</label>
        <div className="flex flex-wrap gap-2 mt-2 mb-2">
          {campaign.objectives?.map((item, index) => (
            <Badge key={index} variant="secondary" className="pl-2 pr-1 py-1 flex items-center">
              {item}
              <button 
                type="button" 
                onClick={() => handleArrayItemRemove('objectives', index)}
                className="ml-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full p-1"
              >
                <X size={14} />
              </button>
            </Badge>
          ))}
        </div>
        <AutoSuggestInput
          suggestions={objectives}
          value={inputValues.objectives}
          onChange={(value) => handleInputValueChange('objectives', value)}
          onSelect={(value) => handleArrayItemAdd('objectives', value)}
          placeholder="Type or select objective"
        />
      </div>
      
      {/* Emotional Appeal */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Emotional Appeal*</label>
        <div className="flex flex-wrap gap-2 mt-2 mb-2">
          {campaign.emotionalAppeal?.map((item, index) => (
            <Badge key={index} variant="secondary" className="pl-2 pr-1 py-1 flex items-center">
              {item}
              <button 
                type="button" 
                onClick={() => handleArrayItemRemove('emotionalAppeal', index)}
                className="ml-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full p-1"
              >
                <X size={14} />
              </button>
            </Badge>
          ))}
        </div>
        <AutoSuggestInput
          suggestions={emotionalAppeals}
          value={inputValues.emotionalAppeal}
          onChange={(value) => handleInputValueChange('emotionalAppeal', value)}
          onSelect={(value) => handleArrayItemAdd('emotionalAppeal', value)}
          placeholder="Type or select emotional appeal"
        />
      </div>
      
      <div className="flex justify-end">
        <Button type="submit">Add Campaign</Button>
      </div>
    </form>
  );
};

export default AddCampaignForm;
