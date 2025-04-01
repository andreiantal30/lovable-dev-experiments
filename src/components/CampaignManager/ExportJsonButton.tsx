
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { Campaign } from '@/lib/campaignData';

interface ExportJsonButtonProps {
  campaigns: Campaign[];
}

const ExportJsonButton: React.FC<ExportJsonButtonProps> = ({ campaigns }) => {
  const handleExport = () => {
    try {
      // Convert campaigns to JSON string with pretty formatting
      const jsonData = JSON.stringify(campaigns, null, 2);
      
      // Create a Blob with the JSON data
      const blob = new Blob([jsonData], { type: 'application/json' });
      
      // Create a download URL for the Blob
      const url = URL.createObjectURL(blob);
      
      // Create a temporary anchor element to trigger the download
      const a = document.createElement('a');
      a.href = url;
      a.download = `campaigns-export-${new Date().toISOString().split('T')[0]}.json`;
      
      // Trigger the download
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting campaigns:', error);
      alert('An error occurred while exporting the campaigns');
    }
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      className="flex items-center" 
      onClick={handleExport}
      disabled={campaigns.length === 0}
    >
      <Download className="mr-2 h-4 w-4" />
      Export JSON
    </Button>
  );
};

export default ExportJsonButton;
