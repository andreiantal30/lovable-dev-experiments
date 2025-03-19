
import React, { useState, useEffect, useRef } from 'react';
import { cn } from "@/lib/utils";

interface PromptCarouselProps {
  prompts: string[];
  isTyping: boolean;
  onPromptClick?: (prompt: string) => void;
  className?: string;
}

const PromptCarousel: React.FC<PromptCarouselProps> = ({
  prompts,
  isTyping,
  onPromptClick,
  className
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inactivityTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [showFallback, setShowFallback] = useState(false);

  // Function to rotate to the next prompt
  const rotatePrompt = () => {
    // Start fade out
    setIsFading(true);
    
    // After fade out completes, change the prompt and fade in
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % prompts.length);
      setIsFading(false);
    }, 300); // Match this with the CSS transition duration
  };

  // Reset carousel and start from the beginning
  const resetCarousel = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    setCurrentIndex(0);
    setIsVisible(true);
    setIsFading(false);
    setShowFallback(false);
    
    // Start the rotation again
    startRotation();
  };

  // Start the prompt rotation
  const startRotation = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Set timeout for next rotation (4.5 seconds)
    timeoutRef.current = setTimeout(() => {
      rotatePrompt();
    }, 4500);
    
    // Set inactivity timeout (30 seconds)
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
    }
    
    inactivityTimeoutRef.current = setTimeout(() => {
      setShowFallback(true);
    }, 30000);
  };

  // Effect to manage rotation and cleanup
  useEffect(() => {
    if (!isTyping && isVisible && !showFallback) {
      startRotation();
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
      }
    };
  }, [isTyping, isVisible, currentIndex, showFallback, prompts.length]);

  // Effect to handle typing state changes
  useEffect(() => {
    if (isTyping) {
      setIsVisible(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
      }
    } else {
      setIsVisible(true);
      resetCarousel();
    }
  }, [isTyping]);

  // Handler for clicking on a prompt
  const handlePromptClick = () => {
    if (onPromptClick && prompts[currentIndex]) {
      onPromptClick(prompts[currentIndex]);
    }
  };

  if (!isVisible || prompts.length === 0) {
    return null;
  }

  return (
    <div 
      className={cn(
        "text-muted-foreground dark:text-muted-foreground/70 text-sm cursor-pointer",
        "transition-opacity duration-300",
        isFading ? "opacity-0" : "opacity-100",
        className
      )}
      onClick={handlePromptClick}
    >
      {showFallback ? (
        <div className="flex items-center gap-1.5">
          <span className="text-primary">💡</span>
          Need more ideas? Ask for specific campaign tweaks!
        </div>
      ) : (
        prompts[currentIndex]
      )}
    </div>
  );
};

export default PromptCarousel;
