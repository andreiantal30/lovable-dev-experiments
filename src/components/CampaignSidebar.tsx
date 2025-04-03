// src/components/CampaignSidebar.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isToday, isYesterday, subDays, isAfter } from 'date-fns';
import {
  MessageSquare,
  Settings,
  Star,
  PlusCircle,
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
import { campaignEvents } from '@/lib/campaignEvents';  // Ensure this is the correct path


interface SidebarProps {
  onCampaignSelect: (id: string) => void;
  selectedCampaignId?: string;
}

interface GroupedCampaigns {
  today: Array<{ id: string; name: string }>;
  yesterday: Array<{ id: string; name: string }>;
  previousWeek: Array<{ id: string; name: string }>;
  older: Array<{ id: string; name: string }>;
}

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
    loadCampaigns(); // Load campaigns initially

    // Subscribe to campaign updates
    const unsubscribe = campaignEvents.subscribe(() => {
      loadCampaigns(); // Reload campaigns on event
    });

    // Periodically refresh campaigns every 30 seconds
    const interval = setInterval(loadCampaigns, 30000);

    // Cleanup function to remove the interval and unsubscribe on component unmount
    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, []); // Empty dependency array ensures this effect runs only once on mount

  const loadCampaigns = () => {
    try {
      const raw = getSavedCampaigns();
      const campaigns = Array.isArray(raw) ? raw : Object.values(raw);

      const grouped: GroupedCampaigns = {
        today: [],
        yesterday: [],
        previousWeek: [],
        older: []
      };

      const oneWeekAgo = subDays(new Date(), 7);

      // Group campaigns based on their timestamp
      campaigns.forEach((campaign) => {
        const campaignDate = new Date(campaign.timestamp);
        const campaignItem = {
          id: campaign.id,
          name: campaign.campaign?.campaignName ?? '(Untitled)'
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

      setGroupedCampaigns(grouped); // Set the grouped campaigns in state
    } catch (error) {
      console.error('Error loading campaigns for sidebar:', error);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadCampaigns(); // Refresh campaigns
    toast.success('Campaigns refreshed');
    setTimeout(() => setIsRefreshing(false), 500); // Reset refresh state
  };

  const handleCreateNewCampaign = () => {
    navigate('/'); // Navigate to the campaign creation page
  };

  const filteredCampaigns = (campaigns: Array<{ id: string; name: string }>) => {
    if (!searchTerm) return campaigns; // If no search term, return all campaigns
    return campaigns.filter(c =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  return (
    <Sidebar>
      <SidebarHeader className="flex flex-col gap-3 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">My Campaigns</h2>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="sr-only">Refresh campaigns</span>
            </Button>
            <SidebarTrigger />
          </div>
        </div>

        <Button className="w-full justify-start gap-2" onClick={handleCreateNewCampaign}>
          <PlusCircle className="h-4 w-4" />
          New Campaign
        </Button>

        <SidebarInput
          type="search"
          placeholder="Search campaigns..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)} // Update search term on input change
        />
      </SidebarHeader>

      <SidebarContent>
        {/* Render grouped and filtered campaigns */}
        <SidebarGroup>
          <SidebarGroupLabel>Today</SidebarGroupLabel>
          {filteredCampaigns(groupedCampaigns.today).map(campaign => (
            <SidebarMenuItem key={campaign.id} onClick={() => onCampaignSelect(campaign.id)}>
              {campaign.name}
            </SidebarMenuItem>
          ))}
        </SidebarGroup>

        {/* Repeat similar rendering for 'Yesterday', 'Previous Week', 'Older' */}
        {/* Example for Yesterday: */}
        <SidebarGroup>
          <SidebarGroupLabel>Yesterday</SidebarGroupLabel>
          {filteredCampaigns(groupedCampaigns.yesterday).map(campaign => (
            <SidebarMenuItem key={campaign.id} onClick={() => onCampaignSelect(campaign.id)}>
              {campaign.name}
            </SidebarMenuItem>
          ))}
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="p-4">
          <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => navigate('/manager')}>
            <Settings className="mr-2 h-4 w-4" />
            Campaign Manager
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default CampaignSidebar;
