
import React from 'react';
import { LightbulbIcon, SparklesIcon, Award, Rocket } from 'lucide-react';
import TransitionElement from './TransitionElement';

const HowItWorks = () => {
  return (
    <section className="mt-24 py-20 bg-gradient-to-b from-blue-50/80 to-white/90 dark:from-gray-900 dark:to-gray-950 w-[100vw] relative left-[50%] right-[50%] mx-[-50vw]">
      <div className="container mx-auto px-4">
        <TransitionElement animation="slide-up">
          <h2 className="text-4xl font-medium text-center mb-6 text-primary">How It Works</h2>
        </TransitionElement>
        
        <TransitionElement animation="slide-up" delay={100}>
          <p className="text-lg text-center text-muted-foreground mb-16 max-w-3xl mx-auto">
            Create award-worthy campaigns in minutes with our AI-powered creative partner
          </p>
        </TransitionElement>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Step 1 */}
          <TransitionElement animation="slide-up" delay={200}>
            <div className="bg-white/80 dark:bg-gray-800/40 backdrop-blur-xl p-8 rounded-xl border border-border dark:border-gray-700 hover:border-primary/30 dark:hover:border-primary/30 transition-all h-full shadow-subtle">
              <div className="bg-primary/10 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                <LightbulbIcon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-4">Describe Your Vision</h3>
              <p className="text-muted-foreground">
                Tell our AI what you want to achieve with your campaign. The more detailed, the better the results.
              </p>
            </div>
          </TransitionElement>
          
          {/* Step 2 */}
          <TransitionElement animation="slide-up" delay={300}>
            <div className="bg-white/80 dark:bg-gray-800/40 backdrop-blur-xl p-8 rounded-xl border border-border dark:border-gray-700 hover:border-primary/30 dark:hover:border-primary/30 transition-all h-full shadow-subtle">
              <div className="bg-primary/10 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                <SparklesIcon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-4">Get Creative Ideas</h3>
              <p className="text-muted-foreground">
                Our AI, trained on award-winning campaigns, generates unique concepts perfectly tailored to your brief.
              </p>
            </div>
          </TransitionElement>
          
          {/* Step 3 */}
          <TransitionElement animation="slide-up" delay={400}>
            <div className="bg-white/80 dark:bg-gray-800/40 backdrop-blur-xl p-8 rounded-xl border border-border dark:border-gray-700 hover:border-primary/30 dark:hover:border-primary/30 transition-all h-full shadow-subtle">
              <div className="bg-primary/10 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                <Award className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-4">Refine & Perfect</h3>
              <p className="text-muted-foreground">
                Iterate and refine the generated ideas with our AI until you have the perfect campaign concept.
              </p>
            </div>
          </TransitionElement>
          
          {/* Step 4 */}
          <TransitionElement animation="slide-up" delay={500}>
            <div className="bg-white/80 dark:bg-gray-800/40 backdrop-blur-xl p-8 rounded-xl border border-border dark:border-gray-700 hover:border-primary/30 dark:hover:border-primary/30 transition-all h-full shadow-subtle">
              <div className="bg-primary/10 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                <Rocket className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-4">Launch & Succeed</h3>
              <p className="text-muted-foreground">
                Take your polished campaign to market with confidence, backed by award-winning creative strategies.
              </p>
            </div>
          </TransitionElement>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
