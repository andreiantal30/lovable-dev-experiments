import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Search, ArrowLeft, Filter, Grid3X3, ListFilter, Star, StarOff, Trash2, Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getSavedCampaigns, removeSavedCampaign, toggleFavoriteStatus } from '@/lib/campaignStorage';
import { GeneratedCampaign } from '@/lib/generateCampaign';
import { SidebarInset } from '@/components/ui/sidebar';
import { CampaignSidebarProvider } from '@/components/CampaignSidebarProvider';
import CampaignSidebar from '@/components/CampaignSidebar';
import CampaignDetail from './CampaignDetail';
import { getEvaluationScore } from '@/utils/evaluationHelpers';

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
  const [industryFilter, setIndustryFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'az' | 'za'>('newest');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | undefined>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get('favorites') === 'true') {
      setShowFavoritesOnly(true);
    }
    const id = searchParams.get('id');
    if (id) setSelectedCampaignId(id);
    loadCampaigns();
  }, [searchParams]);

  const loadCampaigns = () => {
    try {
      const savedObject = getSavedCampaigns(); // returns Record<string, SavedCampaign>
      const savedArray = Object.values(savedObject); // convert to array
      setCampaigns(savedArray);                     // ✅ FIXED
    } catch (error) {
      console.error('Load error:', error);
      toast.error('Failed to load saved campaigns');
    }
  };

  useEffect(() => {
    const handleUpdate = () => loadCampaigns();
    window.addEventListener('campaign-updated', handleUpdate);
    return () => window.removeEventListener('campaign-updated', handleUpdate);
  }, []);

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this campaign?')) {
      const success = removeSavedCampaign(id);
      if (success) {
        loadCampaigns();
        if (selectedCampaignId === id) setSelectedCampaignId(undefined);
        toast.success('Deleted');
      } else {
        toast.error('Delete failed');
      }
    }
  };

  const handleToggleFavorite = (id: string) => {
    const success = toggleFavoriteStatus(id);
    if (success) loadCampaigns();
    else toast.error('Could not toggle favorite');
  };

  const handleCampaignSelect = (id: string) => {
    setSelectedCampaignId(id);
    navigate(`/library?id=${id}`);
  };

  const filteredCampaigns = campaigns
    .filter(c => {
      const s = searchTerm.toLowerCase();
      return (!searchTerm || c.campaign.campaignName.toLowerCase().includes(s) || c.brand.toLowerCase().includes(s) || c.campaign.keyMessage.toLowerCase().includes(s))
        && (industryFilter === 'all' || c.industry === industryFilter)
        && (!showFavoritesOnly || c.favorite);
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest': return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        case 'oldest': return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        case 'az': return a.campaign.campaignName.localeCompare(b.campaign.campaignName);
        case 'za': return b.campaign.campaignName.localeCompare(a.campaign.campaignName);
        default: return 0;
      }
    });

  const uniqueIndustries = Array.from(new Set(campaigns.map(c => c.industry))).sort();

  const formatDate = (d: string) => new Date(d).toLocaleString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  if (selectedCampaignId) {
    return (
      <CampaignSidebarProvider>
        <CampaignSidebar onCampaignSelect={handleCampaignSelect} selectedCampaignId={selectedCampaignId} />
        <SidebarInset>
          <div className="container mx-auto px-4 py-6">
            <Button variant="ghost" onClick={() => navigate('/library')} className="mb-4">
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
      <SidebarInset>
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="mb-6 flex justify-between items-center">
            <Link to="/" className="group text-primary hover:text-primary/80 flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Link>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setViewMode('grid')} className={viewMode === 'grid' ? 'bg-accent' : ''}><Grid3X3 className="h-4 w-4" /></Button>
              <Button variant="outline" size="sm" onClick={() => setViewMode('list')} className={viewMode === 'list' ? 'bg-accent' : ''}><ListFilter className="h-4 w-4" /></Button>
            </div>
          </div>

          <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center flex-wrap gap-4 mb-4">
              <h1 className="text-2xl font-semibold">My Campaign Library</h1>
              <Link to="/">
                <Button><Plus className="h-4 w-4 mr-2" />Create New Campaign</Button>
              </Link>
            </div>
            <div className="flex flex-wrap gap-4">
              <Input type="search" placeholder="Search campaigns..." className="flex-1" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              <Select value={industryFilter} onValueChange={setIndustryFilter}>
                <SelectTrigger className="w-[180px]"><Filter className="mr-2 h-4 w-4" /><SelectValue placeholder="All Industries" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Industries</SelectItem>
                  {uniqueIndustries.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={v => setSortBy(v as any)}>
                <SelectTrigger className="w-[150px]"><SelectValue placeholder="Sort by" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="az">A-Z</SelectItem>
                  <SelectItem value="za">Z-A</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}>
                {showFavoritesOnly ? <Star className="h-4 w-4 mr-1 text-yellow-500 fill-yellow-500" /> : <StarOff className="h-4 w-4 mr-1" />}
                {showFavoritesOnly ? 'Favorites Only' : 'All Campaigns'}
              </Button>
            </div>
          </div>

          {filteredCampaigns.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground mb-4">No saved campaigns found</p>
              <Link to="/"><Button><Plus className="h-4 w-4 mr-1" /> Create Your First Campaign</Button></Link>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCampaigns.map((item) => {
                const insightScore = getEvaluationScore(item.campaign.evaluation, 'insightSharpness');

                return (
                  <Card key={item.id}>
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between">
                        <CardTitle className="text-lg">{item.campaign.campaignName}</CardTitle>
                        <Button variant="ghost" size="icon" onClick={() => handleToggleFavorite(item.id)}>
                          {item.favorite ? <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" /> : <Star className="h-4 w-4" />}
                        </Button>
                      </div>
                      <CardDescription>{item.brand} • {formatDate(item.timestamp)}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-2">
                      <p className="text-sm line-clamp-2 mb-2">{item.campaign.keyMessage}</p>
                      <Badge variant="outline">{item.industry}</Badge>

                      {insightScore !== null && insightScore > 0 && (
                        <div className="mt-3">
                          <div className="text-xs text-muted-foreground mb-1">CD Score</div>
                          <div className="h-2 bg-gray-300 rounded">
                            <div
                              className="h-2 bg-orange-500 rounded"
                              style={{ width: `${insightScore * 10}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="p-4 pt-0 flex justify-between">
                      <Button variant="outline" size="sm" onClick={() => handleCampaignSelect(item.id)}>View</Button>
                      <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4 mr-1" />Delete</Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead />
                  <TableHead>Campaign</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>CD Score</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCampaigns.map(item => {
                  const awardScore = getEvaluationScore(item.campaign.evaluation, 'awardPotential');

                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => handleToggleFavorite(item.id)}>
                          {item.favorite ? <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" /> : <Star className="h-4 w-4" />}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <button onClick={() => handleCampaignSelect(item.id)} className="hover:underline">{item.campaign.campaignName}</button>
                      </TableCell>
                      <TableCell>{item.brand}</TableCell>
                      <TableCell>{item.industry}</TableCell>
                      <TableCell>{formatDate(item.timestamp)}</TableCell>
                      <TableCell>{awardScore !== null ? `${awardScore}/10` : '–'}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => handleCampaignSelect(item.id)}>View</Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </SidebarInset>
    </CampaignSidebarProvider>
  );
};

export default CampaignLibrary;