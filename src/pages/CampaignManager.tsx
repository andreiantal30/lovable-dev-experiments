
import React, { useState, useEffect } from 'react';
import { getCampaigns } from '@/lib/campaignStorage';
import { Campaign } from '@/types/Campaign';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import CampaignList from '@/components/CampaignManager/CampaignList';
import { ArrowLeft, Database } from 'lucide-react';

const CampaignManager: React.FC = () => {
  const [campaignList, setCampaignList] = useState<Campaign[]>([]);
  const [activeTab, setActiveTab] = useState('browse');

  useEffect(() => {
    // Load campaigns using the getCampaigns function from campaignStorage
    setCampaignList(getCampaigns());
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950 overflow-hidden relative">
      <div className="container mx-auto px-4 py-12 max-w-6xl relative z-10">
        <div className="flex justify-between items-center mb-8">
          <Link to="/" className="group flex items-center text-primary hover:text-primary/80">
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Home
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-subtle p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Database className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-semibold">Campaign Database Browser</h1>
          </div>
          <p className="text-muted-foreground mb-6">
            Browse the campaign database. All campaigns are loaded from the static file in <code>src/data/campaigns.ts</code>.
            To add or modify campaigns, edit this file directly.
          </p>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full md:w-auto grid-cols-1 mb-6">
              <TabsTrigger value="browse">Browse Campaigns</TabsTrigger>
            </TabsList>

            <TabsContent value="browse" className="pt-2">
              <CampaignList 
                campaigns={campaignList} 
                onDeleteCampaign={() => {
                  toast.info("To remove campaigns, edit the src/data/campaigns.ts file directly.");
                }} 
              />
            </TabsContent>
          </Tabs>
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">
            Total Campaigns in Database: <span className="font-medium">{campaignList.length}</span>
          </p>
          <p className="text-xs text-muted-foreground">
            Campaign data is loaded from <code>src/data/campaigns.ts</code>. 
            To modify the campaign database, edit this file directly.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CampaignManager;
