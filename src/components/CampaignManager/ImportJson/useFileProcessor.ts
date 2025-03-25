
import { useState } from 'react';
import { Campaign } from '@/lib/campaignData';
import { validateCampaigns } from './validateCampaigns';

export const useFileProcessor = (onImportSuccess: (campaigns: Campaign[]) => void) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFile = async (file: File, fileInputRef: React.RefObject<HTMLInputElement>) => {
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

  return {
    isProcessing,
    error,
    processFile,
    setError
  };
};
