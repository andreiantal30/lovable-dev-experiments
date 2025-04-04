import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  campaign: SavedCampaign | any; // Added 'any' as fallback type
  isInSidebar: boolean;
  onDelete: () => void;
  onToggleFavorite: () => void;
  onUpdateCampaign?: (updatedData: Partial<SavedCampaign>) => void;
}

const CampaignDetailView: React.FC<CampaignDetailViewProps> = ({
  id,
  campaign,
  isInSidebar,
  onDelete,
  onToggleFavorite,
  onUpdateCampaign,
}) => {
  const navigate = useNavigate();

  const handleRefine = async (feedback: CampaignFeedbackData): Promise<void> => {
    return Promise.resolve();
  };

  // Safely initialize evaluation data
  useEffect(() => {
    if (!campaign) return;

    try {
      if (campaign.campaign && !campaign.campaign.evaluation) {
        const defaultEvaluation = {
          insightSharpness: 0,
          ideaOriginality: 0,
          executionPotential: 0,
          awardPotential: 0,
          finalVerdict: 'No evaluation available.',
        };

        if (onUpdateCampaign) {
          onUpdateCampaign({
            campaign: {
              ...(campaign.campaign || {}),
              evaluation: defaultEvaluation
            }
          });
        }
      }
    } catch (error) {
      console.error('Error initializing campaign evaluation:', error);
    }
  }, [campaign, onUpdateCampaign]);

  // Enhanced validation that handles different data shapes
  const isValid = () => {
    try {
      // Case 1: Proper SavedCampaign object
      if (campaign?.campaign?.campaignName) return true;
      
      // Case 2: Raw campaign data (from your screenshot)
      if (typeof campaign === 'object' && campaign?.keyMessage) return true;
      
      return false;
    } catch {
      return false;
    }
  };

  // Normalize campaign data for consistent usage
  const normalizedCampaign = () => {
    if (!campaign) return null;
    
    // If it's a properly structured SavedCampaign
    if (campaign.campaign) return campaign;
    
    // If it's raw campaign data (from screenshot)
    return {
      campaign: {
        campaignName: campaign.prHeadline || 'Untitled Campaign',
        ...campaign,
        evaluation: campaign.evaluation || {
          insightSharpness: 0,
          ideaOriginality: 0,
          executionPotential: 0,
          awardPotential: 0,
          finalVerdict: 'No evaluation available.',
        }
      },
      brand: campaign.brand || 'Unknown Brand',
      industry: campaign.industry || 'Unknown Industry',
      timestamp: campaign.timestamp || new Date().toISOString(),
      favorite: campaign.favorite || false
    };
  };

  if (!isValid()) {
    console.warn('Invalid campaign object:', campaign);
    return (
      <div className="p-10 text-center text-muted-foreground">
        <p>Failed to load campaign details. The data may be malformed or incomplete.</p>
        <Button onClick={() => navigate('/library')} className="mt-4">
          Back to Library
        </Button>
      </div>
    );
  }

  const safeCampaign = normalizedCampaign();

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {!isInSidebar && (
        <CampaignHeader campaignName={safeCampaign.campaign.campaignName} />
      )}

      <Card className="mb-8">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <CampaignMeta 
              campaignName={safeCampaign.campaign.campaignName}
              brand={safeCampaign.brand}
              industry={safeCampaign.industry}
              timestamp={safeCampaign.timestamp}
            />
            
            <CampaignActions
              id={id}
              campaign={safeCampaign}
              isFavorite={safeCampaign.favorite}
              onToggleFavorite={onToggleFavorite}
              onDelete={onDelete}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <EnhancedCampaignResult 
              campaign={safeCampaign.campaign}
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