
import { Database, Sparkles } from "lucide-react";
import TransitionElement from "@/components/TransitionElement";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  apiKey: string | null;
  onChangeApiKey: () => void;
}

const Header = ({ apiKey, onChangeApiKey }: HeaderProps) => {
  return (
    <header className="text-center mb-12 md:mb-16 relative">
      <div className="absolute right-0 top-0">
        <Link 
          to="/campaign-manager" 
          className="inline-block"
        >
          <Button variant="outline" size="sm" className="w-full flex items-center gap-2">
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">Manage Campaign Database</span>
            <span className="sm:hidden">Database</span>
          </Button>
        </Link>
      </div>
      
      <TransitionElement animation="slide-down">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm font-medium mb-4">
          <Sparkles size={16} />
          <span>AI-Powered Creative Campaign Generator</span>
        </div>
      </TransitionElement>
      
      <TransitionElement animation="slide-down" delay={100}>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight mb-4">
          Transform Ideas into <br className="hidden md:block" />
          <span className="text-primary">Award-Winning Campaigns</span>
        </h1>
      </TransitionElement>
      
      <TransitionElement animation="slide-down" delay={200}>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
          Leverage OpenAI's GPT to generate creative campaign concepts inspired by  
          previous award-winning advertising campaigns.
        </p>
      </TransitionElement>

      {apiKey && (
        <TransitionElement animation="slide-down" delay={250}>
          <div className="mt-2 flex justify-center">
            <button
              onClick={onChangeApiKey}
              className="text-sm text-primary hover:text-primary/80 underline underline-offset-2"
            >
              Change OpenAI API key
            </button>
          </div>
        </TransitionElement>
      )}
    </header>
  );
};

export default Header;
