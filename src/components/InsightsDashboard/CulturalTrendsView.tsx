
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCachedCulturalTrends, CulturalTrend } from '@/data/culturalTrends';
import { Button } from '@/components/ui/button';
import { Clock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const CulturalTrendsView: React.FC = () => {
  const trends = getCachedCulturalTrends();
  const navigate = useNavigate();
  
  const handleCreateCampaign = (trend: CulturalTrend) => {
    navigate('/', { 
      state: { 
        insightPrompt: `Give me a campaign based on the cultural trend: ${trend.title} - ${trend.description}`
      }
    });
  };
  
  if (trends.length === 0) {
    return (
      <Card className="w-full bg-muted/50">
        <CardContent className="flex flex-col items-center justify-center py-10">
          <p className="text-center text-muted-foreground mb-4">
            No cultural trends available yet. Click "Update Trends from NewsAPI" to fetch the latest trends.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-4">
      {trends.map((trend) => (
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
              <Badge variant="outline" className="bg-primary/10">
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
