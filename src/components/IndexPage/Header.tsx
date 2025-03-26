
import { Sparkles } from "lucide-react";
import TransitionElement from "@/components/TransitionElement";

interface HeaderProps {
  apiKey: string | null;
  onChangeApiKey: () => void;
}

const Header = ({ apiKey, onChangeApiKey }: HeaderProps) => {
  return (
    <header className="text-center mb-12 md:mb-16 relative">
      <TransitionElement animation="slide-down">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm font-medium mb-4">
          <Sparkles size={16} />
          <span>AI-Powered Creative Campaign Generator</span>
        </div>
      </TransitionElement>
      
      <TransitionElement animation="slide-down" delay={100}>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight mb-4">
          Turn Ideas into <br className="hidden md:block" />
          <span className="text-primary">Award-Winning Campaigns</span>
        </h1>
      </TransitionElement>
      
      <TransitionElement animation="slide-down" delay={200}>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
          Leverage OpenAI's GPT to craft innovative campaigns, inspired by the best-performing, award-winning advertising concepts from Cannes Lions and beyond.
        </p>
      </TransitionElement>
    </header>
  );
};

export default Header;
