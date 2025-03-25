import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Campaign } from '@/lib/campaignData';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, AlertCircle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface ImportJsonFormProps {
  onImportSuccess: (campaigns: Campaign[]) => void;
}

const ImportJsonForm: React.FC<ImportJsonFormProps> = ({ onImportSuccess }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateCampaigns = (data: any): Campaign[] => {
    if (!Array.isArray(data)) {
      throw new Error('JSON file must contain an array of campaigns');
    }
    
    return data.map((item: any) => {
      if (!item.name || !item.brand || !item.industry) {
        throw new Error('Each campaign must have name, brand, and industry fields');
      }
      
      const targetAudience = Array.isArray(item.targetAudience) ? item.targetAudience : [];
      const objectives = Array.isArray(item.objectives) ? item.objectives : [];
      const features = Array.isArray(item.features) ? item.features : [];
      const emotionalAppeal = Array.isArray(item.emotionalAppeal) ? item.emotionalAppeal : [];
      const outcomes = Array.isArray(item.outcomes) ? item.outcomes : [];
      
      return {
        id: item.id || uuidv4(),
        name: item.name,
        brand: item.brand,
        industry: item.industry,
        year: item.year || new Date().getFullYear(),
        keyMessage: item.keyMessage || '',
        strategy: item.strategy || '',
        targetAudience,
        objectives,
        features,
        emotionalAppeal,
        outcomes,
        viralElement: item.viralElement || '',
        creativeActivation: item.creativeActivation || ''
      } as Campaign;
    });
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setError(null);
    
    try {
      if (!file.name.endsWith('.json')) {
        throw new Error('Please upload a JSON file');
      }
      
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const data = JSON.parse(content);
          const validatedCampaigns = validateCampaigns(data);
          
          onImportSuccess(validatedCampaigns);
          setIsProcessing(false);
          
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        } catch (error) {
          setError(error instanceof Error ? error.message : 'Error parsing JSON file');
          setIsProcessing(false);
        }
      };
      
      reader.onerror = () => {
        setError('Error reading file');
        setIsProcessing(false);
      };
      
      reader.readAsText(file);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error processing file');
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragging ? 'border-primary bg-primary/5' : 'border-gray-300 dark:border-gray-700'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileInput}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".json"
          className="hidden"
        />
        
        <div className="flex flex-col items-center justify-center gap-2">
          <Upload className="w-8 h-8 text-muted-foreground" />
          <div className="text-lg font-medium">
            {isProcessing ? 'Processing...' : 'Drag & drop a JSON file here'}
          </div>
          <p className="text-sm text-muted-foreground max-w-md">
            Upload a JSON file containing an array of campaign objects. 
            Each campaign must include name, brand, and industry fields.
          </p>
          <Button 
            variant="outline" 
            type="button" 
            className="mt-2" 
            disabled={isProcessing}
            onClick={(e) => {
              e.stopPropagation();
              triggerFileInput();
            }}
          >
            {isProcessing ? 'Processing...' : 'Select File'}
          </Button>
        </div>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="text-sm text-muted-foreground">
        <h3 className="font-medium mb-1">JSON Format Example:</h3>
        <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md overflow-x-auto text-xs">
{`[
  {
    "name": "Campaign Name",
    "brand": "Brand Name",
    "industry": "Industry",
    "targetAudience": ["Audience 1", "Audience 2"],
    "objectives": ["Objective 1"],
    "emotionalAppeal": ["Emotional Appeal 1"]
  }
]`}
        </pre>
      </div>
    </div>
  );
};

export default ImportJsonForm;
