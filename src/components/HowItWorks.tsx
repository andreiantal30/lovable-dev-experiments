
import React from 'react';
import { LightbulbIcon, SparklesIcon, Award, Rocket } from 'lucide-react';
import TransitionElement from './TransitionElement';

const HowItWorks = () => {
  return (
    <section className="py-16 bg-gradient-to-b from-gray-950 to-gray-900 text-white">
      <div className="container mx-auto px-4">
        <TransitionElement animation="slide-up">
          <h2 className="text-4xl font-medium text-center mb-6 text-purple-400">How It Works</h2>
        </TransitionElement>
        
        <TransitionElement animation="slide-up" delay={100}>
          <p className="text-lg text-center text-gray-300 mb-16 max-w-3xl mx-auto">
            Create award-worthy campaigns in minutes with our AI-powered creative partner
          </p>
        </TransitionElement>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Step 1 */}
          <TransitionElement animation="slide-up" delay={200}>
            <div className="bg-gray-900/80 p-8 rounded-xl border border-gray-800 hover:border-purple-500/30 transition-all h-full">
              <div className="bg-purple-900/50 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                <LightbulbIcon className="w-7 h-7 text-purple-400" />
              </div>
              <h3 className="text-xl font-medium mb-4">Describe Your Vision</h3>
              <p className="text-gray-400">
                Tell our AI what you want to achieve with your campaign. The more detailed, the better the results.
              </p>
            </div>
          </TransitionElement>
          
          {/* Step 2 */}
          <TransitionElement animation="slide-up" delay={300}>
            <div className="bg-gray-900/80 p-8 rounded-xl border border-gray-800 hover:border-purple-500/30 transition-all h-full">
              <div className="bg-purple-900/50 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                <SparklesIcon className="w-7 h-7 text-purple-400" />
              </div>
              <h3 className="text-xl font-medium mb-4">Get Creative Ideas</h3>
              <p className="text-gray-400">
                Our AI, trained on award-winning campaigns from Cannes Lions, Clio, Golden Drum, and other prestigious advertising festivals, generates unique concepts perfectly tailored to your brief.
              </p>
            </div>
          </TransitionElement>
          
          {/* Step 3 */}
          <TransitionElement animation="slide-up" delay={400}>
            <div className="bg-gray-900/80 p-8 rounded-xl border border-gray-800 hover:border-purple-500/30 transition-all h-full">
              <div className="bg-purple-900/50 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                <Award className="w-7 h-7 text-purple-400" />
              </div>
              <h3 className="text-xl font-medium mb-4">Refine & Perfect</h3>
              <p className="text-gray-400">
                Iterate and refine the generated ideas with our AI until you have the perfect campaign concept.
              </p>
            </div>
          </TransitionElement>
          
          {/* Step 4 */}
          <TransitionElement animation="slide-up" delay={500}>
            <div className="bg-gray-900/80 p-8 rounded-xl border border-gray-800 hover:border-purple-500/30 transition-all h-full">
              <div className="bg-purple-900/50 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                <Rocket className="w-7 h-7 text-purple-400" />
              </div>
              <h3 className="text-xl font-medium mb-4">Launch & Succeed</h3>
              <p className="text-gray-400">
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
