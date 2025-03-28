import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { analyzeInsightPatterns, getTopAssociations } from '@/lib/insightAnalysis';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import InsightCategoryCard from './InsightCategoryCard';
import CulturalTrendsView from './CulturalTrendsView';
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Lightbulb, ChevronDown, RefreshCw, TrendingUp, Globe, MessageCircle, Bug } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { fetchNewsTrends } from '@/lib/fetchNewsTrends.client.ts';
import { fetchAndGenerateRedditTrends } from '@/lib/fetchRedditTrends';
import { generateCulturalTrends, saveCulturalTrends } from '@/lib/generateCulturalTrends';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveNewsApiKey, getNewsApiKey } from '@/lib/fetchNewsTrends.client.ts';
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ApiKeyDebugger from './ApiKeyDebugger';

const InsightsDashboard: React.FC = () => {
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
      const headlines = await fetchNewsTrends();
      console.log("Fetched headlines:", headlines);
      
      const trends = await generateCulturalTrends(headlines);
      console.log("Generated trends:", trends);
      
      saveCulturalTrends(trends);
      
      setActiveTab("cultural-trends");
      
      toast.success("Cultural trends updated successfully");
    } catch (error) {
      console.error("Error updating trends:", error);
      toast.error("Failed to update trends: " + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsUpdatingTrends(false);
    }
  };

  const handleUpdateRedditTrends = async () => {
    setIsUpdatingRedditTrends(true);
    try {
      const trends = await fetchAndGenerateRedditTrends();
      console.log("Generated Reddit trends:", trends);
      
      saveCulturalTrends(trends);
      
      setActiveTab("cultural-trends");
      
      toast.success("Reddit trends updated successfully");
    } catch (error) {
      console.error("Error updating Reddit trends:", error);
      toast.error("Failed to update Reddit trends");
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
                onClick={handleUpdateTrends} 
                disabled={isUpdatingTrends}
              >
                <Globe className={`h-4 w-4 ${isUpdatingTrends ? 'animate-spin' : ''}`} />
                Update Trends from NewsAPI
              </Button>
              
              <Button 
                variant="outline" 
                className="gap-2" 
                onClick={() => setApiKeyDialogOpen(true)}
              >
                🔑 Set NewsAPI Key
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setDebugMode(!debugMode)}
                title="Debug Mode"
              >
                <Bug className="h-4 w-4" />
              </Button>
              
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
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
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
        
        <Dialog open={apiKeyDialogOpen} onOpenChange={setApiKeyDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>NewsAPI API Key</DialogTitle>
              <DialogDescription>
                Enter your NewsAPI API key to fetch the latest news trends
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="apiKey" className="text-right">
                  API Key
                </Label>
                <Input
                  id="apiKey"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="Enter your NewsAPI API key"
                  className="col-span-3"
                />
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                Default key: ca7eb7fe6b614e7095719eb52b15f728
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setApiKeyDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveApiKey}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default InsightsDashboard;
