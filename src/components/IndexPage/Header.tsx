
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

interface HeaderProps {
  apiKey?: string;
  onChangeApiKey?: () => void;
}

const Header: React.FC<HeaderProps> = ({ apiKey, onChangeApiKey }) => {
  return (
    <div className="mb-4 text-center max-w-3xl mx-auto">
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-950 text-blue-200 mb-4">
        <Sparkles className="h-3.5 w-3.5" />
        <span className="text-xs font-medium">INSPIRED BY REAL CANNES LIONS CAMPAIGNS</span>
      </div>
      
      <h1 className="text-4xl font-bold tracking-tight lg:text-5xl mb-3">
        <span className="text-white">Turn Big Ideas into</span>
        <br />
        <span className="text-blue-400">Campaigns Worth Celebrating</span>
      </h1>
      
      <p className="text-base text-gray-300 mb-2 max-w-2xl mx-auto">
        Backed by real Cannes Lions winners, our AI helps you generate creative concepts that 
        blend <span className="font-medium">insight, innovation</span>, and <span className="font-medium">execution</span> — just like the best in the world.
      </p>
      
      <p className="text-gray-400 text-xs mb-4">
        Trained on award-winning campaigns from brands like Spotify, Dove, Netflix, Heinz, and more.
      </p>
      
      {apiKey ? (
        <button 
          onClick={onChangeApiKey} 
          className="text-sm text-primary hover:underline flex items-center justify-center mx-auto"
        >
          Change API Key
        </button>
      ) : null}
    </div>
  );
};

export default Header;
