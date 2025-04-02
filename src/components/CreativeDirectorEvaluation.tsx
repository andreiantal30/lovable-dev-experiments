// src/components/CreativeDirectorEvaluation.tsx
import React from "react";
import { CampaignEvaluation } from "@/lib/campaign/types";
import { Separator } from "./ui/separator";
import { Award, BadgeCheck } from "lucide-react";

interface EvaluationProps {
  evaluation: CampaignEvaluation;
}

const CreativeDirectorEvaluation: React.FC<EvaluationProps> = ({ evaluation }) => {
  const safeScore = (value: unknown): number => {
    const num = Number(value);
    return isNaN(num) || num < 0 ? 0 : Math.min(num, 10); // Clamp between 0–10
  };

  const renderScore = (label: string, score: unknown) => {
    const numeric = safeScore(score);
    return (
      <div className="mb-3">
        <h4 className="font-medium text-orange-800 dark:text-orange-200">{label}</h4>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-10 text-right">{numeric}/10</div>
          <div className="flex-1 h-2 bg-gray-300 dark:bg-gray-700 rounded">
            <div
              className="h-2 bg-orange-500 rounded"
              style={{ width: `${(numeric / 10) * 100}%` }}
            />
          </div>
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

      <div className="space-y-2 text-sm text-muted-foreground">
        {renderScore("Insight Sharpness", evaluation.insightSharpness)}
        {renderScore("Originality of the Idea", evaluation.ideaOriginality)}
        {renderScore("Execution Potential", evaluation.executionPotential)}
        {renderScore("Award Potential", evaluation.awardPotential)}
      </div>

      <Separator className="my-4" />

      <div className="text-sm italic text-orange-900 dark:text-orange-200 flex items-center">
        <BadgeCheck className="w-4 h-4 mr-2" />
        {evaluation.finalVerdict || "No verdict available."}
      </div>
    </div>
  );
};

export default CreativeDirectorEvaluation;