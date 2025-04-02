// src/components/CampaignDetail/CampaignActions.tsx

import React from 'react';
import { Button } from '@/components/ui/button';
import { Star, Clipboard } from 'lucide-react';
import { toast } from 'sonner';
import { SavedCampaign } from '@/lib/campaignStorage';

interface CampaignActionsProps {
  id: string;
  campaign: SavedCampaign;
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
    const data = campaign.campaign;
    if (!data) {
      toast.error('No campaign data available to copy.');
      return;
    }

    const campaignText = `
Campaign Name: ${data.campaignName}
Brand: ${campaign.brand}
Industry: ${campaign.industry}
Key Message: ${data.keyMessage}

Creative Strategy:
${data.creativeStrategy?.map(s => `- ${s}`).join('\n') || 'N/A'}

Execution Plan:
${data.executionPlan?.map(s => `- ${s}`).join('\n') || 'N/A'}

Expected Outcomes:
${data.expectedOutcomes?.map(s => `- ${s}`).join('\n') || 'N/A'}

Viral Element: ${data.viralElement || '—'}
PR Headline: ${data.prHeadline || '—'}
    `.trim();

    navigator.clipboard.writeText(campaignText);
    toast.success('📋 Campaign details copied to clipboard!');
  };

  return (
    <div className="flex flex-col items-start gap-3">
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
      <div className="text-sm text-muted-foreground ml-1">
        <div><strong>Brand:</strong> {campaign.brand}</div>
        <div><strong>Industry:</strong> {campaign.industry}</div>
      </div>
    </div>
  );
};

export default CampaignActions;
