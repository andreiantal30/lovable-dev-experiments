import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from '@/components/ui/card';
import EnhancedCampaignResult from '@/components/EnhancedCampaignResult';
import CampaignHeader from './CampaignHeader';
import CampaignActions from './CampaignActions';
import CampaignMeta from './CampaignMeta';
import { CampaignFeedbackData } from '@/components/FeedbackSystem';
import { SavedCampaign } from '@/lib/campaignStorage';

interface CampaignDetailViewProps {
  id: string;
  campaign: SavedCampaign;
  isInSidebar: boolean;
  onDelete: () => void;
  onToggleFavorite: () => void;
}

const CampaignDetailView: React.FC<CampaignDetailViewProps> = ({
  id,
  campaign,
  isInSidebar,
  onDelete,
  onToggleFavorite,
}) => {
  const navigate = useNavigate();

  const handleRefine = async (feedback: CampaignFeedbackData): Promise<void> => {
    return Promise.resolve(); // stub
  };

  // 🧠 Log eval on mount for debugging
  useEffect(() => {
    if (campaign?.campaign?.evaluation) {
      console.log("✅ Loaded Evaluation from Library:", campaign.campaign.evaluation);
    } else {
      console.warn("❌ Evaluation missing in saved campaign:", campaign);
    }
  }, [campaign]);

  // ✅ Guard against malformed campaign structure
  const isValid =
    campaign?.campaign &&
    campaign.campaign.campaignName &&
    campaign.campaign.keyMessage &&
    Array.isArray(campaign.campaign.creativeInsights) &&
    typeof campaign.campaign.creativeInsights[0] === 'object' &&
    'surfaceInsight' in campaign.campaign.creativeInsights[0];

  if (!isValid) {
    console.warn('🛑 Invalid campaign object:', campaign);
    return (
      <div className="p-10 text-center text-muted-foreground">
        <p>Failed to load campaign details. The data may be malformed or incomplete.</p>
        <Button onClick={() => navigate('/library')} className="mt-4">Back to Library</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {!isInSidebar && (
        <CampaignHeader campaignName={campaign.campaign?.campaignName} />
      )}

      <Card className="mb-8">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <CampaignMeta 
              campaignName={campaign.campaign?.campaignName}
              brand={campaign.brand}
              industry={campaign.industry}
              timestamp={campaign.timestamp}
            />
            
            <CampaignActions
              id={id}
              campaign={campaign}
              isFavorite={campaign.favorite}
              onToggleFavorite={onToggleFavorite}
              onDelete={onDelete}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <EnhancedCampaignResult 
              campaign={campaign.campaign}
              onGenerateAnother={() => navigate('/')}
              showFeedbackForm={false}
              onRefine={handleRefine}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            variant="default" 
            className="w-full sm:w-auto flex items-center gap-2"
            onClick={() => navigate('/')}
          >
            <Plus size={16} />
            Create New Campaign
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CampaignDetailView;