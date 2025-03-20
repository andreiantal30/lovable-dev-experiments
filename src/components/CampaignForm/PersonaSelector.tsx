
import React from "react";
import { Persona, personas } from "@/types/persona";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Shield, Zap, TrendingUp, BookOpen, BarChart2 } from "lucide-react";
import TransitionElement from "../TransitionElement";

interface PersonaSelectorProps {
  selectedPersona: string | undefined;
  onChange: (personaId: string) => void;
}

const PersonaSelector: React.FC<PersonaSelectorProps> = ({ 
  selectedPersona, 
  onChange 
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'zap':
        return <Zap className="h-5 w-5" />;
      case 'shield':
        return <Shield className="h-5 w-5" />;
      case 'trending-up':
        return <TrendingUp className="h-5 w-5" />;
      case 'book-open':
        return <BookOpen className="h-5 w-5" />;
      case 'bar-chart-2':
        return <BarChart2 className="h-5 w-5" />;
      default:
        return <Zap className="h-5 w-5" />;
    }
  };

  return (
    <TransitionElement delay={250} animation="fade">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground dark:text-white/90">
            AI Strategist Persona
          </label>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {personas.map((persona, index) => (
            <motion.div
              key={persona.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.2 }}
              className={cn(
                "relative cursor-pointer rounded-lg p-3 border-2 transition-all",
                "hover:bg-primary/5 hover:border-primary/40",
                selectedPersona === persona.id 
                  ? "border-primary bg-primary/10 dark:bg-primary/20" 
                  : "border-muted-foreground/20 dark:border-muted-foreground/10 bg-white/40 dark:bg-gray-800/40"
              )}
              onClick={() => onChange(persona.id)}
            >
              <div className="flex flex-col items-center text-center gap-2">
                <div className={cn(
                  "p-2 rounded-full",
                  selectedPersona === persona.id 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted text-muted-foreground"
                )}>
                  {getIcon(persona.icon)}
                </div>
                
                <span className="font-medium text-sm text-foreground dark:text-white">
                  {persona.name}
                </span>
                
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {persona.description}
                </p>
              </div>
              
              {selectedPersona === persona.id && (
                <div className="absolute -top-2 -right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </TransitionElement>
  );
};

export default PersonaSelector;
