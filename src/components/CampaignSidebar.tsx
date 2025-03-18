
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { format, isToday, isYesterday, subDays, isAfter } from 'date-fns';
import { 
  FilePlus, 
  MessageSquare, 
  Settings, 
  Star, 
  PlusCircle,
  Calendar,
  BookOpen,
  RefreshCcw
} from 'lucide-react';
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
  SidebarTrigger,
  SidebarInput
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { getSavedCampaigns } from '@/lib/campaignStorage';
import { Badge } from './ui/badge';
import { toast } from 'sonner';

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

// Create a global event bus for campaign updates
export const campaignEvents = {
  subscribe: (callback: () => void) => {
    window.addEventListener('campaign-updated', callback);
    return () => window.removeEventListener('campaign-updated', callback);
  },
  emit: () => {
    window.dispatchEvent(new Event('campaign-updated'));
  }
};

const CampaignSidebar: React.FC<SidebarProps> = ({ onCampaignSelect, selectedCampaignId }) => {
  const [groupedCampaigns, setGroupedCampaigns] = useState<GroupedCampaigns>({
    today: [],
    yesterday: [],
    previousWeek: [],
    older: []
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadCampaigns();
    
    // Subscribe to campaign update events
    const unsubscribe = campaignEvents.subscribe(() => {
      loadCampaigns();
    });
    
    // Refresh campaigns every 30 seconds
    const interval = setInterval(loadCampaigns, 30000);
    
    return () => {
      clearInterval(interval);
      unsubscribe();
    };
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

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadCampaigns();
    toast.success("Campaigns refreshed");
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleCreateNewCampaign = () => {
    navigate('/');
  };

  const filteredCampaigns = (campaigns: Array<{id: string, name: string}>) => {
    if (!searchTerm) return campaigns;
    return campaigns.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const totalCampaigns = 
    groupedCampaigns.today.length + 
    groupedCampaigns.yesterday.length + 
    groupedCampaigns.previousWeek.length + 
    groupedCampaigns.older.length;

  return (
    <Sidebar>
      <SidebarHeader className="flex flex-col gap-3 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">My Campaigns</h2>
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8" 
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCcw 
                className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} 
              />
              <span className="sr-only">Refresh campaigns</span>
            </Button>
            <SidebarTrigger />
          </div>
        </div>
        
        <Button 
          className="w-full justify-start gap-2" 
          onClick={handleCreateNewCampaign}
        >
          <PlusCircle className="h-4 w-4" />
          New Campaign
        </Button>
        
        <SidebarInput 
          type="search" 
          placeholder="Search campaigns..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={() => navigate('/library')}
              isActive={window.location.pathname === '/library'}
              tooltip="View all campaigns"
            >
              <BookOpen className="h-4 w-4" />
              <span>All Campaigns</span>
              <Badge variant="outline" className="ml-auto">
                {totalCampaigns}
              </Badge>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={() => navigate('/library?favorites=true')}
              isActive={window.location.search.includes('favorites=true')}
              tooltip="View favorite campaigns"
            >
              <Star className="h-4 w-4 text-yellow-500" />
              <span>Favorites</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        
        {filteredCampaigns(groupedCampaigns.today).length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Today</SidebarGroupLabel>
            <SidebarMenuSub>
              {filteredCampaigns(groupedCampaigns.today).map((campaign) => (
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
        
        {filteredCampaigns(groupedCampaigns.yesterday).length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Yesterday</SidebarGroupLabel>
            <SidebarMenuSub>
              {filteredCampaigns(groupedCampaigns.yesterday).map((campaign) => (
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
        
        {filteredCampaigns(groupedCampaigns.previousWeek).length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Previous 7 Days</SidebarGroupLabel>
            <SidebarMenuSub>
              {filteredCampaigns(groupedCampaigns.previousWeek).map((campaign) => (
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
        
        {filteredCampaigns(groupedCampaigns.older).length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Older</SidebarGroupLabel>
            <SidebarMenuSub>
              {filteredCampaigns(groupedCampaigns.older).map((campaign) => (
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
        
        {totalCampaigns === 0 && (
          <div className="px-4 py-8 text-center text-muted-foreground">
            <MessageSquare className="mx-auto h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm">No campaigns yet</p>
            <p className="text-xs mt-1">Create your first campaign to see it here</p>
          </div>
        )}
      </SidebarContent>
      
      <SidebarFooter>
        <div className="p-4">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start"
            onClick={() => navigate('/manager')}
          >
            <Settings className="mr-2 h-4 w-4" />
            Campaign Manager
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default CampaignSidebar;
