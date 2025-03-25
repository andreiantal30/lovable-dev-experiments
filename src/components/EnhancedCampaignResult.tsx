
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { GeneratedCampaign } from "@/lib/generateCampaign";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Award, CheckCircle, Lightbulb } from "lucide-react";
import { CampaignFeedback } from "@/components/CampaignResult";
import { Button } from "@/components/ui/button";

export interface EnhancedCampaignResultProps {
  campaign: GeneratedCampaign;
  onGenerateAnother?: () => void;
  showFeedbackForm?: boolean;
  onRefine?: (feedback: CampaignFeedback) => Promise<void>;
}

const EnhancedCampaignResult: React.FC<EnhancedCampaignResultProps> = ({ 
  campaign,
  onGenerateAnother,
  showFeedbackForm = false,
  onRefine 
}) => {
  return (
    <Card className="border shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold">Campaign Details</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Campaign Name</h3>
          <p className="text-md">{campaign.campaignName}</p>
        </div>
        
        <Separator />
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Key Message</h3>
          <p className="text-md">{campaign.keyMessage}</p>
        </div>
        
        {/* Display Creative Insights if available */}
        {campaign.creativeInsights && campaign.creativeInsights.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2 bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-amber-500" />
                <h3 className="text-lg font-semibold">Creative Insights</h3>
              </div>
              <ul className="list-disc pl-5 space-y-1">
                {campaign.creativeInsights.map((insight, index) => (
                  <li key={index} className="text-md italic">{insight}</li>
                ))}
              </ul>
            </div>
          </>
        )}
        
        <Separator />
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Creative Strategy</h3>
          <ul className="list-disc pl-5 space-y-1">
            {campaign.creativeStrategy.map((strategy, index) => (
              <li key={index} className="text-md">{strategy}</li>
            ))}
          </ul>
        </div>
        
        <Separator />
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Execution Plan</h3>
          <ul className="list-disc pl-5 space-y-1">
            {campaign.executionPlan.map((execution, index) => (
              <li key={index} className="text-md">{execution}</li>
            ))}
          </ul>
        </div>
        
        {campaign.expectedOutcomes && campaign.expectedOutcomes.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Expected Outcomes</h3>
              <ul className="list-disc pl-5 space-y-1">
                {campaign.expectedOutcomes.map((outcome, index) => (
                  <li key={index} className="text-md">{outcome}</li>
                ))}
              </ul>
            </div>
          </>
        )}
        
        {campaign.viralHook && (
          <>
            <Separator />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Viral Hook</h3>
              <p className="text-md">{campaign.viralHook}</p>
            </div>
          </>
        )}
        
        {campaign.viralElement && (
          <>
            <Separator />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Viral Element</h3>
              <p className="text-md">{campaign.viralElement}</p>
            </div>
          </>
        )}
        
        {campaign.consumerInteraction && (
          <>
            <Separator />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Consumer Interaction</h3>
              <p className="text-md">{campaign.consumerInteraction}</p>
            </div>
          </>
        )}
        
        {campaign.callToAction && (
          <>
            <Separator />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Call to Action</h3>
              <p className="text-md">{campaign.callToAction}</p>
            </div>
          </>
        )}
        
        {campaign.emotionalAppeal && campaign.emotionalAppeal.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Emotional Appeal</h3>
              <ul className="list-disc pl-5 space-y-1">
                {campaign.emotionalAppeal.map((appeal, index) => (
                  <li key={index} className="text-md">{appeal}</li>
                ))}
              </ul>
            </div>
          </>
        )}
        
        {campaign.referenceCampaigns && campaign.referenceCampaigns.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Reference Campaigns</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {campaign.referenceCampaigns.map((refCampaign, index) => (
                  <div key={index} className="bg-muted/40 p-4 rounded-lg">
                    <h4 className="font-medium">{refCampaign.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">{refCampaign.brand}</span>
                      {refCampaign.year && (
                        <> · {refCampaign.year}</>
                      )}
                      {refCampaign.industry && (
                        <> · {refCampaign.industry}</>
                      )}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
        
        {campaign.evaluation && (
          <>
            <Separator />
            <div className="space-y-2 bg-muted/50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-amber-500" />
                <h3 className="text-lg font-semibold">Expert Evaluation</h3>
              </div>
              <p className="text-md whitespace-pre-line">{campaign.evaluation}</p>
            </div>
          </>
        )}
        
        {onGenerateAnother && (
          <div className="flex justify-center mt-4">
            <Button onClick={onGenerateAnother} variant="outline">
              Generate Another Campaign
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedCampaignResult;
