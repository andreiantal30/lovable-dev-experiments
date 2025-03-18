
import React from "react";
import { TrendData } from "@/lib/trendMonitor";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import TransitionElement from "@/components/TransitionElement";

interface TrendingTopicsProps {
  trends: TrendData[];
  isLoading: boolean;
  onSelectTrend?: (trend: TrendData) => void;
  className?: string;
}

const TrendingTopics: React.FC<TrendingTopicsProps> = ({
  trends,
  isLoading,
  onSelectTrend,
  className
}) => {
  if (isLoading) {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="flex items-center gap-2 text-primary mb-3">
          <Sparkles size={16} />
          <h3 className="text-sm font-medium">Loading trending topics...</h3>
        </div>
        <div className="animate-pulse space-y-2">
          {[1, 2, 3].map((i) => (
            <div 
              key={i}
              className="h-16 bg-primary/5 dark:bg-primary/10 rounded-lg"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!trends.length) {
    return null;
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2 text-primary">
        <TrendingUp size={16} />
        <h3 className="text-sm font-medium">Trending Topics to Consider</h3>
      </div>
      
      <div className="grid gap-2">
        {trends.map((trend, index) => (
          <TransitionElement 
            key={trend.id} 
            animation="fade" 
            delay={index * 100}
          >
            <Card 
              className={cn(
                "p-3 hover:shadow-md transition-all border-primary/10",
                "cursor-pointer flex flex-col gap-1.5 bg-background/60 backdrop-blur-sm"
              )}
              onClick={() => onSelectTrend?.(trend)}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground flex items-center gap-1.5">
                  {trend.keyword}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-help">
                          <Info className="h-3.5 w-3.5 text-muted-foreground" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p className="max-w-xs">{trend.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </span>
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-xs",
                    trend.popularity > 85 ? "bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400" : "",
                    trend.popularity > 75 && trend.popularity <= 85 ? "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400" : "",
                    trend.popularity <= 75 ? "bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400" : ""
                  )}
                >
                  {trend.popularity}% popularity
                </Badge>
              </div>
              
              <div className="flex flex-wrap gap-1.5">
                {trend.relatedTags.slice(0, 3).map((tag) => (
                  <Badge 
                    key={tag} 
                    variant="secondary"
                    className="text-xs px-1.5 py-0 h-5 bg-primary/5 text-primary/90 hover:bg-primary/10"
                  >
                    #{tag}
                  </Badge>
                ))}
                {trend.relatedTags.length > 3 && (
                  <span className="text-xs text-muted-foreground">
                    +{trend.relatedTags.length - 3} more
                  </span>
                )}
              </div>
            </Card>
          </TransitionElement>
        ))}
      </div>
    </div>
  );
};

export default TrendingTopics;
