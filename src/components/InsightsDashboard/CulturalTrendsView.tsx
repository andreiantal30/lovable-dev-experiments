
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCachedCulturalTrends, CulturalTrend, getCulturalTrends } from '@/lib/generateCulturalTrends';
import { Button } from '@/components/ui/button';
import { Clock, ArrowRight, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const CulturalTrendsView: React.FC = () => {
  // Use both cached trends and in-memory trends
  const cachedTrends = getCachedCulturalTrends();
  const inMemoryTrends = getCulturalTrends();
  // Combine both sources, prioritizing in-memory trends
  const trends = inMemoryTrends.length > 0 ? inMemoryTrends : cachedTrends;
  
  const navigate = useNavigate();
  const [sourceFilter, setSourceFilter] = useState<string | null>(null);
  
  const handleCreateCampaign = (trend: CulturalTrend) => {
    navigate('/', { 
      state: { 
        insightPrompt: `Give me a campaign based on the cultural trend: ${trend.title} - ${trend.description}`
      }
    });
  };
  
  const filteredTrends = sourceFilter 
    ? trends.filter(trend => trend.source === sourceFilter)
    : trends;
  
  console.log("Displaying cultural trends:", trends);
  console.log("Sources available:", [...new Set(trends.map(trend => trend.source))]);
  
  if (trends.length === 0) {
    return (
      <Card className="w-full bg-muted/50">
        <CardContent className="flex flex-col items-center justify-center py-10">
          <p className="text-center text-muted-foreground mb-4">
            No cultural trends available yet. Click "Update Trends from NewsAPI" or "Update Trends from Reddit" to fetch the latest trends.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  // Get unique sources for filtering
  const sources = [...new Set(trends.map(trend => trend.source))];
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">
          {sourceFilter ? `${sourceFilter} Trends` : 'All Trends'}
        </h3>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter by Source
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setSourceFilter(null)}>
              All Sources
            </DropdownMenuItem>
            {sources.map(source => (
              <DropdownMenuItem key={source} onClick={() => setSourceFilter(source)}>
                {source}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {filteredTrends.map((trend) => (
        <Card key={trend.id} className="w-full overflow-hidden group">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
                  {trend.title}
                </CardTitle>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{formatDistanceToNow(new Date(trend.addedOn), { addSuffix: true })}</span>
                  <span>•</span>
                  <span>{trend.category}</span>
                </div>
              </div>
              <Badge variant={trend.source === "Reddit" ? "secondary" : "outline"} 
                 className={trend.source === "Reddit" ? "bg-orange-500/10 text-orange-500" : "bg-primary/10"}>
                {trend.source}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            <p className="text-sm mb-3 text-muted-foreground">
              {trend.description}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {trend.platformTags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs"
                onClick={() => handleCreateCampaign(trend)}
              >
                Create Campaign <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CulturalTrendsView;
