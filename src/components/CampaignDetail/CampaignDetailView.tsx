import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import EnhancedCampaignResult from '@/components/EnhancedCampaignResult';
import CampaignHeader from './CampaignHeader';
import CampaignActions from './CampaignActions';
import CampaignMeta from './CampaignMeta';
import { CampaignFeedbackData } from '@/components/FeedbackSystem';
import { SavedCampaign } from '@/lib/campaignStorage';

// Simple error boundary component
class ErrorBoundary extends React.Component<{ fallback: React.ReactNode; children: React.ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, info);
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

interface CampaignDetailViewProps {
  id: string;
  campaign: SavedCampaign | any;
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

  // Safely normalize campaign data
  const normalizedCampaign = React.useMemo(() => {
    if (!campaign) return null;

    try {
      // Handle case where campaign is already in correct format
      if (campaign.campaign) return campaign;

      // Handle raw campaign data
      return {
        campaign: {
          campaignName: campaign.prHeadline || 'Untitled Campaign',
          ...campaign,
          // Ensure creativeInsights is properly formatted
          creativeInsights: Array.isArray(campaign.creativeInsights) 
            ? campaign.creativeInsights 
            : [],
          // Ensure evaluation exists
          evaluation: campaign.evaluation || {
            insightSharpness: 0,
            ideaOriginality: 0,
            executionPotential: 0,
            awardPotential: 0,
            finalVerdict: 'No evaluation available.',
          },
          // Stringify any object fields that shouldn't be rendered directly
          surfaceInsight: typeof campaign.surfaceInsight === 'string' 
            ? campaign.surfaceInsight 
            : JSON.stringify(campaign.surfaceInsight || {}),
          emotionalUndercurrent: typeof campaign.emotionalUndercurrent === 'string'
            ? campaign.emotionalUndercurrent
            : JSON.stringify(campaign.emotionalUndercurrent || {}),
          creativeUnlock: typeof campaign.creativeUnlock === 'string'
            ? campaign.creativeUnlock
            : JSON.stringify(campaign.creativeUnlock || {}),
        },
        brand: campaign.brand || campaign?.campaign?.brand || 'Unknown Brand',
        industry: campaign.industry || campaign?.campaign?.industry || 'Unknown Industry',
        timestamp: campaign.timestamp || new Date().toISOString(),
        favorite: campaign.favorite || false,
      };
    } catch (error) {
      console.error('Error normalizing campaign:', error);
      return null;
    }
  }, [campaign]);

  if (!normalizedCampaign) {
    return (
      <div className="p-10 text-center text-muted-foreground">
        <p>Failed to load campaign details. The data may be malformed.</p>
        <Button onClick={() => navigate('/library')} className="mt-4">
          Back to Library
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {!isInSidebar && (
        <CampaignHeader campaignName={normalizedCampaign.campaign.campaignName} />
      )}

      <Card className="mb-8">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <CampaignMeta
              campaignName={normalizedCampaign.campaign.campaignName}
              brand={normalizedCampaign.brand}
              industry={normalizedCampaign.industry}
              timestamp={normalizedCampaign.timestamp}
            />
            
            <CampaignActions
              id={id}
              campaign={normalizedCampaign}
              isFavorite={normalizedCampaign.favorite}
              onToggleFavorite={onToggleFavorite}
              onDelete={onDelete}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <ErrorBoundary fallback={
              <div className="text-red-500 p-4 border rounded">
                Failed to render campaign details. Please check the console for errors.
              </div>
            }>
              <EnhancedCampaignResult 
                campaign={normalizedCampaign.campaign}
                onGenerateAnother={() => navigate('/')}
                showFeedbackForm={false}
                onRefine={() => Promise.resolve()}
              />
            </ErrorBoundary>
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