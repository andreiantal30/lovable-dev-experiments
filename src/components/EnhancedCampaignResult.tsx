import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { GeneratedCampaign } from "@/lib/campaign/types";
import { Lightbulb } from "lucide-react";
import { CampaignFeedback } from "@/components/CampaignResult";
import { Button } from "@/components/ui/button";
import CreativeDirectorFeedback from "./CampaignResult/CreativeDirectorFeedback";

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
  const hasEvaluation = campaign?.evaluation &&
    typeof campaign.evaluation.insightSharpness === 'number' &&
    typeof campaign.evaluation.ideaOriginality === 'number' &&
    typeof campaign.evaluation.executionPotential === 'number' &&
    typeof campaign.evaluation.awardPotential === 'number';

  return (
    <Card className="border shadow-md overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-900/20 border-b">
        <CardTitle className="text-xl font-bold text-center">{campaign.campaignName}</CardTitle>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column */}
          <div className="md:col-span-5 space-y-6 border-r-0 md:border-r border-dashed border-gray-200 dark:border-gray-700 pr-0 md:pr-6">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-primary">The Insight</h3>
              <p className="text-md">{campaign.keyMessage}</p>
            </div>

            <Separator className="my-4" />

            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-primary">The Idea</h3>
              <p className="text-md font-medium">{campaign.campaignName}</p>
            </div>

            {campaign.creativeInsights?.length > 0 && (
              <>
                <Separator className="my-4" />
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-amber-500" />
                    <h3 className="text-lg font-semibold text-primary">Creative Insights</h3>
                  </div>
                  <ul className="list-disc pl-5 space-y-1">
                    {campaign.creativeInsights.map((insight, index) => (
                      <li key={index} className="text-md italic">{insight}</li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            {campaign.emotionalAppeal?.length > 0 && (
              <>
                <Separator className="my-4" />
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-primary">Emotional & Strategic Hooks</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {campaign.emotionalAppeal.map((appeal, index) => (
                      <li key={index} className="text-md">{appeal}</li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            {(campaign.callToAction || campaign.consumerInteraction) && (
              <>
                <Separator className="my-4" />
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-primary">Call to Action</h3>
                  <p className="text-md">{campaign.callToAction || campaign.consumerInteraction}</p>
                </div>
              </>
            )}

            {campaign.prHeadline && (
              <>
                <Separator className="my-4" />
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-primary">PR Headline</h3>
                  <p className="text-md italic text-muted-foreground">{campaign.prHeadline}</p>
                </div>
              </>
            )}
          </div>

          {/* Right Column */}
          <div className="md:col-span-7 space-y-6 pl-0 md:pl-6">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-primary">The How</h3>
              <div className="space-y-4">
                <p className="text-md">Implementation strategy to bring the idea to life:</p>
                <ul className="list-decimal pl-5 space-y-2">
                  {campaign.creativeStrategy.map((strategy, index) => (
                    <li key={index} className="text-md">{strategy}</li>
                  ))}
                </ul>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-primary">Execution Plan</h3>
              <ol className="list-decimal pl-5 space-y-2">
                {campaign.executionPlan.map((execution, index) => (
                  <li key={index} className="text-md">{execution}</li>
                ))}
              </ol>
            </div>

            {campaign.expectedOutcomes?.length > 0 && (
              <>
                <Separator className="my-4" />
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-primary">Expected Outcomes</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    {campaign.expectedOutcomes.map((outcome, index) => (
                      <li key={index} className="text-md">{outcome}</li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            {campaign.referenceCampaigns?.length > 0 && (
              <>
                <Separator className="my-4" />
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-primary">Reference Campaigns</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                    {campaign.referenceCampaigns.map((refCampaign, index) => (
                      <div key={index} className="bg-muted/40 p-3 rounded-lg border border-muted">
                        <h4 className="font-medium text-sm">{refCampaign.name}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          <span className="font-medium">{refCampaign.brand}</span>
                          {refCampaign.year && <> · {refCampaign.year}</>}
                          {refCampaign.industry && <> · {refCampaign.industry}</>}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ✅ Creative Director Feedback */}
        {hasEvaluation && (
          <div className="mt-6">
            <CreativeDirectorFeedback feedback={campaign.evaluation} />
          </div>
        )}

        {onGenerateAnother && (
          <div className="flex justify-center mt-8">
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