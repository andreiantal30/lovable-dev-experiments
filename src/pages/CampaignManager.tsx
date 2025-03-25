
import React, { useState, useEffect } from 'react';
import { getCampaigns, addCampaigns, deleteCampaign, resetCampaignData } from '@/lib/campaignStorage';
import { Campaign } from '@/lib/campaignData';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import AddCampaignForm from '@/components/CampaignManager/AddCampaignForm';
import CampaignList from '@/components/CampaignManager/CampaignList';
import { ArrowLeft, RotateCcw, Database } from 'lucide-react';

const CampaignManager: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [activeTab, setActiveTab] = useState('browse');

  useEffect(() => {
    // Load campaigns from storage
    const loadedCampaigns = getCampaigns();
    setCampaigns(loadedCampaigns);
  }, []);

  const handleAddCampaign = (campaign: Campaign) => {
    try {
      const success = addCampaigns([campaign]);
      if (success) {
        setCampaigns(getCampaigns());
        toast.success('Campaign added successfully');
      } else {
        toast.error('Failed to add campaign');
      }
    } catch (error) {
      console.error('Error adding campaign:', error);
      toast.error('An error occurred while adding the campaign');
    }
  };

  const handleDeleteCampaign = (id: string) => {
    try {
      const success = deleteCampaign(id);
      if (success) {
        setCampaigns(getCampaigns());
        toast.success('Campaign deleted successfully');
      } else {
        toast.error('Failed to delete campaign');
      }
    } catch (error) {
      console.error('Error deleting campaign:', error);
      toast.error('An error occurred while deleting the campaign');
    }
  };

  const handleResetData = () => {
    if (window.confirm('Are you sure you want to reset all campaign data to default? This cannot be undone.')) {
      try {
        const success = resetCampaignData();
        if (success) {
          setCampaigns(getCampaigns());
          toast.success('Campaign data reset to default');
        } else {
          toast.error('Failed to reset campaign data');
        }
      } catch (error) {
        console.error('Error resetting campaign data:', error);
        toast.error('An error occurred while resetting the data');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950 overflow-hidden relative">
      <div className="container mx-auto px-4 py-12 max-w-6xl relative z-10">
        <div className="flex justify-between items-center mb-8">
          <Link to="/" className="group flex items-center text-primary hover:text-primary/80">
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Home
          </Link>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetData}
              className="flex items-center"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset Data
            </Button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-subtle p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Database className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-semibold">Campaign Database Manager</h1>
          </div>
          <p className="text-muted-foreground mb-6">
            Browse and manage your hardcoded campaign database or add new campaigns manually.
            The AI will use this data to generate more relevant and up-to-date campaign ideas.
          </p>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full md:w-auto grid-cols-2 mb-6">
              <TabsTrigger value="browse">Browse Campaigns</TabsTrigger>
              <TabsTrigger value="add">Add Manually</TabsTrigger>
            </TabsList>

            <TabsContent value="browse" className="pt-2">
              <CampaignList campaigns={campaigns} onDeleteCampaign={handleDeleteCampaign} />
            </TabsContent>

            <TabsContent value="add" className="pt-2">
              <AddCampaignForm onSubmit={handleAddCampaign} />
            </TabsContent>
          </Tabs>
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">
            Total Campaigns in Database: <span className="font-medium">{campaigns.length}</span>
          </p>
          <p className="text-xs text-muted-foreground">
            Campaign data is stored locally in your browser's storage. Changes made here won't affect the hardcoded data.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CampaignManager;
