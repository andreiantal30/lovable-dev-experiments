
import React, { useRef } from 'react';
import { Campaign } from '@/lib/campaignData';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import DropZone from './ImportJson/DropZone';
import JsonFormatExample from './ImportJson/JsonFormatExample';
import { useFileProcessor } from './ImportJson/useFileProcessor';

interface ImportJsonFormProps {
  onImportSuccess: (campaigns: Campaign[]) => void;
}

const ImportJsonForm: React.FC<ImportJsonFormProps> = ({ onImportSuccess }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isProcessing, error, processFile } = useFileProcessor(onImportSuccess);

  const handleFileSelected = (file: File) => {
    processFile(file, fileInputRef);
  };

  return (
    <div className="space-y-4">
      <DropZone 
        onFileSelected={handleFileSelected}
        isProcessing={isProcessing}
      />
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <JsonFormatExample />
    </div>
  );
};

export default ImportJsonForm;
