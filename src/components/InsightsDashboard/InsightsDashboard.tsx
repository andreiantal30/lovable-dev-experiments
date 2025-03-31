
import React, { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { analyzeInsightPatterns, getTopAssociations } from '@/lib/insightAnalysis';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import InsightCategoryCard from './InsightCategoryCard';
import CulturalTrendsView from './CulturalTrendsView';
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Lightbulb, ChevronDown, RefreshCw, TrendingUp, Globe, MessageCircle, Bug, Server } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { fetchNewsTrends } from '@/lib/fetchNewsTrends.client.ts';
import { fetchNewsFromServer } from '@/lib/fetchNewsFromServer';
import { fetchAndGenerateRedditTrends } from '@/lib/fetchRedditTrends';
import { generateCulturalTrends, saveCulturalTrends, getCulturalTrends, CulturalTrend } from '@/lib/generateCulturalTrends';
import { saveNewsApiKey, getNewsApiKey } from '@/lib/fetchNewsTrends.client.ts';
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ApiKeyDebugger from './ApiKeyDebugger';

const InsightsDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"human-insights" | "cultural-trends">("human-insights");
  const [debugMode, setDebugMode] = useState(false);
  const [isUpdatingTrends, setIsUpdatingTrends] = useState(false);
  const [isUpdatingRedditTrends, setIsUpdatingRedditTrends] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(getNewsApiKey());
  const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false);
  const navigate = useNavigate();
  
  const insightPatterns = useMemo(() => analyzeInsightPatterns(), []);
  const chartData = useMemo(() =>
    insightPatterns
      .filter(pattern => pattern.count > 2)
      .map(pattern => ({
        name: pattern.name,
        count: pattern.count
      }))
  , [insightPatterns]);

  useEffect(() => {
    console.log("Current cultural trends:", getCulturalTrends());
  }, [activeTab]);

  const handleInsightCampaignCreate = (insightName: string) => {
    navigate('/', { state: { insightPrompt: `Give me a campaign based on the emotional insight: ${insightName}` }});
  };

  const handleSaveApiKey = () => {
    if (apiKeyInput.trim()) {
      saveNewsApiKey(apiKeyInput.trim());
      setApiKeyDialogOpen(false);
      
      if (apiKeyInput.trim() === "ca7eb7fe6b614e7095719eb52b15f728") {
        toast.info("Using default NewsAPI key");
      }
    } else {
      toast.error("Please enter a valid API key");
    }
  };

  const handleUpdateTrends = async () => {
    const apiKey = getNewsApiKey();
    
    if (!apiKey) {
      setApiKeyDialogOpen(true);
      return;
    }
    
    setIsUpdatingTrends(true);
    try {
      console.log("📊 Updating trends with NewsAPI...");
      
      try {
        console.log("Attempting to fetch news from server endpoint...");
        // We now get CulturalTrend[] directly from fetchNewsFromServer
        const trends = await fetchNewsFromServer();
        console.log("Fetched trends from server:", trends);
        
        if (trends && trends.length > 0) {
          saveCulturalTrends(trends);
          setActiveTab("cultural-trends");
          toast.success("Cultural trends updated successfully");
          return;
        } else {
          toast.error("No trends were returned from the server");
        }
      } catch (serverError) {
        console.error("Failed to fetch trends:", serverError);
        if (serverError instanceof Error) {
          toast.error(`Failed to update trends: ${serverError.message}`);
        } else {
          toast.error("Failed to update trends from server");
        }
      }
    } catch (error) {
      console.error("Error updating trends:", error);
    } finally {
      setIsUpdatingTrends(false);
    }
  };

  const handleUpdateRedditTrends = async () => {
    setIsUpdatingRedditTrends(true);
    try {
      console.log("📊 Updating trends from Reddit...");
      const redditTrends = await fetchAndGenerateRedditTrends();
      console.log("Generated Reddit trends:", redditTrends);
      
      if (redditTrends && redditTrends.length > 0) {
        saveCulturalTrends(redditTrends);
        setActiveTab("cultural-trends");
        toast.success("Reddit trends updated successfully");
      } else {
        toast.error("No Reddit trends were generated");
      }
    } catch (error) {
      console.error("Error updating Reddit trends:", error);
      toast.error("Failed to update Reddit trends: " + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsUpdatingRedditTrends(false);
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
                onClick={handleUpdateRedditTrends} 
                disabled={isUpdatingRedditTrends}
              >
                <MessageCircle className={`h-4 w-4 ${isUpdatingRedditTrends ? 'animate-spin' : ''}`} />
                Update Trends from Reddit
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
            {debugMode && <ApiKeyDebugger />}
            
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
