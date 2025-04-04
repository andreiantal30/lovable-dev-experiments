import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  getSavedCampaigns,
  removeSavedCampaign,
  toggleFavoriteStatus
} from '@/lib/campaignStorage';
import { CampaignSidebarProvider } from '@/components/CampaignSidebarProvider';
import CampaignSidebar from '@/components/CampaignSidebar';
import { SidebarInset } from '@/components/ui/sidebar';
import CampaignDetailView from '@/components/CampaignDetail/CampaignDetailView';
import { ArrowLeft } from 'lucide-react';

interface CampaignDetailProps {
  id?: string;
}

const CampaignDetail: React.FC<CampaignDetailProps> = ({ id: propId }) => {
  const { id: paramId } = useParams<{ id: string }>();
  const id = propId || paramId;
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInSidebar, setIsInSidebar] = useState(!!propId);

  useEffect(() => {
    if (!id) return;

    try {
      const saved = getSavedCampaigns(); // returns object
      const campaignData = saved[id];

      if (campaignData) {
        setCampaign(campaignData.campaign);
      } else {
        toast.error('Campaign not found');
        navigate('/library');
      }
    } catch (error) {
      console.error('Error loading campaign:', error);
      toast.error('Failed to load campaign');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  const handleDelete = () => {
    if (!id) return;

    if (window.confirm('Are you sure you want to delete this campaign?')) {
      try {
        const success = removeSavedCampaign(id);
        if (success) {
          toast.success('Campaign deleted successfully');
          navigate('/library');
        } else {
          toast.error('Failed to delete campaign');
        }
      } catch (error) {
        console.error('Error deleting campaign:', error);
        toast.error('An error occurred while deleting the campaign');
      }
    }
  };

  const handleToggleFavorite = () => {
    if (!id) return;

    try {
      const success = toggleFavoriteStatus(id);
      if (success) {
        setCampaign(prev => ({
          ...prev,
          favorite: !prev.favorite
        }));
        toast.success(campaign?.favorite ? 'Removed from favorites' : 'Added to favorites');
      } else {
        toast.error('Failed to update favorite status');
      }
    } catch (error) {
      console.error('Error updating favorite status:', error);
      toast.error('An error occurred while updating the campaign');
    }
  };

  const handleCampaignSelect = (campaignId: string) => {
    navigate(`/campaign/${campaignId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading campaign details...</p>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-muted-foreground mb-4">Failed to load campaign details. The data may be malformed or incomplete.</p>
        <Button onClick={() => navigate('/library')}>Back to Library</Button>
      </div>
    );
  }

  const renderContent = () => (
    <>
      {!isInSidebar && (
        <Button
          variant="ghost"
          onClick={() => navigate('/library')}
          className="mb-4 text-sm text-muted-foreground hover:text-primary flex items-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to all campaigns
        </Button>
      )}
   <CampaignDetailView
  id={id || ''}
  campaign={campaign}
  isInSidebar={isInSidebar}
  onDelete={handleDelete}
  onToggleFavorite={handleToggleFavorite}
/>
    </>
  );

  if (isInSidebar) {
    return renderContent();
  }

  return (
    <CampaignSidebarProvider>
      <CampaignSidebar onCampaignSelect={handleCampaignSelect} selectedCampaignId={id} />
      <SidebarInset className="bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950">
        {renderContent()}
      </SidebarInset>
    </CampaignSidebarProvider>
  );
};

export default CampaignDetail;