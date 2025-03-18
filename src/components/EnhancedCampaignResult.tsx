
import React from 'react';
import CampaignResult, { CampaignResultProps, CampaignFeedback } from '@/components/CampaignResult';
import StorytellingNarrative from './StorytellingNarrative';
import { GeneratedCampaign } from '@/lib/generateCampaign';

interface EnhancedCampaignResultProps extends Omit<CampaignResultProps, 'campaign'> {
  campaign: GeneratedCampaign;
}

const EnhancedCampaignResult: React.FC<EnhancedCampaignResultProps> = ({ 
  campaign, 
  onGenerateAnother, 
  showFeedbackForm, 
  onRefine 
}) => {
  return (
    <div className="space-y-8">
      <CampaignResult
        campaign={campaign}
        onGenerateAnother={onGenerateAnother}
        showFeedbackForm={showFeedbackForm}
        onRefine={onRefine}
      />
      
      {campaign.storytelling && (
        <StorytellingNarrative storytelling={campaign.storytelling} />
      )}
    </div>
  );
};

export { type CampaignFeedback };
export default EnhancedCampaignResult;
