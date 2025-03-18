
import { Lightbulb, PencilRuler, Sparkles, Users } from "lucide-react";
import TransitionElement from "./TransitionElement";
import { forwardRef, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface HowItWorksProps extends HTMLAttributes<HTMLDivElement> {
  id?: string;
}

const HowItWorks = forwardRef<HTMLDivElement, HowItWorksProps>(
  ({ className, id, ...props }, ref) => {
    return (
      <section 
        ref={ref}
        id={id}
        className={cn("py-16 w-full max-w-6xl mx-auto", className)} 
        {...props}
      >
        <TransitionElement animation="slide-up">
          <h2 className="text-3xl font-medium text-center mb-10">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass-card p-6 rounded-lg">
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <Lightbulb className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">1. Enter Your Campaign Requirements</h3>
              <p className="text-muted-foreground">
                Provide information about your brand, industry, target audience, and campaign goals.
              </p>
            </div>
            
            <div className="glass-card p-6 rounded-lg">
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">2. Define Your Target Audience</h3>
              <p className="text-muted-foreground">
                Specify who your campaign aims to reach including demographics, interests, and behaviors.
              </p>
            </div>
            
            <div className="glass-card p-6 rounded-lg">
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">3. AI Generates Creative Concepts</h3>
              <p className="text-muted-foreground">
                Our AI analyzes award-winning campaigns and creates tailored concepts based on your inputs.
              </p>
            </div>
            
            <div className="glass-card p-6 rounded-lg">
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <PencilRuler className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">4. Refine and Implement</h3>
              <p className="text-muted-foreground">
                Use our chat feature to refine your campaign or download the results to share with your team.
              </p>
            </div>
          </div>
        </TransitionElement>
      </section>
    );
  }
);

HowItWorks.displayName = "HowItWorks";

export default HowItWorks;
