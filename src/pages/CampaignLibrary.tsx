
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Search, ArrowLeft, Filter, Grid3X3, ListFilter, Star, StarOff, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardHeader, 
  CardContent, 
  CardTitle, 
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  getSavedCampaigns, 
  getSavedCampaignById,
  removeSavedCampaign, 
  toggleFavoriteStatus 
} from '@/lib/campaignStorage';
import { GeneratedCampaign } from '@/lib/generateCampaign';
import { SidebarInset } from '@/components/ui/sidebar';
import { CampaignSidebarProvider } from '@/components/CampaignSidebarProvider';
import CampaignSidebar from '@/components/CampaignSidebar';
import CampaignDetail from './CampaignDetail';

interface SavedCampaign {
  id: string;
  timestamp: string;
  favorite: boolean;
  campaign: GeneratedCampaign;
  brand: string;
  industry: string;
}

const CampaignLibrary: React.FC = () => {
  const [campaigns, setCampaigns] = useState<SavedCampaign[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'az' | 'za'>('newest');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | undefined>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Load saved campaigns on mount
  useEffect(() => {
    const favoritesParam = searchParams.get('favorites');
    if (favoritesParam === 'true') {
      setShowFavoritesOnly(true);
    }

    const campaignId = searchParams.get('id');
    if (campaignId) {
      setSelectedCampaignId(campaignId);
    }
    
    loadCampaigns();
  }, [searchParams]);
  
  const loadCampaigns = () => {
    try {
      const savedCampaigns = getSavedCampaigns();
      setCampaigns(savedCampaigns);
    } catch (error) {
      console.error('Error loading saved campaigns:', error);
      toast.error('Failed to load saved campaigns');
    }
  };
  
  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this campaign?')) {
      try {
        const success = removeSavedCampaign(id);
        if (success) {
          loadCampaigns();
          if (selectedCampaignId === id) {
            setSelectedCampaignId(undefined);
          }
          toast.success('Campaign deleted successfully');
        } else {
          toast.error('Failed to delete campaign');
        }
      } catch (error) {
        console.error('Error deleting campaign:', error);
        toast.error('An error occurred while deleting the campaign');
      }
    }
  };
  
  const handleToggleFavorite = (id: string) => {
    try {
      const success = toggleFavoriteStatus(id);
      if (success) {
        loadCampaigns();
      } else {
        toast.error('Failed to update favorite status');
      }
    } catch (error) {
      console.error('Error updating favorite status:', error);
      toast.error('An error occurred while updating the campaign');
    }
  };

  const handleCampaignSelect = (id: string) => {
    setSelectedCampaignId(id);
    navigate(`/library?id=${id}`);
  };
  
  // Filter and sort campaigns
  const filteredCampaigns = campaigns
    .filter(campaign => {
      // Search filter
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = searchTerm === '' || 
        campaign.campaign.campaignName.toLowerCase().includes(searchLower) ||
        campaign.brand.toLowerCase().includes(searchLower) ||
        campaign.campaign.keyMessage.toLowerCase().includes(searchLower);
      
      // Industry filter
      const matchesIndustry = industryFilter === '' || campaign.industry === industryFilter;
      
      // Favorites filter
      const matchesFavorites = !showFavoritesOnly || campaign.favorite;
      
      return matchesSearch && matchesIndustry && matchesFavorites;
    })
    .sort((a, b) => {
      // Sort based on selected option
      switch (sortBy) {
        case 'newest':
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        case 'oldest':
          return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        case 'az':
          return a.campaign.campaignName.localeCompare(b.campaign.campaignName);
        case 'za':
          return b.campaign.campaignName.localeCompare(a.campaign.campaignName);
        default:
          return 0;
      }
    });
  
  // Get unique industries for filter
  const uniqueIndustries = Array.from(new Set(campaigns.map(c => c.industry))).sort();

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // If a campaign is selected, show its detail view
  if (selectedCampaignId) {
    return (
      <CampaignSidebarProvider>
        <CampaignSidebar 
          onCampaignSelect={handleCampaignSelect} 
          selectedCampaignId={selectedCampaignId}
        />
        <SidebarInset className="bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950">
          <div className="container mx-auto px-4 py-6">
            <Button 
              variant="ghost" 
              onClick={() => {
                setSelectedCampaignId(undefined);
                navigate('/library');
              }}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to all campaigns
            </Button>
            <CampaignDetail id={selectedCampaignId} />
          </div>
        </SidebarInset>
      </CampaignSidebarProvider>
    );
  }
  
  return (
    <CampaignSidebarProvider>
      <CampaignSidebar onCampaignSelect={handleCampaignSelect} />
      <SidebarInset className="bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="mb-8 flex justify-between items-center">
            <Link to="/" className="group flex items-center text-primary hover:text-primary/80">
              <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Back to Home
            </Link>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode('grid')}
                className={viewMode === 'grid' ? 'bg-accent' : ''}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode('list')}
                className={viewMode === 'list' ? 'bg-accent' : ''}
              >
                <ListFilter className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
            <h1 className="text-2xl font-semibold mb-6">All Campaigns</h1>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search campaigns..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Select value={industryFilter} onValueChange={setIndustryFilter}>
                  <SelectTrigger className="w-[180px]">
                    <div className="flex items-center">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="All Industries" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Industries</SelectItem>
                    {uniqueIndustries.map(industry => (
                      <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="az">A-Z</SelectItem>
                    <SelectItem value="za">Z-A</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                  className={`flex items-center ${showFavoritesOnly ? 'bg-accent' : ''}`}
                >
                  {showFavoritesOnly ? <Star className="h-4 w-4 mr-2" /> : <StarOff className="h-4 w-4 mr-2" />}
                  {showFavoritesOnly ? 'Favorites Only' : 'All Campaigns'}
                </Button>
              </div>
            </div>
            
            {filteredCampaigns.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground mb-2">No saved campaigns found</p>
                <Link to="/">
                  <Button>Create Your First Campaign</Button>
                </Link>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCampaigns.map((item) => (
                  <Card key={item.id} className="overflow-hidden transition-all hover:shadow-md">
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between">
                        <CardTitle className="text-lg">{item.campaign.campaignName}</CardTitle>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleToggleFavorite(item.id)}
                        >
                          {item.favorite ? (
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          ) : (
                            <Star className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <CardDescription className="flex items-center space-x-1">
                        <span>{item.brand}</span>
                        <span>•</span>
                        <span>{formatDate(item.timestamp)}</span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-2">
                      <p className="text-sm mb-3 line-clamp-2">{item.campaign.keyMessage}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        <Badge variant="outline" className="text-xs">{item.industry}</Badge>
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0 flex justify-between">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleCampaignSelect(item.id)}
                      >
                        View Details
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead>Campaign Name</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead>Industry</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCampaigns.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleToggleFavorite(item.id)}
                        >
                          {item.favorite ? (
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          ) : (
                            <Star className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className="font-medium">
                        <button 
                          className="hover:underline"
                          onClick={() => handleCampaignSelect(item.id)}
                        >
                          {item.campaign.campaignName}
                        </button>
                      </TableCell>
                      <TableCell>{item.brand}</TableCell>
                      <TableCell>{item.industry}</TableCell>
                      <TableCell>{formatDate(item.timestamp)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleCampaignSelect(item.id)}
                          >
                            View
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDelete(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Total Saved Campaigns: <span className="font-medium">{filteredCampaigns.length}</span>
            </p>
            <p className="text-xs text-muted-foreground">
              Campaign data is stored locally in your browser's storage.
            </p>
          </div>
        </div>
      </SidebarInset>
    </CampaignSidebarProvider>
  );
};

export default CampaignLibrary;
