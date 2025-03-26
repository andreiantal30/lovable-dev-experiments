
import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { analyzeInsightPatterns, getTopAssociations } from '@/lib/insightAnalysis';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import InsightCategoryCard from './InsightCategoryCard';

const InsightsDashboard: React.FC = () => {
  // Analyze insight patterns
  const insightPatterns = useMemo(() => analyzeInsightPatterns(), []);
  
  // Prepare data for bar chart
  const chartData = useMemo(() => 
    insightPatterns.map(pattern => ({
      name: pattern.name,
      count: pattern.count
    }))
  , [insightPatterns]);

  return (
    <div className="flex justify-center w-full">
      <div className="w-full max-w-5xl px-4 space-y-6">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl font-bold">
              <span role="img" aria-label="brain">🧠</span> Human Insight Patterns
            </CardTitle>
            <CardDescription>
              Analysis of human truths and emotional patterns across all campaigns
            </CardDescription>
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
                <InsightCategoryCard key={pattern.name} pattern={pattern} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InsightsDashboard;
