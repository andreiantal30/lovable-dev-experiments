import React from "react";
import { CampaignEvaluation } from "@/lib/campaign/types";
import { Separator } from "../ui/separator";
import { Award, BadgeCheck } from "lucide-react";

interface Props {
  feedback: CampaignEvaluation;
}

const CreativeDirectorFeedback: React.FC<Props> = ({ feedback }) => {
  const renderScore = (label: string, score: number | undefined) => {
    const clamped = typeof score === "number" ? Math.max(0, Math.min(10, score)) : 0;

    return (
      <div className="flex items-center justify-between gap-4">
        <span className="text-md font-medium text-foreground">{label}</span>
        <div className="flex-1 h-2 bg-muted rounded overflow-hidden">
          <div
            className="h-2 bg-red-500"
            style={{ width: `${clamped * 10}%` }}
          />
        </div>
        <span className="text-sm text-muted-foreground pl-2">{clamped}/10</span>
      </div>
    );
  };

  return (
    <div className="mt-8 border border-orange-700 rounded-md bg-orange-950/10 p-4">
      <div className="flex items-center mb-4 text-orange-300 font-semibold text-lg">
        <Award className="w-5 h-5 mr-2" />
        Creative Director Feedback
      </div>

      <div className="space-y-3 text-sm">
        {renderScore("Insight Sharpness", feedback.insightSharpness)}
        {renderScore("Originality of the Idea", feedback.ideaOriginality)}
        {renderScore("Execution Potential", feedback.executionPotential)}
        {renderScore("Award Potential", feedback.awardPotential)}
      </div>

      <Separator className="my-4" />

      {feedback.finalVerdict && (
        <div className="bg-orange-900/20 rounded p-3 text-sm italic text-orange-200 flex items-start gap-2">
          <BadgeCheck className="w-4 h-4 mt-0.5 text-orange-300" />
          <span>{feedback.finalVerdict}</span>
        </div>
      )}
    </div>
  );
};

export default CreativeDirectorFeedback;