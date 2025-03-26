
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { InsightCategory, getTopAssociations } from '@/lib/insightAnalysis';

interface InsightCategoryCardProps {
  pattern: InsightCategory;
}

const InsightCategoryCard: React.FC<InsightCategoryCardProps> = ({ pattern }) => {
  const { topIndustries, topAudiences } = getTopAssociations(pattern, 3);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium flex justify-between items-center">
          {pattern.name}
          <Badge variant="outline" className="ml-2">
            {pattern.count} campaigns
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm">
        {topIndustries.length > 0 && (
          <div className="mb-2">
            <span className="font-medium text-muted-foreground">Common in: </span>
            {topIndustries.map((industry, i) => (
              <React.Fragment key={industry}>
                <span>{industry}</span>
                {i < topIndustries.length - 1 && <span>, </span>}
              </React.Fragment>
            ))}
          </div>
        )}
        
        {topAudiences.length > 0 && (
          <div>
            <span className="font-medium text-muted-foreground">Audiences: </span>
            {topAudiences.map((audience, i) => (
              <React.Fragment key={audience}>
                <span>{audience}</span>
                {i < topAudiences.length - 1 && <span>, </span>}
              </React.Fragment>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InsightCategoryCard;
