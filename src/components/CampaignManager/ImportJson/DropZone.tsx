
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

interface DropZoneProps {
  onFileSelected: (file: File) => void;
  isProcessing: boolean;
}

const DropZone: React.FC<DropZoneProps> = ({ onFileSelected, isProcessing }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelected(files[0]);
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
      onFileSelected(files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
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
  );
};

export default DropZone;
