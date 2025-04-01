
import React from 'react';
import { Button } from '@/components/ui/button';
import { Star, Clipboard } from 'lucide-react';
import { toast } from 'sonner';

interface CampaignActionsProps {
  id: string;
  campaign: any;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onDelete: () => void;
}

const CampaignActions: React.FC<CampaignActionsProps> = ({ 
  id, 
  campaign, 
  isFavorite, 
  onToggleFavorite, 
  onDelete 
}) => {
  const handleCopyToClipboard = () => {
    if (!campaign) return;
    
    const campaignText = `
Campaign Name: ${campaign.campaign.campaignName}
Brand: ${campaign.brand}
Industry: ${campaign.industry}
Key Message: ${campaign.campaign.keyMessage}
Creative Strategy: ${campaign.campaign.creativeStrategy.join('\n- ')}
Execution Plan: ${campaign.campaign.executionPlan.join('\n- ')}
Expected Outcomes: ${campaign.campaign.expectedOutcomes.join('\n- ')}
    `.trim();
    
    navigator.clipboard.writeText(campaignText);
    toast.success('Campaign details copied to clipboard');
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onToggleFavorite}
        className="flex items-center"
      >
        <Star className={`mr-2 h-4 w-4 ${isFavorite ? 'text-yellow-500 fill-yellow-500' : ''}`} />
        {isFavorite ? 'Favorited' : 'Add to Favorites'}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleCopyToClipboard}
        className="flex items-center"
      >
        <Clipboard className="mr-2 h-4 w-4" />
        Copy
      </Button>
    </div>
  );
};

export default CampaignActions;
