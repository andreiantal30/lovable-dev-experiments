
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

interface HeaderProps {
  apiKey?: string;
  onChangeApiKey?: () => void;
}

const Header: React.FC<HeaderProps> = ({ apiKey, onChangeApiKey }) => {
  return (
    <div className="mb-8 text-center max-w-4xl mx-auto">
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-950 text-blue-200 mb-6">
        <Sparkles className="h-4 w-4" />
        <span className="text-sm font-medium">INSPIRED BY REAL CANNES LIONS CAMPAIGNS</span>
      </div>
      
      <h1 className="text-5xl font-extrabold tracking-tight lg:text-7xl mb-6">
        <span className="text-white">Turn Big Ideas into</span>
        <br />
        <span className="text-blue-400">Campaigns Worth Celebrating</span>
      </h1>
      
      <p className="text-xl text-gray-300 mb-4 max-w-3xl mx-auto">
        Backed by real Cannes Lions winners, our AI helps you generate creative concepts that 
        blend <span className="font-medium">insight, innovation</span>, and <span className="font-medium">execution</span> — just like the best in the world.
      </p>
      
      <p className="text-gray-400 text-sm mb-6">
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
