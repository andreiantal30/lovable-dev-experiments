// src/components/CreativeDirectorEvaluation.tsx
import React from "react";
import { CampaignEvaluation } from "@/lib/campaign/types";
import { Separator } from "./ui/separator";
import { Award, BadgeCheck } from "lucide-react";

interface EvaluationProps {
  evaluation: CampaignEvaluation;
}

const CreativeDirectorEvaluation: React.FC<EvaluationProps> = ({ evaluation }) => {
  const renderScore = (score: number) => {
    return (
      <div className="flex items-center gap-2 text-sm">
        <div className="w-24">{score}/10</div>
        <div className="flex-1 h-2 bg-gray-300 dark:bg-gray-700 rounded">
          <div
            className="h-2 bg-orange-500 rounded"
            style={{ width: `${(score / 10) * 100}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 bg-orange-50 dark:bg-orange-950/10 rounded-md border border-orange-200 dark:border-orange-700">
      <div className="flex items-center mb-3 text-orange-900 dark:text-orange-300 font-semibold">
        <Award className="w-4 h-4 mr-2" />
        Creative Director Feedback
      </div>

      <div className="space-y-4 text-sm text-muted-foreground">
        <div>
          <h4 className="font-medium text-orange-800 dark:text-orange-200">Insight Sharpness</h4>
          {renderScore(evaluation.insightSharpness)}
        </div>
        <div>
          <h4 className="font-medium text-orange-800 dark:text-orange-200">Originality of the Idea</h4>
          {renderScore(evaluation.ideaOriginality)}
        </div>
        <div>
          <h4 className="font-medium text-orange-800 dark:text-orange-200">Execution Potential</h4>
          {renderScore(evaluation.executionPotential)}
        </div>
        <div>
          <h4 className="font-medium text-orange-800 dark:text-orange-200">Award Potential</h4>
          {renderScore(evaluation.awardPotential)}
        </div>
      </div>

      <Separator className="my-4" />

      <div className="text-sm italic text-orange-900 dark:text-orange-200 flex items-center">
        <BadgeCheck className="w-4 h-4 mr-2" />
        {evaluation.finalVerdict}
      </div>
    </div>
  );
};

export default CreativeDirectorEvaluation;