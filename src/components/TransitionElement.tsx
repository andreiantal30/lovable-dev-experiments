
import React, { useEffect, useState, ReactNode } from 'react';
import { cn } from "@/lib/utils";

interface TransitionElementProps {
  children: ReactNode;
  animation?: 'fade' | 'slide-up' | 'slide-down' | 'float';
  delay?: number;
  className?: string;
  threshold?: number;
  duration?: number;
}

const TransitionElement = ({
  children,
  animation = 'fade',
  delay = 0,
  className,
  threshold = 0.1,
  duration = 500,
}: TransitionElementProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold }
    );

    const element = ref.current;
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [threshold]);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    
    if (isInView) {
      timeout = setTimeout(() => {
        setIsVisible(true);
      }, delay);
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [isInView, delay]);

  const getAnimationClass = () => {
    switch (animation) {
      case 'fade':
        return isVisible ? 'opacity-100' : 'opacity-0';
      case 'slide-up':
        return isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-10';
      case 'slide-down':
        return isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 -translate-y-10';
      case 'float':
        return isVisible
          ? 'opacity-100 animate-float'
          : 'opacity-0';
      default:
        return isVisible ? 'opacity-100' : 'opacity-0';
    }
  };

  return (
    <div
      ref={ref}
      className={cn(
        getAnimationClass(),
        `transition-all duration-${duration} ease-out`,
        className
      )}
      style={{ 
        transitionDelay: `${delay}ms`,
        transitionDuration: `${duration}ms`
      }}
    >
      {children}
    </div>
  );
};

export default TransitionElement;
