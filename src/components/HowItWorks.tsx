
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
              <h3 className="text-xl font-medium mb-2">1. Describe Your Vision</h3>
              <p className="text-muted-foreground">
                Tell our AI what you want to achieve with your campaign. The more detailed, the better the results.
              </p>
            </div>
            
            <div className="glass-card p-6 rounded-lg">
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">2. Get Creative Ideas</h3>
              <p className="text-muted-foreground">
                Our AI, trained on award-winning campaigns from Cannes Lions, Clio, Golden Drum, and other prestigious advertising festivals, generates unique concepts perfectly tailored to your brief.
              </p>
            </div>
            
            <div className="glass-card p-6 rounded-lg">
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">3. Refine & Perfect</h3>
              <p className="text-muted-foreground">
                Iterate and refine the generated ideas with our AI until you have the perfect campaign concept.
              </p>
            </div>
            
            <div className="glass-card p-6 rounded-lg">
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <PencilRuler className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">4. Launch & Succeed</h3>
              <p className="text-muted-foreground">
                Take your polished campaign to market with confidence, backed by award-winning creative strategies.
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
