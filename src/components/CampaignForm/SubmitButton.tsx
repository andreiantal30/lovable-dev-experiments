
import React from "react";
import { Button } from "@/components/ui/button";
import TransitionElement from "@/components/TransitionElement";

interface SubmitButtonProps {
  isGenerating: boolean;
  delay?: number;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({ 
  isGenerating,
  delay = 600
}) => {
  return (
    <div className="mt-20 flex justify-center">
      <TransitionElement delay={delay} animation="slide-up">
        <Button 
          type="submit" 
          disabled={isGenerating}
          className="w-full md:w-auto px-12 py-6 h-auto text-lg font-medium rounded-xl shadow-subtle hover:shadow-md transition-all duration-300 bg-primary text-primary-foreground"
        >
          {isGenerating ? "Generating Campaign..." : "Generate Campaign Idea"}
        </Button>
      </TransitionElement>
    </div>
  );
};

export default SubmitButton;
