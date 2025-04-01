
import React, { useState } from 'react';
import { cn } from "@/lib/utils";

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label: string;
  helperText?: string;
  type?: string;
  multiline?: boolean;
  rows?: number;
  error?: string;
  className?: string;
  inputClassName?: string;
  labelClassName?: string;
  chip?: string;
  placeholderFade?: boolean;
}

const InputField = ({
  label,
  helperText,
  type = 'text',
  multiline = false,
  rows = 3,
  error,
  className,
  inputClassName,
  labelClassName,
  chip,
  placeholderFade = false,
  ...props
}: InputFieldProps) => {
  const [focused, setFocused] = useState(false);
  const [filled, setFilled] = useState(!!props.value);
  const [isFadingPlaceholder, setIsFadingPlaceholder] = useState(false);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFocused(true);
    if (placeholderFade && !filled) {
      setIsFadingPlaceholder(true);
    }
    if (props.onFocus) props.onFocus(e as any);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFocused(false);
    const hasValue = !!e.target.value;
    setFilled(hasValue);
    
    if (placeholderFade && !hasValue) {
      setIsFadingPlaceholder(false);
    }
    
    if (props.onBlur) props.onBlur(e as any);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const hasValue = !!e.target.value;
    setFilled(hasValue);
    
    if (placeholderFade) {
      setIsFadingPlaceholder(hasValue);
    }
    
    if (props.onChange) props.onChange(e as any);
  };

  // Create placeholder styling class
  const placeholderClass = placeholderFade 
    ? isFadingPlaceholder || filled
      ? "placeholder:opacity-0"
      : "placeholder:opacity-100" 
    : "";

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center gap-2">
        <label 
          htmlFor={props.id} 
          className={cn(
            "text-sm font-medium transition-colors text-foreground dark:text-white/90",
            focused ? "text-primary dark:text-primary" : "",
            labelClassName
          )}
        >
          {label}
        </label>
        {chip && (
          <span className="text-xs font-medium px-2 py-0.5 bg-primary/10 text-primary dark:bg-primary/30 dark:text-primary-foreground rounded-full">
            {chip}
          </span>
        )}
      </div>
      
      {multiline ? (
        <textarea
          {...props as React.TextareaHTMLAttributes<HTMLTextAreaElement>}
          rows={rows}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          className={cn(
            "w-full px-3 py-2 rounded-lg glass-input",
            "placeholder:text-muted-foreground/60 dark:placeholder:text-white/40",
            "placeholder:transition-opacity placeholder:duration-300",
            placeholderClass,
            error ? "border-destructive/50 focus:ring-destructive/20" : "",
            inputClassName
          )}
        />
      ) : (
        <input
          {...props as React.InputHTMLAttributes<HTMLInputElement>}
          type={type}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          className={cn(
            "w-full h-10 px-3 rounded-lg glass-input",
            "placeholder:text-muted-foreground/60 dark:placeholder:text-white/40",
            "placeholder:transition-opacity placeholder:duration-300",
            placeholderClass,
            error ? "border-destructive/50 focus:ring-destructive/20" : "",
            inputClassName
          )}
        />
      )}
      
      {(helperText || error) && (
        <p className={cn(
          "text-xs",
          error 
            ? "text-destructive dark:text-red-400" 
            : "text-muted-foreground dark:text-white/70"
        )}>
          {error || helperText}
        </p>
      )}
    </div>
  );
};

export default InputField;
