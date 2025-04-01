
import React, { useState } from 'react';
import { Check, Sparkles, Zap, Crown } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import TransitionElement from './TransitionElement';

const Plans = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const yearlyDiscount = 0.2; // 20% discount for yearly billing

  const getPriceWithDiscount = (basePrice: number) => {
    if (billingCycle === 'yearly') {
      return Math.round(basePrice * (1 - yearlyDiscount));
    }
    return basePrice;
  };

  return (
    <section className="mt-24 py-20 bg-gradient-to-b from-blue-50/80 to-white/90 dark:from-gray-900 dark:to-gray-950 w-[100vw] relative left-[50%] right-[50%] mx-[-50vw]">
      <div className="container mx-auto px-4">
        <TransitionElement animation="slide-up">
          <h2 className="text-4xl font-medium text-center mb-6 text-primary">Choose Your Plan</h2>
        </TransitionElement>
        
        <TransitionElement animation="slide-up" delay={100}>
          <p className="text-lg text-center text-muted-foreground mb-10 max-w-3xl mx-auto">
            Unlock your creative potential with our flexible pricing plans
          </p>
        </TransitionElement>
        
        {/* Billing toggle */}
        <TransitionElement animation="slide-up" delay={150}>
          <div className="flex justify-center mb-16">
            <div className="bg-white/80 dark:bg-gray-800/40 backdrop-blur-xl rounded-full p-1 inline-flex">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                  billingCycle === 'monthly' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  billingCycle === 'yearly' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Yearly
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  billingCycle === 'yearly' 
                    ? 'bg-white/20' 
                    : 'bg-primary/10 text-primary'
                }`}>
                  Save 20%
                </span>
              </button>
            </div>
          </div>
        </TransitionElement>
        
        {/* Pricing cards with Coming Soon overlay */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto relative">
          {/* Coming Soon Overlay */}
          <div className="absolute inset-0 backdrop-blur-sm bg-white/30 dark:bg-gray-900/30 z-10 flex flex-col items-center justify-center rounded-xl">
            <TransitionElement animation="fade" delay={500}>
              <div className="bg-primary/90 dark:bg-primary/80 text-primary-foreground px-8 py-6 rounded-xl shadow-lg">
                <h3 className="text-2xl font-semibold mb-3 text-white">Coming Soon</h3>
                <p className="text-white dark:text-white">
                  Subscription plans will be available shortly. Enjoy the free version for now.
                </p>
              </div>
            </TransitionElement>
          </div>
          
          {/* Starter Plan */}
          <TransitionElement animation="slide-up" delay={200}>
            <div className="bg-white/80 dark:bg-gray-800/40 backdrop-blur-xl p-8 rounded-xl border border-border dark:border-gray-700 hover:border-primary/30 dark:hover:border-primary/30 transition-all h-full shadow-subtle flex flex-col">
              <div className="mb-6 flex items-center">
                <div className="bg-primary/10 w-10 h-10 rounded-full flex items-center justify-center mr-3">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-xl font-medium">Starter</h3>
              </div>
              
              <div className="mb-6">
                <div className="flex items-end">
                  <span className="text-4xl font-medium">${getPriceWithDiscount(20)}</span>
                  <span className="text-muted-foreground ml-1 mb-1">/ month</span>
                </div>
                <p className="text-muted-foreground mt-2">
                  Perfect for getting started with AI-powered campaign creation.
                </p>
              </div>
              
              <Button variant="outline" className="mb-8 w-full">
                Get Started
              </Button>
              
              <div className="space-y-4 mt-auto">
                <div className="flex items-start">
                  <Check className="w-5 h-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                  <span>25,000 tokens per month</span>
                </div>
                <div className="flex items-start">
                  <Check className="w-5 h-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                  <span>Basic campaign templates</span>
                </div>
                <div className="flex items-start">
                  <Check className="w-5 h-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                  <span>Email support</span>
                </div>
                <div className="flex items-start">
                  <Check className="w-5 h-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                  <span>Campaign history</span>
                </div>
                <div className="flex items-start">
                  <Check className="w-5 h-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                  <span>Token usage analytics</span>
                </div>
              </div>
            </div>
          </TransitionElement>
          
          {/* Pro Plan */}
          <TransitionElement animation="slide-up" delay={300}>
            <div className="bg-white/80 dark:bg-gray-800/40 backdrop-blur-xl p-8 rounded-xl border border-primary/50 dark:border-primary/50 hover:border-primary dark:hover:border-primary transition-all h-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgba(120,120,255,0.07)] flex flex-col relative">
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-white">
                Most Popular
              </Badge>
              
              <div className="mb-6 flex items-center">
                <div className="bg-primary/20 w-10 h-10 rounded-full flex items-center justify-center mr-3">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-xl font-medium">Pro</h3>
              </div>
              
              <div className="mb-6">
                <div className="flex items-end">
                  <span className="text-4xl font-medium">${getPriceWithDiscount(50)}</span>
                  <span className="text-muted-foreground ml-1 mb-1">/ month</span>
                </div>
                <p className="text-muted-foreground mt-2">
                  Ideal for professionals who need more creative power.
                </p>
              </div>
              
              <Button className="mb-8 w-full">
                Get Started
              </Button>
              
              <div className="space-y-4 mt-auto">
                <div className="flex items-start">
                  <Check className="w-5 h-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                  <span>75,000 tokens per month</span>
                </div>
                <div className="flex items-start">
                  <Check className="w-5 h-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                  <span>Advanced campaign templates</span>
                </div>
                <div className="flex items-start">
                  <Check className="w-5 h-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                  <span>Priority support</span>
                </div>
                <div className="flex items-start">
                  <Check className="w-5 h-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                  <span>Campaign analytics</span>
                </div>
                <div className="flex items-start">
                  <Check className="w-5 h-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                  <span>Custom branding</span>
                </div>
                <div className="flex items-start">
                  <Check className="w-5 h-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                  <span>Team collaboration</span>
                </div>
              </div>
            </div>
          </TransitionElement>
          
          {/* Enterprise Plan */}
          <TransitionElement animation="slide-up" delay={400}>
            <div className="bg-white/80 dark:bg-gray-800/40 backdrop-blur-xl p-8 rounded-xl border border-border dark:border-gray-700 hover:border-primary/30 dark:hover:border-primary/30 transition-all h-full shadow-subtle flex flex-col">
              <div className="mb-6 flex items-center">
                <div className="bg-primary/10 w-10 h-10 rounded-full flex items-center justify-center mr-3">
                  <Crown className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-xl font-medium">Enterprise</h3>
              </div>
              
              <div className="mb-6">
                <div className="flex items-end">
                  <span className="text-4xl font-medium">${getPriceWithDiscount(100)}</span>
                  <span className="text-muted-foreground ml-1 mb-1">/ month</span>
                </div>
                <p className="text-muted-foreground mt-2">
                  For teams that need unlimited creative potential.
                </p>
              </div>
              
              <Button variant="outline" className="mb-8 w-full">
                Get Started
              </Button>
              
              <div className="space-y-4 mt-auto">
                <div className="flex items-start">
                  <Check className="w-5 h-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                  <span>Unlimited tokens</span>
                </div>
                <div className="flex items-start">
                  <Check className="w-5 h-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                  <span>Custom AI training</span>
                </div>
                <div className="flex items-start">
                  <Check className="w-5 h-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                  <span>Dedicated support</span>
                </div>
                <div className="flex items-start">
                  <Check className="w-5 h-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                  <span>Team collaboration</span>
                </div>
                <div className="flex items-start">
                  <Check className="w-5 h-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                  <span>API access</span>
                </div>
                <div className="flex items-start">
                  <Check className="w-5 h-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                  <span>Advanced analytics</span>
                </div>
                <div className="flex items-start">
                  <Check className="w-5 h-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                  <span>Custom integrations</span>
                </div>
              </div>
            </div>
          </TransitionElement>
        </div>
      </div>
    </section>
  );
};

export default Plans;
