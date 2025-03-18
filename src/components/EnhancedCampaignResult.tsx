
import React, { useState, useEffect } from 'react';
import CampaignResult, { CampaignResultProps, CampaignFeedback } from '@/components/CampaignResult';
import StorytellingNarrative from './StorytellingNarrative';
import { GeneratedCampaign } from '@/lib/generateCampaign';
import { Button } from './ui/button';
import { Bookmark, BookmarkCheck, Check } from 'lucide-react';
import { 
  saveCampaignToLibrary, 
  isCampaignSaved 
} from '@/lib/campaignStorage';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

interface EnhancedCampaignResultProps extends Omit<CampaignResultProps, 'campaign'> {
  campaign: GeneratedCampaign;
  brandName?: string;
  industryName?: string;
}

const EnhancedCampaignResult: React.FC<EnhancedCampaignResultProps> = ({ 
  campaign, 
  onGenerateAnother, 
  showFeedbackForm, 
  onRefine,
  brandName,
  industryName
}) => {
  const [isSaved, setIsSaved] = useState(false);
  const [isJustSaved, setIsJustSaved] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  
  useEffect(() => {
    // Check if campaign is already saved
    if (campaign?.campaignName && brandName) {
      const saved = isCampaignSaved(campaign.campaignName, brandName);
      setIsSaved(saved);
    }
  }, [campaign, brandName]);
  
  const handleSaveCampaign = () => {
    if (!campaign || !brandName || !industryName) {
      toast.error('Missing information needed to save campaign');
      return;
    }
    
    if (isSaved) {
      // Already saved, show a message or navigate to library
      toast.info('This campaign is already saved');
      return;
    }
    
    const savedCampaign = saveCampaignToLibrary(campaign, brandName, industryName);
    
    if (savedCampaign) {
      setIsSaved(true);
      setIsJustSaved(true);
      setSavedId(savedCampaign.id);
      toast.success('Campaign saved to your library');
      
      // Reset the "just saved" state after 3 seconds
      setTimeout(() => {
        setIsJustSaved(false);
      }, 3000);
    } else {
      toast.error('Failed to save campaign');
    }
  };
  
  return (
    <div className="space-y-8">
      {(brandName && industryName) && (
        <div className="flex justify-end mb-4">
          {!isSaved ? (
            <Button
              variant="outline"
              onClick={handleSaveCampaign}
              className="flex items-center"
            >
              <Bookmark className="mr-2 h-4 w-4" />
              Save to Library
            </Button>
          ) : isJustSaved ? (
            <Button
              variant="outline"
              className="flex items-center text-green-600 border-green-600"
              disabled
            >
              <Check className="mr-2 h-4 w-4" />
              Saved Successfully
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button
                variant="outline"
                disabled
                className="flex items-center"
              >
                <BookmarkCheck className="mr-2 h-4 w-4" />
                Saved to Library
              </Button>
              
              {savedId && (
                <Link to={`/campaign/${savedId}`}>
                  <Button variant="secondary" size="sm">
                    View in Library
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      )}
      
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
