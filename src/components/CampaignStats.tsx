
import React, { useEffect, useState } from 'react';
import { campaigns } from '@/data/campaigns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

const CampaignStats: React.FC = () => {
  const [stats, setStats] = useState({
    totalCampaigns: 0,
    industriesCount: {} as Record<string, number>,
    yearDistribution: {} as Record<string, number>,
    latestCampaign: { name: '', brand: '', year: 0 },
    oldestCampaign: { name: '', brand: '', year: 3000 },
  });

  useEffect(() => {
    // Extract statistics from campaigns
    const industriesCount: Record<string, number> = {};
    const yearDistribution: Record<string, number> = {};
    
    let latestCampaign = { name: '', brand: '', year: 0 };
    let oldestCampaign = { name: '', brand: '', year: 3000 };

    campaigns.forEach(campaign => {
      // Count industries
      industriesCount[campaign.industry] = (industriesCount[campaign.industry] || 0) + 1;
      
      // Only process year data if year is defined
      if (campaign.year !== undefined) {
        // Count years
        const yearStr = campaign.year.toString();
        yearDistribution[yearStr] = (yearDistribution[yearStr] || 0) + 1;
        
        // Find latest campaign
        if (campaign.year > latestCampaign.year) {
          latestCampaign = {
            name: campaign.name,
            brand: campaign.brand,
            year: campaign.year
          };
        }
        
        // Find oldest campaign
        if (campaign.year < oldestCampaign.year) {
          oldestCampaign = {
            name: campaign.name,
            brand: campaign.brand,
            year: campaign.year
          };
        }
      }
    });

    setStats({
      totalCampaigns: campaigns.length,
      industriesCount,
      yearDistribution,
      latestCampaign,
      oldestCampaign
    });
  }, []);

  // Sort years chronologically
  const sortedYears = Object.keys(stats.yearDistribution).sort((a, b) => parseInt(a) - parseInt(b));
  
  // Sort industries by count (descending)
  const sortedIndustries = Object.entries(stats.industriesCount)
    .sort(([, countA], [, countB]) => countB - countA);

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-center">Campaign Statistics</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Campaign Count</CardTitle>
            <CardDescription>Total number of campaigns in the database</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary">{stats.totalCampaigns}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Campaign Timeline</CardTitle>
            <CardDescription>From {stats.oldestCampaign.year} to {stats.latestCampaign.year}</CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <p><span className="font-medium">Oldest:</span> {stats.oldestCampaign.name} ({stats.oldestCampaign.brand}, {stats.oldestCampaign.year})</p>
              <p><span className="font-medium">Latest:</span> {stats.latestCampaign.name} ({stats.latestCampaign.brand}, {stats.latestCampaign.year})</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Industry Distribution</CardTitle>
            <CardDescription>Number of campaigns per industry</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-72">
              <ul className="space-y-2">
                {sortedIndustries.map(([industry, count]) => (
                  <li key={industry} className="flex justify-between">
                    <span>{industry}</span>
                    <span className="font-medium text-primary">{count}</span>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Campaigns by Year</CardTitle>
            <CardDescription>Distribution across years</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-72">
              <ul className="space-y-2">
                {sortedYears.map(year => (
                  <li key={year} className="flex justify-between">
                    <span>{year}</span>
                    <span className="font-medium text-primary">{stats.yearDistribution[year]}</span>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CampaignStats;
