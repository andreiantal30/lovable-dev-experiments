
import { Link } from 'react-router-dom';
import { BarChart2 } from 'lucide-react';

interface HeaderProps {
  apiKey?: string;
  onChangeApiKey?: () => void;
}

const Header: React.FC<HeaderProps> = ({ apiKey, onChangeApiKey }) => {
  return (
    <div className="mb-8">
      <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-2">
        Campaign Generator
      </h1>
      <p className="text-muted-foreground mb-4">
        Create high-quality ad campaigns powered by AI.
      </p>
      {apiKey ? (
        <button 
          onClick={onChangeApiKey} 
          className="text-sm text-primary hover:underline flex items-center"
        >
          Change API Key
        </button>
      ) : null}
    </div>
  );
};

export default Header;
