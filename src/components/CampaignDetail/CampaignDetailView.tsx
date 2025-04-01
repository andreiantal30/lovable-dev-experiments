
import React from 'react';
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

interface CampaignDetailViewProps {
  id: string;
  campaign: any;
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
    return Promise.resolve();
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {!isInSidebar && (
        <CampaignHeader campaignName={campaign.campaign.campaignName} />
      )}
      
      <Card className="mb-8">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <CampaignMeta 
              campaignName={campaign.campaign.campaignName}
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
