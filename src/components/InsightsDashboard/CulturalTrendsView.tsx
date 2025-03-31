import React from 'react';
import {
  Card, CardContent, CardHeader, CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  getCachedCulturalTrends,
  CulturalTrend,
  getCulturalTrends
} from '@/lib/generateCulturalTrends';
import { Button } from '@/components/ui/button';
import { Clock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const CulturalTrendsView: React.FC = () => {
  const cachedTrends = getCachedCulturalTrends();
  const inMemoryTrends = getCulturalTrends();
  const trends = inMemoryTrends.length > 0 ? inMemoryTrends : cachedTrends;

  const navigate = useNavigate();

  const handleCreateCampaign = (trend: CulturalTrend) => {
    navigate('/', {
      state: {
        insightPrompt: `Give me a campaign based on the cultural trend: ${trend.title} - ${trend.description}`
      }
    });
  };

  const redditTrends = trends.filter(t => t.source === "Reddit").slice(0, 10);
  const newsTrends = trends.filter(t => t.source === "NewsAPI").slice(0, 10);

  const renderTrendCard = (trend: CulturalTrend) => (
    <Card key={trend.id} className="mb-4 group">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-semibold group-hover:text-primary">
              {trend.title}
            </CardTitle>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
              <Clock className="w-3 h-3" />
              <span>{formatDistanceToNow(new Date(trend.addedOn), { addSuffix: true })}</span>
              <span>•</span>
              <span>{trend.category}</span>
            </div>
          </div>
          <Badge variant={trend.source === "Reddit" ? "secondary" : "outline"}>
            {trend.source}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm mb-3 text-muted-foreground">{trend.description}</p>
        <div className="flex justify-between items-center">
          <div className="flex flex-wrap gap-2">
            {trend.platformTags.map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
            ))}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={() => handleCreateCampaign(trend)}
          >
            Create Campaign <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Cultural Trends</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-md font-medium mb-4 flex items-center gap-2">
            <Badge variant="secondary">Reddit</Badge> Trends ({redditTrends.length}/10)
          </h4>
          {redditTrends.length === 0 ? <p>No Reddit trends yet</p> : redditTrends.map(renderTrendCard)}
        </div>

        <div>
          <h4 className="text-md font-medium mb-4 flex items-center gap-2">
            <Badge variant="outline">NewsAPI</Badge> Trends ({newsTrends.length}/10)
          </h4>
          {newsTrends.length === 0 ? <p>No news trends yet</p> : newsTrends.map(renderTrendCard)}
        </div>
      </div>
    </div>
  );
};

export default CulturalTrendsView;