
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
        <span className="text-white">Your next big idea?</span>
        <br />
        <span className="text-blue-400">Trained on the world's best.</span>
      </h1>
      
      <p className="text-base text-gray-300 mb-2 max-w-2xl mx-auto">
        WriteAway is your AI creative partner—built on hundreds of awarded campaigns from Cannes, D&AD, and more. 
        It helps you crack the brief, sharpen your angle, and generate fresh campaign ideas… fast.
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
