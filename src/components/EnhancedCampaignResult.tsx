
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { GeneratedCampaign } from "@/lib/generateCampaign";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Award, CheckCircle } from "lucide-react";

interface EnhancedCampaignResultProps {
  campaign: GeneratedCampaign;
}

const EnhancedCampaignResult: React.FC<EnhancedCampaignResultProps> = ({ campaign }) => {
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
        
        {campaign.viralHook && (
          <>
            <Separator />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Viral Hook</h3>
              <p className="text-md">{campaign.viralHook}</p>
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
        
        {campaign.viralElement && (
          <>
            <Separator />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Viral Element</h3>
              <p className="text-md">{campaign.viralElement}</p>
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
      </CardContent>
    </Card>
  );
};

export default EnhancedCampaignResult;
