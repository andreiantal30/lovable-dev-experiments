
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Campaign } from '@/lib/campaignData';
import { scrapeCampaigns, getAvailableSources } from '@/lib/campaignScraper';
import { Loader2 } from 'lucide-react';

interface ScrapeCampaignFormProps {
  onCampaignsScraped: (campaigns: Campaign[]) => void;
}

const ScrapeCampaignForm: React.FC<ScrapeCampaignFormProps> = ({ onCampaignsScraped }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSource, setSelectedSource] = useState('');
  const [scrapedCampaigns, setScrapedCampaigns] = useState<Campaign[]>([]);
  const [error, setError] = useState('');
  const sources = getAvailableSources();

  const handleScrape = async () => {
    if (!selectedSource) {
      setError('Please select a source to scrape');
      return;
    }

    setIsLoading(true);
    setError('');
    setScrapedCampaigns([]);

    try {
      const result = await scrapeCampaigns(selectedSource);
      
      if (result.success && result.campaigns) {
        setScrapedCampaigns(result.campaigns);
      } else {
        setError(result.error || 'Failed to scrape campaigns');
      }
    } catch (error) {
      setError('An unexpected error occurred');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCampaigns = () => {
    if (scrapedCampaigns.length > 0) {
      onCampaignsScraped(scrapedCampaigns);
      setScrapedCampaigns([]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Scrape New Campaigns</h3>
        <p className="text-sm text-muted-foreground">
          Fetch the latest award-winning campaigns from popular sources to keep your database updated.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {sources.map((source) => (
          <Card
            key={source.name}
            className={`p-4 cursor-pointer transition-all hover:shadow-md ${
              selectedSource === source.name ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setSelectedSource(source.name)}
          >
            <div className="font-medium">{source.name}</div>
            <div className="text-sm text-muted-foreground truncate">{source.url}</div>
          </Card>
        ))}
      </div>

      {error && <div className="text-sm text-red-500">{error}</div>}

      <div className="flex gap-3">
        <Button 
          onClick={handleScrape} 
          disabled={isLoading}
          className="relative"
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Scrape Campaigns
        </Button>
        
        <Button
          variant="outline"
          onClick={handleAddCampaigns}
          disabled={scrapedCampaigns.length === 0}
        >
          Add {scrapedCampaigns.length} Campaign(s) to Database
        </Button>
      </div>

      {scrapedCampaigns.length > 0 && (
        <div className="space-y-4 mt-6">
          <h4 className="font-medium">Scraped Campaigns</h4>
          
          <div className="grid grid-cols-1 gap-4 max-h-96 overflow-y-auto pr-2">
            {scrapedCampaigns.map((campaign) => (
              <Card key={campaign.id} className="p-4">
                <div className="font-medium text-lg">{campaign.name}</div>
                <div className="text-sm mb-2">
                  {campaign.brand} • {campaign.year}
                </div>
                <div className="text-sm mb-2">{campaign.keyMessage}</div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {campaign.targetAudience.map((audience, i) => (
                    <Badge key={i} variant="outline">{audience}</Badge>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ScrapeCampaignForm;
