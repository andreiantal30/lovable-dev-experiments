
import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { analyzeInsightPatterns, getTopAssociations } from '@/lib/insightAnalysis';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import InsightCategoryCard from './InsightCategoryCard';
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Lightbulb, ChevronDown } from "lucide-react";
import { useNavigate } from 'react-router-dom';

const InsightsDashboard: React.FC = () => {
  const navigate = useNavigate();
  // Analyze insight patterns
  const insightPatterns = useMemo(() => analyzeInsightPatterns(), []);
  
  // Prepare data for bar chart
  const chartData = useMemo(() => 
    insightPatterns.map(pattern => ({
      name: pattern.name,
      count: pattern.count
    }))
  , [insightPatterns]);

  const handleInsightCampaignCreate = (insightName: string) => {
    // Navigate to homepage with query parameter for the insight
    navigate('/', { state: { insightPrompt: `Give me a campaign based on the emotional insight: ${insightName}` }});
  };

  return (
    <div className="flex justify-center w-full">
      <div className="w-full max-w-5xl px-4 space-y-6">
        <Card className="w-full">
          <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl font-bold">
                <span role="img" aria-label="brain">🧠</span> Human Insight Patterns
              </CardTitle>
              <CardDescription>
                Analysis of human truths and emotional patterns across all campaigns
              </CardDescription>
            </div>
            
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
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InsightsDashboard;
