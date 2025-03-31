import React, { useMemo, useState, useEffect } from 'react';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from "@/components/ui/card";
import { analyzeInsightPatterns } from '@/lib/insightAnalysis';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import InsightCategoryCard from './InsightCategoryCard';
import CulturalTrendsView from './CulturalTrendsView';
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Lightbulb, ChevronDown, TrendingUp, MessageCircle, Server } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { fetchNewsFromServer } from '@/lib/fetchNewsFromServer';
import { fetchAndGenerateRedditTrends } from '@/lib/fetchRedditTrends';
import { saveCulturalTrends, getCulturalTrends } from '@/lib/generateCulturalTrends';
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const InsightsDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"human-insights" | "cultural-trends">("human-insights");
  const [isUpdatingTrends, setIsUpdatingTrends] = useState(false);
  const navigate = useNavigate();

  const insightPatterns = useMemo(() => analyzeInsightPatterns(), []);
  const chartData = useMemo(() =>
    insightPatterns
      .filter(pattern => pattern.count > 2)
      .map(pattern => ({ name: pattern.name, count: pattern.count }))
  , [insightPatterns]);

  // Automatically load both trend types on initial mount
  useEffect(() => {
    const fetchAllTrends = async () => {
      if (getCulturalTrends().length === 0) {
        await handleUpdateAllTrends();
      }
    };
    fetchAllTrends();
  }, []);

  const handleInsightCampaignCreate = (insightName: string) => {
    navigate('/', {
      state: {
        insightPrompt: `Give me a campaign based on the emotional insight: ${insightName}`
      }
    });
  };

  const handleUpdateAllTrends = async () => {
    setIsUpdatingTrends(true);
    try {
      const [newsTrends, redditTrends] = await Promise.all([
        fetchNewsFromServer(),
        fetchAndGenerateRedditTrends()
      ]);

      if (newsTrends?.length > 0) {
        saveCulturalTrends(newsTrends);
      }

      if (redditTrends?.length > 0) {
        saveCulturalTrends(redditTrends);
      }

      toast.success("Trends refreshed successfully");
      setActiveTab("cultural-trends");
    } catch (error) {
      console.error("❌ Error updating trends:", error);
      toast.error("Failed to refresh one or more trend sources.");
    } finally {
      setIsUpdatingTrends(false);
    }
  };

  return (
    <div className="flex justify-center w-full">
      <div className="w-full max-w-5xl px-4 space-y-6">
        <Card className="w-full">
          <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl font-bold">
                <span role="img" aria-label="brain">🧠</span> Insight Dashboard
              </CardTitle>
              <CardDescription>
                Analysis of human truths, emotional patterns, and cultural trends
              </CardDescription>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                className="gap-2"
                onClick={handleUpdateAllTrends}
                disabled={isUpdatingTrends}
              >
                <Server className={`h-4 w-4 ${isUpdatingTrends ? 'animate-spin' : ''}`} />
                Refresh All Trends
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Lightbulb className="h-4 w-4" />
                    Create Insight Campaign
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-popover">
                  {insightPatterns.map((pattern) => (
                    <DropdownMenuItem
                      key={pattern.name}
                      onClick={() => handleInsightCampaignCreate(pattern.name)}
                      className="cursor-pointer"
                    >
                      {pattern.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>

          <CardContent>
            <Tabs
              value={activeTab}
              onValueChange={(value: "human-insights" | "cultural-trends") => setActiveTab(value)}
              className="mb-6"
            >
              <TabsList>
                <TabsTrigger value="human-insights" className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Human Insights
                </TabsTrigger>
                <TabsTrigger value="cultural-trends" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Cultural Trends
                </TabsTrigger>
              </TabsList>

              <TabsContent value="human-insights" className="pt-4">
                <div className="h-64 w-full mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={70} />
                      <YAxis label={{ value: 'Campaigns', angle: -90, position: 'insideLeft' }} />
                      <Tooltip formatter={(value) => [`${value} campaigns`, 'Count']} />
                      <Bar dataKey="count" fill="#8884d8" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                  {insightPatterns.slice(0, 4).map((pattern) => (
                    <InsightCategoryCard
                      key={pattern.name}
                      pattern={pattern}
                      onCreateCampaign={() => handleInsightCampaignCreate(pattern.name)}
                    />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="cultural-trends" className="pt-4">
                <CulturalTrendsView />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InsightsDashboard;