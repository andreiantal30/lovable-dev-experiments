
import React, { useState } from 'react';
import { Campaign } from '@/lib/campaignData';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, SortAsc, SortDesc, ListOrdered } from 'lucide-react';
import ExportJsonButton from './ExportJsonButton';

interface CampaignListProps {
  campaigns: Campaign[];
  onDeleteCampaign: (id: string) => void;
}

const CampaignList: React.FC<CampaignListProps> = ({ campaigns, onDeleteCampaign }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };
  
  const filteredCampaigns = campaigns.filter((campaign) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      campaign.name.toLowerCase().includes(searchLower) ||
      campaign.brand.toLowerCase().includes(searchLower) ||
      campaign.industry.toLowerCase().includes(searchLower) ||
      campaign.targetAudience.some(audience => audience.toLowerCase().includes(searchLower)) ||
      campaign.emotionalAppeal.some(appeal => appeal.toLowerCase().includes(searchLower))
    );
  });
  
  const sortedCampaigns = [...filteredCampaigns].sort((a, b) => {
    let valueA: string | number = '';
    let valueB: string | number = '';
    
    if (sortBy === 'name') {
      valueA = a.name;
      valueB = b.name;
    } else if (sortBy === 'brand') {
      valueA = a.brand;
      valueB = b.brand;
    } else if (sortBy === 'industry') {
      valueA = a.industry;
      valueB = b.industry;
    } else if (sortBy === 'year') {
      valueA = a.year || 0;
      valueB = b.year || 0;
    }
    
    if (typeof valueA === 'number' && typeof valueB === 'number') {
      return sortOrder === 'asc' ? valueA - valueB : valueB - valueA;
    }
    
    return sortOrder === 'asc'
      ? String(valueA).localeCompare(String(valueB))
      : String(valueB).localeCompare(String(valueA));
  });
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-end">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search campaigns..."
            className="pl-9"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="brand">Brand</SelectItem>
              <SelectItem value="industry">Industry</SelectItem>
              <SelectItem value="year">Year</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="icon"
            onClick={toggleSortOrder}
            title={sortOrder === 'asc' ? 'Sort ascending' : 'Sort descending'}
          >
            {sortOrder === 'asc' ? (
              <SortAsc className="h-4 w-4" />
            ) : (
              <SortDesc className="h-4 w-4" />
            )}
          </Button>
          
          <ExportJsonButton campaigns={campaigns} />
        </div>
      </div>
      
      {sortedCampaigns.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No campaigns found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {sortedCampaigns.map((campaign, index) => (
            <Card key={campaign.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-start">
                    <div className="flex items-center justify-center bg-primary/10 text-primary rounded-full w-6 h-6 mr-3 font-medium text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <CardTitle>{campaign.name}</CardTitle>
                      <CardDescription>
                        {campaign.brand} - {campaign.industry} 
                        {campaign.year && ` (${campaign.year})`}
                      </CardDescription>
                    </div>
                  </div>
                  {/* Delete button removed */}
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                {campaign.keyMessage && (
                  <p className="text-sm mb-2">{campaign.keyMessage}</p>
                )}
                <div className="flex flex-wrap gap-1 mb-2">
                  {campaign.targetAudience.map((audience, i) => (
                    <Badge key={i} variant="outline" className="bg-blue-50 dark:bg-blue-950">
                      {audience}
                    </Badge>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1">
                  {campaign.emotionalAppeal.map((appeal, i) => (
                    <Badge key={i} variant="secondary" className="bg-purple-50 dark:bg-purple-950">
                      {appeal}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CampaignList;
