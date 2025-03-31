import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCachedCulturalTrends, CulturalTrend, getCulturalTrends } from '@/lib/generateCulturalTrends';
import { Button } from '@/components/ui/button';
import { Clock, ArrowRight, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { generateCulturalTrends, saveCulturalTrends } from '@/lib/generateCulturalTrends';
import { Headline } from '@/lib/fetchNewsTrends.client';

const updateNewsTrends = async () => {
  try {
    const res = await fetch("/api/news");
    if (!res.ok) throw new Error("Failed to fetch news");

    const newsData = await res.json();
    const articles: Headline[] = newsData.articles;

    console.log("✅ NewsAPI articles:", articles);

    const generatedTrends = await generateCulturalTrends(articles);
    saveCulturalTrends(generatedTrends);
    
    console.log("✅ Generated + saved cultural trends:", generatedTrends);
  } catch (err) {
    console.error("❌ News fetch or trend generation error:", err);
  }
};

const updateNewsTrends = async () => {
  try {
    const res = await fetch("/api/news");
    if (!res.ok) throw new Error("Failed to fetch news");
    const newsData = await res.json();

    console.log("✅ NewsAPI Response:", newsData);

    // Optional: if you have a function like `generateCulturalTrends(newsData.articles)` somewhere, call it here
    // Or save locally for now
    localStorage.setItem("newsArticles", JSON.stringify(newsData.articles));
  } catch (err) {
    console.error("❌ News fetch error:", err);
  }
};

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

  const redditTrends = trends.filter(trend => trend.source === "Reddit").slice(0, 10);
  const newsTrends = trends.filter(trend => trend.source === "NewsAPI").slice(0, 10);

  console.log("Displaying cultural trends:", trends);
  console.log("Reddit trends:", redditTrends.length);
  console.log("NewsAPI trends:", newsTrends.length);

  const renderTrendCard = (trend: CulturalTrend) => (
    <Card key={trend.id} className="w-full overflow-hidden group mb-4">
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
          <Badge variant={trend.source === "Reddit" ? "secondary" : "outline"} className={trend.source === "Reddit" ? "bg-orange-500/10 text-orange-500" : "bg-primary/10"}>
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
          <Button variant="ghost" size="sm" className="text-xs" onClick={() => handleCreateCampaign(trend)}>
            Create Campaign <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Cultural Trends</h3>
        <div className="text-sm text-muted-foreground">
          Showing up to 10 trends from each source
        </div>
      </div>

      <div className="flex gap-4 mb-4">
        <Button size="sm" onClick={updateNewsTrends}>
          Update Trends from NewsAPI
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-md font-medium mb-4 flex items-center gap-2">
            <Badge variant="secondary" className="bg-orange-500/10 text-orange-500">Reddit</Badge>
            <span>Trends</span>
            <span className="text-sm text-muted-foreground ml-2">({redditTrends.length}/10)</span>
          </h4>
          {redditTrends.length === 0 ? (
            <Card className="w-full bg-muted/50 mb-4">
              <CardContent className="flex flex-col items-center justify-center py-6">
                <p className="text-center text-muted-foreground my-2">
                  No Reddit trends available yet. Click "Update Trends from Reddit" to fetch the latest trends.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {redditTrends.map(renderTrendCard)}
            </div>
          )}
        </div>

        <div>
          <h4 className="text-md font-medium mb-4 flex items-center gap-2">
            <Badge variant="outline" className="bg-primary/10">NewsAPI</Badge>
            <span>Trends</span>
            <span className="text-sm text-muted-foreground ml-2">({newsTrends.length}/10)</span>
          </h4>
          {newsTrends.length === 0 ? (
            <Card className="w-full bg-muted/50 mb-4">
              <CardContent className="flex flex-col items-center justify-center py-6">
                <p className="text-center text-muted-foreground my-2">
                  No news trends available yet. Click "Update Trends from NewsAPI" to fetch the latest trends.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {newsTrends.map(renderTrendCard)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CulturalTrendsView;
