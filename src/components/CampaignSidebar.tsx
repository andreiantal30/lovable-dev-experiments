
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { format, isToday, isYesterday, subDays, isAfter } from 'date-fns';
import { FilePlus, MessageSquare, Settings, Star } from 'lucide-react';
import { 
  Sidebar, 
  SidebarHeader, 
  SidebarContent, 
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarTrigger
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { getSavedCampaigns } from '@/lib/campaignStorage';
import { Badge } from './ui/badge';

interface SidebarProps {
  onCampaignSelect: (id: string) => void;
  selectedCampaignId?: string;
}

interface GroupedCampaigns {
  today: Array<{id: string, name: string}>;
  yesterday: Array<{id: string, name: string}>;
  previousWeek: Array<{id: string, name: string}>;
  older: Array<{id: string, name: string}>;
}

const CampaignSidebar: React.FC<SidebarProps> = ({ onCampaignSelect, selectedCampaignId }) => {
  const [groupedCampaigns, setGroupedCampaigns] = useState<GroupedCampaigns>({
    today: [],
    yesterday: [],
    previousWeek: [],
    older: []
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = () => {
    try {
      const campaigns = getSavedCampaigns();
      
      // Group campaigns by date
      const grouped: GroupedCampaigns = {
        today: [],
        yesterday: [],
        previousWeek: [],
        older: []
      };

      const oneWeekAgo = subDays(new Date(), 7);
      
      campaigns.forEach(campaign => {
        const campaignDate = new Date(campaign.timestamp);
        const campaignItem = { 
          id: campaign.id, 
          name: campaign.campaign.campaignName 
        };
        
        if (isToday(campaignDate)) {
          grouped.today.push(campaignItem);
        } else if (isYesterday(campaignDate)) {
          grouped.yesterday.push(campaignItem);
        } else if (isAfter(campaignDate, oneWeekAgo)) {
          grouped.previousWeek.push(campaignItem);
        } else {
          grouped.older.push(campaignItem);
        }
      });
      
      setGroupedCampaigns(grouped);
    } catch (error) {
      console.error('Error loading campaigns for sidebar:', error);
    }
  };

  const handleCreateNewCampaign = () => {
    navigate('/');
  };

  return (
    <Sidebar>
      <SidebarHeader className="flex items-center justify-between p-4">
        <h2 className="text-lg font-semibold">Campaign Library</h2>
        <SidebarTrigger />
      </SidebarHeader>
      
      <SidebarContent>
        <div className="px-3 mb-4">
          <Button 
            className="w-full justify-start" 
            onClick={handleCreateNewCampaign}
          >
            <FilePlus className="mr-2 h-4 w-4" />
            Create New Campaign
          </Button>
        </div>
        
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={() => navigate('/library')}
              isActive={!selectedCampaignId}
            >
              <MessageSquare className="h-4 w-4" />
              <span>All Campaigns</span>
              <Badge variant="outline" className="ml-auto">
                {groupedCampaigns.today.length + 
                 groupedCampaigns.yesterday.length + 
                 groupedCampaigns.previousWeek.length + 
                 groupedCampaigns.older.length}
              </Badge>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => navigate('/library?favorites=true')}>
              <Star className="h-4 w-4 text-yellow-500" />
              <span>Favorites</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        
        {groupedCampaigns.today.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Today</SidebarGroupLabel>
            <SidebarMenuSub>
              {groupedCampaigns.today.map((campaign) => (
                <SidebarMenuSubItem key={campaign.id}>
                  <SidebarMenuSubButton
                    onClick={() => onCampaignSelect(campaign.id)}
                    isActive={selectedCampaignId === campaign.id}
                  >
                    {campaign.name}
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          </SidebarGroup>
        )}
        
        {groupedCampaigns.yesterday.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Yesterday</SidebarGroupLabel>
            <SidebarMenuSub>
              {groupedCampaigns.yesterday.map((campaign) => (
                <SidebarMenuSubItem key={campaign.id}>
                  <SidebarMenuSubButton
                    onClick={() => onCampaignSelect(campaign.id)}
                    isActive={selectedCampaignId === campaign.id}
                  >
                    {campaign.name}
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          </SidebarGroup>
        )}
        
        {groupedCampaigns.previousWeek.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Previous 7 Days</SidebarGroupLabel>
            <SidebarMenuSub>
              {groupedCampaigns.previousWeek.map((campaign) => (
                <SidebarMenuSubItem key={campaign.id}>
                  <SidebarMenuSubButton
                    onClick={() => onCampaignSelect(campaign.id)}
                    isActive={selectedCampaignId === campaign.id}
                  >
                    {campaign.name}
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          </SidebarGroup>
        )}
        
        {groupedCampaigns.older.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Older</SidebarGroupLabel>
            <SidebarMenuSub>
              {groupedCampaigns.older.map((campaign) => (
                <SidebarMenuSubItem key={campaign.id}>
                  <SidebarMenuSubButton
                    onClick={() => onCampaignSelect(campaign.id)}
                    isActive={selectedCampaignId === campaign.id}
                  >
                    {campaign.name}
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          </SidebarGroup>
        )}
      </SidebarContent>
      
      <SidebarFooter>
        <div className="p-4">
          <Button variant="outline" className="w-full justify-start" size="sm">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default CampaignSidebar;
