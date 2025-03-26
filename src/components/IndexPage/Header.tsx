
import { Sparkles } from "lucide-react";
import TransitionElement from "@/components/TransitionElement";

interface HeaderProps {
  apiKey: string | null;
  onChangeApiKey: () => void;
}

const Header = ({ apiKey, onChangeApiKey }: HeaderProps) => {
  return (
    <header className="text-center mb-12 md:mb-16 relative py-20">
      <div className="max-w-5xl mx-auto">
        <TransitionElement animation="slide-down">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs uppercase font-semibold bg-blue-900/70 text-blue-300 mb-4">
            <Sparkles size={14} />
            <span>🏷️ Inspired by Real Cannes Lions Campaigns</span>
          </div>
        </TransitionElement>
        
        <TransitionElement animation="slide-down" delay={100}>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight mb-4 text-white">
            Turn Big Ideas into <br className="hidden md:block" />
            <span className="text-blue-400 font-bold">Campaigns Worth Celebrating</span>
          </h1>
        </TransitionElement>
        
        <TransitionElement animation="slide-down" delay={200}>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-4">
            Backed by real Cannes Lions winners, our AI helps you generate creative concepts that blend 
            <span className="font-medium text-white"> insight</span>, 
            <span className="font-medium text-white"> innovation</span>, and
            <span className="font-medium text-white"> execution</span> — just like the best in the world.
          </p>
        </TransitionElement>

        <TransitionElement animation="slide-down" delay={250}>
          <p className="text-sm text-gray-500 mt-4">
            Trained on award-winning campaigns from brands like Spotify, Dove, Netflix, Heinz, and more.
          </p>
        </TransitionElement>
      </div>
    </header>
  );
};

export default Header;
