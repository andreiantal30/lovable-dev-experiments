
import React from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { InsightCategory, getTopAssociations } from '@/lib/insightAnalysis';
import { Button } from '@/components/ui/button';
import { Lightbulb } from 'lucide-react';

interface InsightCategoryCardProps {
  pattern: InsightCategory;
  onCreateCampaign?: () => void;
}

const InsightCategoryCard: React.FC<InsightCategoryCardProps> = ({ pattern, onCreateCampaign }) => {
  // Get top associations for this category
  const { topIndustries, topAudiences } = getTopAssociations(pattern, 2);

  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <CardContent className="pt-6 flex-grow">
        <h3 className="text-lg font-semibold mb-2">{pattern.name}</h3>
        <p className="text-sm text-muted-foreground mb-3">
          Found in {pattern.count} campaign{pattern.count !== 1 && 's'}
        </p>
        
        {topIndustries.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-medium mb-1 text-muted-foreground">Common Industries:</p>
            <div className="flex flex-wrap gap-1">
              {topIndustries.map((industry, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {industry}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {topAudiences.length > 0 && (
          <div>
            <p className="text-xs font-medium mb-1 text-muted-foreground">Common Audiences:</p>
            <div className="flex flex-wrap gap-1">
              {topAudiences.map((audience, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {audience}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      
      {onCreateCampaign && (
        <CardFooter className="pt-0 pb-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full text-xs gap-1.5 h-8"
            onClick={onCreateCampaign}
          >
            <Lightbulb className="h-3.5 w-3.5" />
            Create Campaign
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default InsightCategoryCard;
